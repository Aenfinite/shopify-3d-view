import { NextRequest, NextResponse } from "next/server"

// ── Product identifiers ───────────────────────────────────────────────────────
// Product: Custom-Made Jacket  (ID: 15735689707893)
// Variant: Default Title        (ID: 56782123762037)
const JACKET_VARIANT_ID = "56782123762037"

/**
 * POST /api/shopify/cart
 *
 * Creates a Shopify DRAFT ORDER with a CUSTOM PRICE (set by the configurator)
 * and all customization details as line item properties, then returns the
 * Shopify-native invoice_url for the customer to complete payment.
 *
 * Uses the Admin REST API (not Storefront API) so we can override the price.
 * Requires: SHOPIFY_STORE_DOMAIN + SHOPIFY_ADMIN_TOKEN env vars.
 *   - SHOPIFY_ADMIN_TOKEN: Shopify Admin → Settings → Apps → Develop apps →
 *     Your app → Admin API access token (scope: write_draft_orders)
 *
 * Body: { orderSummary: { totalPrice, basePrice, customizations, measurementData, ... } }
 */
export async function POST(request: NextRequest) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN
  const adminToken = process.env.SHOPIFY_ADMIN_TOKEN

  if (!domain || !adminToken) {
    return NextResponse.json(
      {
        error:
          "Shopify Admin not configured. Add SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_TOKEN to Vercel environment variables.",
      },
      { status: 500 }
    )
  }

  let orderSummary: any
  try {
    const body = await request.json()
    orderSummary = body.orderSummary
    if (!orderSummary) throw new Error("missing orderSummary")
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const totalPrice: number = Number(orderSummary.totalPrice) || 0

  // ── Build line item properties ────────────────────────────────────────────
  const properties: Array<{ name: string; value: string }> = []

  const add = (name: string, value: string | number | undefined | null) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      properties.push({ name, value: String(value) })
    }
  }

  // Customer identity
  add("Customer Email", orderSummary.customerEmail)
  add("Customer Name", orderSummary.customerName)
  if (orderSummary.shopifyCustomerId) add("Shopify Customer ID", orderSummary.shopifyCustomerId)

  // Configurator selections (fabric, buttons, lining, monogram, etc.)
  if (Array.isArray(orderSummary.customizations)) {
    orderSummary.customizations.forEach((c: { category: string; value: string; price?: number }) => {
      if (c.value) {
        const label =
          c.price && c.price > 0 ? `${c.value} (+€${Number(c.price).toFixed(2)})` : c.value
        add(c.category, label)
      }
    })
  }

  // Measurement mode
  if (orderSummary.measurementData) {
    const md = orderSummary.measurementData
    add("Measurement Type", md.sizeType === "custom" ? "Custom (Made-to-Measure)" : "Standard Size")
    if (md.standardSize) add("Standard Size", md.standardSize.toUpperCase())
    if (md.fitType) add("Fit Type", md.fitType)
    if (md.customMeasurementMethod)
      add("Measurement Method", md.customMeasurementMethod === "videos" ? "Video Tutorial" : "Sketch Guide")
    if (md.customMeasurements) {
      Object.entries(md.customMeasurements).forEach(([k, v]) => {
        if (v) add(`${k.charAt(0).toUpperCase() + k.slice(1)}`, `${v} cm`)
      })
    }
  }

  // Confirmed measurements from saved profile
  if (orderSummary.confirmedMeasurements) {
    Object.entries(orderSummary.confirmedMeasurements).forEach(([k, v]) => {
      if (v) add(`${k.charAt(0).toUpperCase() + k.slice(1)}`, `${v} cm`)
    })
  }

  // Pricing breakdown for store owner reference
  if (orderSummary.basePrice) add("Base Price", `€${Number(orderSummary.basePrice).toFixed(2)}`)

  // ── Create Draft Order via Shopify Admin REST API ─────────────────────────
  const endpoint = `https://${domain}/admin/api/2024-01/draft_orders.json`

  // Use a custom line item (no variant_id) so Shopify is forced to use
  // our price. When variant_id is set and the catalog price is €0.00,
  // Shopify ignores the price override and charges €0.00.
  const draftOrderPayload = {
    draft_order: {
      line_items: [
        {
          title: orderSummary.productName || "Custom-Made Jacket",
          price: totalPrice.toFixed(2), // ← Custom price from configurator
          quantity: 1,
          requires_shipping: true,
          taxable: true,
          properties,
        },
      ],
      // Pre-fill customer email so Shopify shows it at checkout
      ...(orderSummary.customerEmail ? { email: orderSummary.customerEmail } : {}),
      note: `Custom jacket order via 3D configurator.${orderSummary.customerEmail ? ` Customer: ${orderSummary.customerEmail}` : ""}`,
      tags: "3d-configurator,custom-jacket",
    },
  }

  let shopifyRes: any
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify(draftOrderPayload),
    })
    shopifyRes = await res.json()

    if (!res.ok) {
      console.error("Shopify Draft Order error:", JSON.stringify(shopifyRes))
      return NextResponse.json(
        { error: shopifyRes.errors || "Failed to create Shopify draft order" },
        { status: res.status }
      )
    }
  } catch {
    return NextResponse.json({ error: "Failed to reach Shopify Admin API" }, { status: 502 })
  }

  const invoiceUrl: string = shopifyRes?.draft_order?.invoice_url
  if (!invoiceUrl) {
    return NextResponse.json({ error: "No checkout URL returned from Shopify" }, { status: 500 })
  }

  // Return as checkoutUrl so checkout-modal.tsx requires zero changes
  return NextResponse.json({ checkoutUrl: invoiceUrl })
}
