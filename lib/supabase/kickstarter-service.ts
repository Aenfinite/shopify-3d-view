// ============================================================================
// SERVER-ONLY — Kickstarter import service
// ----------------------------------------------------------------------------
// Turns a KickstarterSource's NormalizedBacker[] into customers + orders +
// sub_orders. Idempotent: re-running the same export updates existing orders
// instead of duplicating them. Dedupe key per backer is backer_uid (falls back
// to email). One backer = one order with N sub-orders (one per package slot).
// ============================================================================

import { getSupabaseAdmin } from "./admin-client"
import type { KickstarterSource, ImportResult, NormalizedBacker } from "../kickstarter/types"

/** Resolve a raw pledge-tier label to a package id (best-effort, case-insensitive). */
async function resolvePackage(tierLabel: string): Promise<{ id: string; garment_count: number; allowed_garment_types: string[] } | null> {
  if (!tierLabel) return null
  const db = getSupabaseAdmin()
  const { data } = await db.from("packages").select("id, code, name, garment_count, allowed_garment_types").eq("is_active", true)
  if (!data?.length) return null
  const norm = (s: string) => s.toLowerCase().trim()
  const target = norm(tierLabel)
  // Exact code/name match first, then "label contains package name".
  const match =
    data.find((p) => norm(p.code) === target || norm(p.name) === target) ??
    data.find((p) => target.includes(norm(p.name)) || target.includes(norm(p.code)))
  return match ? { id: match.id, garment_count: match.garment_count, allowed_garment_types: match.allowed_garment_types } : null
}

/** Next sequential order number, e.g. SC-00001 (SAFE CHINO campaign). */
async function nextOrderNumber(): Promise<string> {
  const db = getSupabaseAdmin()
  const { count } = await db.from("orders").select("*", { count: "exact", head: true }).eq("origin", "kickstarter")
  return `SC-${String((count ?? 0) + 1).padStart(5, "0")}`
}

/** Package composition (items × quantity) for spawning sub-orders. */
async function getPackageItems(packageId: string): Promise<Array<{
  id: string; item_type: string; quantity: number; allowed_colors: string[]; constraints: Record<string, unknown>; sort_order: number
}>> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from("package_items")
    .select("id, item_type, quantity, allowed_colors, constraints, sort_order")
    .eq("package_id", packageId)
    .order("sort_order")
  return (data as any[]) ?? []
}

async function upsertCustomer(b: NormalizedBacker): Promise<string | null> {
  const db = getSupabaseAdmin()
  const payload = {
    email: b.email,
    name: b.name,
    shipping_address: b.shippingAddress ?? null,
    source: "kickstarter" as const,
    kickstarter_backer_uid: b.backerUid || null,
  }
  // Match an existing customer by backer uid, then by email.
  let existing: { id: string } | null = null
  if (b.backerUid) {
    const { data } = await db.from("customers").select("id").eq("kickstarter_backer_uid", b.backerUid).maybeSingle()
    existing = data
  }
  if (!existing && b.email) {
    const { data } = await db.from("customers").select("id").ilike("email", b.email).maybeSingle()
    existing = data
  }
  if (existing) {
    await db.from("customers").update(payload).eq("id", existing.id)
    return existing.id
  }
  const { data, error } = await db.from("customers").insert(payload).select("id").single()
  return error ? null : data.id
}

