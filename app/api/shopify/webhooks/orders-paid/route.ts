import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin-client"
import { parseArticleCode } from "@/lib/article-code/engine"
import crypto from "crypto"

export const dynamic = "force-dynamic"

// Disable body parsing — we need the raw body for HMAC verification
export const runtime = "nodejs"

/**
 * POST /api/shopify/webhooks/orders-paid
 *
 * Shopify calls this endpoint when an order is paid. It:
 * 1. Verifies the HMAC signature
 * 2. Extracts customer, order, and line item data
 * 3. Creates or updates the customer in our database
 * 4. Creates a master order + sub-orders
 * 5. Links SKU → Material Specification ID for production sheet enrichment
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  const rawBody = await request.text()

  // ── HMAC Signature Verification ─────────────────────────────────────────
  if (secret) {
    const hmacHeader = request.headers.get("x-shopify-hmac-sha256")
    if (hmacHeader) {
      const computedHmac = crypto
        .createHmac("sha256", secret)
        .update(rawBody, "utf8")
        .digest("base64")
      if (computedHmac !== hmacHeader) {
        console.error("[Shopify Webhook] HMAC verification failed")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // ── Idempotency check ───────────────────────────────────────────────────
  const shopifyOrderId = String(payload.id)
  const { data: existingOrder } = await db
    .from("orders")
    .select("id")
    .eq("shopify_draft_order_id", shopifyOrderId)
    .maybeSingle()

  if (existingOrder) {
    // Already processed — return 200 to prevent Shopify from retrying
    return NextResponse.json({ ok: true, message: "Already processed" })
  }

  // ── Extract customer data ───────────────────────────────────────────────
  const shopifyCustomer = payload.customer || {}
  const shippingAddress = payload.shipping_address || payload.billing_address || {}
  const customerEmail = shopifyCustomer.email || payload.email || payload.contact_email || ""
  const customerName = [shopifyCustomer.first_name, shopifyCustomer.last_name].filter(Boolean).join(" ") || "Shopify Customer"
  const customerPhone = shopifyCustomer.phone || shippingAddress.phone || null

  if (!customerEmail) {
    console.error("[Shopify Webhook] No customer email found in order", shopifyOrderId)
    return NextResponse.json({ error: "No customer email" }, { status: 400 })
  }

  // ── Upsert customer ────────────────────────────────────────────────────
  const { data: existingCustomer } = await db
    .from("customers")
    .select("id")
    .eq("email", customerEmail)
    .maybeSingle()

  let customerId: string
  if (existingCustomer) {
    customerId = (existingCustomer as any).id
    // Update shipping address if we have new data
    if (shippingAddress.address1) {
      await db.from("customers").update({
        name: customerName,
        phone: customerPhone,
        shipping_address: {
          line1: shippingAddress.address1 || "",
          line2: shippingAddress.address2 || "",
          city: shippingAddress.city || "",
          state: shippingAddress.province || "",
          postalCode: shippingAddress.zip || "",
          country: shippingAddress.country || "",
        },
        shopify_customer_id: shopifyCustomer.id ? String(shopifyCustomer.id) : null,
      }).eq("id", customerId)
    }
  } else {
    const { data: newCustomer, error: custErr } = await db
      .from("customers")
      .insert({
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        source: "shopify" as const,
        shopify_customer_id: shopifyCustomer.id ? String(shopifyCustomer.id) : null,
        shipping_address: {
          line1: shippingAddress.address1 || "",
          line2: shippingAddress.address2 || "",
          city: shippingAddress.city || "",
          state: shippingAddress.province || "",
          postalCode: shippingAddress.zip || "",
          country: shippingAddress.country || "",
        },
      })
      .select("id")
      .single()

    if (custErr || !newCustomer) {
      console.error("[Shopify Webhook] Failed to create customer:", custErr?.message)
      return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
    }
    customerId = (newCustomer as any).id
  }

  // ── Generate order number ──────────────────────────────────────────────
  const { data: lastOrder } = await db
    .from("orders")
    .select("order_number")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  let nextNum = 1
  if (lastOrder) {
    const match = (lastOrder as any).order_number?.match(/\d+/)
    if (match) nextNum = parseInt(match[0], 10) + 1
  }
  const orderNumber = `SH-${String(nextNum).padStart(5, "0")}`

  // ── Create master order ────────────────────────────────────────────────
  const totalPrice = parseFloat(payload.total_price || "0")
  const currency = payload.currency || "EUR"

  const { data: newOrder, error: orderErr } = await db
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      origin: "shopify" as const,
      shopify_draft_order_id: shopifyOrderId,
      status: "configuring" as const,
      total_value: totalPrice,
      currency: currency.toUpperCase(),
      notes: `Shopify order #${payload.order_number || payload.name || shopifyOrderId}`,
    })
    .select("id")
    .single()

  if (orderErr || !newOrder) {
    console.error("[Shopify Webhook] Failed to create order:", orderErr?.message)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
  const orderId = (newOrder as any).id

  // ── Create sub-orders from line items ──────────────────────────────────
  const lineItems = payload.line_items || []
  for (let i = 0; i < lineItems.length; i++) {
    const item = lineItems[i]
    const sku = item.sku || ""
    const properties = item.properties || []

    // Extract configurator selections from line item properties
    const selections: Record<string, unknown> = {}
    let itemColor: string | null = null
    let itemType: string | null = null
    const measurementData: Record<string, number> = {}

    for (const prop of properties) {
      const name = prop.name || ""
      const value = prop.value || ""

      if (name === "Fabric") selections["fabric"] = value
      else if (name === "Fabric_Color" || name === "Color") itemColor = value
      else if (name === "Mode") selections["mode"] = value
      else if (name === "Fit_Preference") selections["fit_preference"] = value
      else if (name === "Shoulder_Type") selections["shoulder_type"] = value
      else if (name === "Back_Shape") selections["back_shape"] = value
      else if (name === "Belly_Type") selections["belly_type"] = value
      else if (name.startsWith("Style_")) {
        selections[name.replace("Style_", "").toLowerCase()] = value
      } else if (name.startsWith("Measurement_")) {
        const measureKey = name.replace("Measurement_", "").toLowerCase()
        const numVal = parseFloat(value)
        if (!isNaN(numVal)) measurementData[measureKey] = numVal
      } else {
        selections[name.toLowerCase().replace(/\s+/g, "_")] = value
      }
    }

    // Try to determine item type from SKU or product title
    const productTitle = (item.title || "").toLowerCase()
    if (productTitle.includes("chino")) itemType = "chino"
    else if (productTitle.includes("shirt")) itemType = "shirt"
    else if (productTitle.includes("jacket")) itemType = "jacket"
    else if (productTitle.includes("belt")) itemType = "belt"
    else if (productTitle.includes("trouser") || productTitle.includes("pant")) itemType = "trousers"
    else itemType = productTitle.split(" ")[0] || "unknown"

    // Parse SKU to extract material_spec_id if it's a valid 22-digit code
    let articleHuman: string | null = null
    let articleMachine: string | null = null
    if (sku) {
      const parsed = parseArticleCode(sku)
      if (parsed && parsed.material_spec_id) {
        // Reconstruct the article codes
        const { generateArticleCode: gen } = await import("@/lib/article-code/engine")
        try {
          const code = gen(parsed as any)
          articleHuman = code.human
          articleMachine = code.machine
        } catch {
          // If parsing fails, store the raw SKU
          articleHuman = sku
          articleMachine = sku.replace(/\D/g, "")
        }
      }
    }

    const subOrderRef = `${orderNumber} (${i + 1}-${lineItems.length})`

    await db.from("sub_orders").insert({
      order_id: orderId,
      package_slot_index: i,
      garment_type: itemType,
      item_type: itemType,
      color: itemColor,
      sub_order_ref: subOrderRef,
      configurator_selections: selections,
      article_code_human: articleHuman,
      article_code_barcode: articleMachine,
      status: "configuring" as const,
    })

    // If we have measurement data, create a measurement record
    if (Object.keys(measurementData).length > 0) {
      await db.from("measurements").insert({
        customer_id: customerId,
        garment_type: itemType,
        raw_values: measurementData,
        allowances: {},
        production_values: measurementData,
        unit: "cm",
        version: 1,
        locked: false,
      })
    }
  }

  console.log(`[Shopify Webhook] Created order ${orderNumber} with ${lineItems.length} sub-orders from Shopify order ${shopifyOrderId}`)

  return NextResponse.json({
    ok: true,
    order_number: orderNumber,
    order_id: orderId,
    sub_order_count: lineItems.length,
  })
}