export async function importBackers(
  source: KickstarterSource,
  opts: { filename?: string; fileHash?: string; createdBy?: string; columnMapping?: Record<string, unknown> } = {},
): Promise<ImportResult> {
  const db = getSupabaseAdmin()
  const backers = await source.fetchBackers()
  const errors: string[] = []

  const { data: imp, error: impErr } = await db
    .from("kickstarter_imports")
    .insert({
      source: source.kind,
      filename: opts.filename ?? null,
      file_hash: opts.fileHash ?? null,
      raw_row_count: backers.length,
      column_mapping: opts.columnMapping ?? null,
      status: "pending",
      created_by: opts.createdBy ?? null,
    })
    .select("id")
    .single()

  if (impErr || !imp) {
    return { importId: "", rawRowCount: backers.length, importedCount: 0, updatedCount: 0, skippedCount: 0, errors: [impErr?.message ?? "failed to create import"] }
  }

  let importedCount = 0, updatedCount = 0, skippedCount = 0

  for (const b of backers) {
    try {
      if (!b.email && !b.backerUid) { skippedCount++; continue }

      const customerId = await upsertCustomer(b)
      if (!customerId) { errors.push(`customer upsert failed for ${b.email || b.backerUid}`); skippedCount++; continue }

      const pkg = await resolvePackage(b.pledgeTierLabel)

      // Record the raw backer row (always — audit trail).
      const { data: backerRow } = await db
        .from("kickstarter_backers")
        .insert({
          import_id: imp.id,
          backer_uid: b.backerUid || null,
          email: b.email || null,
          name: b.name || null,
          pledge_tier_label: b.pledgeTierLabel || null,
          quantity: b.quantity,
          pledge_amount: b.pledgeAmount ?? null,
          currency: b.currency ?? null,
          reward_title: b.rewardTitle ?? null,
          addons_raw: b.addonsRaw ?? null,
          raw_json: b.raw,
          matched_customer_id: customerId,
        })
        .select("id")
        .single()

      // Errored/dropped/cancelled pledges are logged for audit but never enter
      // production. If they later collect and reappear in a re-import, the
      // order gets created then.
      if (!b.collected) { skippedCount++; continue }

      // One KS order per customer — re-imports update, never duplicate.
      const { data: existingOrder } = await db
        .from("orders")
        .select("id")
        .eq("customer_id", customerId)
        .eq("origin", "kickstarter")
        .maybeSingle()

      if (existingOrder) {
        await db.from("orders").update({
          package_id: pkg?.id ?? null,
          total_value: b.pledgeAmount ?? 0,
          currency: b.currency ?? "EUR",
          kickstarter_backer_id: backerRow?.id ?? null,
        }).eq("id", existingOrder.id)
        if (backerRow) await db.from("kickstarter_backers").update({ matched_order_id: existingOrder.id }).eq("id", backerRow.id)
        updatedCount++
        continue
      }

      const orderNumber = await nextOrderNumber()
      const { data: order, error: orderErr } = await db
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_id: customerId,
          package_id: pkg?.id ?? null,
          origin: "kickstarter",
          kickstarter_backer_id: backerRow?.id ?? null,
          kickstarter_ref: orderNumber,
          packing_note: "All items in one parcel",
          status: "pledge_received",
          total_value: b.pledgeAmount ?? 0,
          currency: b.currency ?? "EUR",
        })
        .select("id")
        .single()

      if (orderErr || !order) { errors.push(`order create failed for ${b.email}: ${orderErr?.message}`); skippedCount++; continue }
      if (backerRow) await db.from("kickstarter_backers").update({ matched_order_id: order.id }).eq("id", backerRow.id)

      // Spawn sub-orders from the package's item composition (chino/shirt/belt),
      // each item expanded by its quantity × the reward quantity. Falls back to a
      // single generic slot if the package has no item rows defined yet.
      const items = pkg?.id ? await getPackageItems(pkg.id) : []
      const slots: Array<{ item_type: string; package_item_id: string | null }> = []
      if (items.length) {
        for (const it of items) {
          for (let q = 0; q < it.quantity * b.quantity; q++) slots.push({ item_type: it.item_type, package_item_id: it.id })
        }
      } else {
        const count = (pkg?.garment_count ?? 1) * b.quantity
        const fallbackType = pkg?.allowed_garment_types?.[0] ?? "chino"
        for (let i = 0; i < count; i++) slots.push({ item_type: fallbackType, package_item_id: null })
      }

      const total = slots.length
      const subOrders = slots.map((slot, i) => ({
        order_id: order.id,
        package_slot_index: i,
        garment_type: slot.item_type,
        item_type: slot.item_type,
        package_item_id: slot.package_item_id,
        sub_order_ref: `${orderNumber} (${i + 1}-${total})`,
        status: "pending" as const,
      }))
      await db.from("sub_orders").insert(subOrders)

      importedCount++
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e))
      skippedCount++
    }
  }

  await db.from("kickstarter_imports").update({
    imported_count: importedCount,
    updated_count: updatedCount,
    skipped_count: skippedCount,
    status: errors.length && importedCount === 0 && updatedCount === 0 ? "failed" : "completed",
    error_message: errors.length ? errors.slice(0, 20).join("; ") : null,
  }).eq("id", imp.id)

  return { importId: imp.id, rawRowCount: backers.length, importedCount, updatedCount, skippedCount, errors }
}
