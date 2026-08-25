// ============================================================================
// SERVER-ONLY — Orders + sub-orders read/update service for the admin dashboard.
// Uses the service-role client (bypasses RLS). Embedded selects rely on the
// FKs defined in migration 001; results are cast to explicit view types because
// the hand-written Database types don't model PostgREST relationships.
// ============================================================================

import { getSupabaseAdmin } from "./admin-client"
import type { OrderOrigin, OrderStatus, SubOrderStatus } from "./types"
import { type ItemRules } from "../packages/validate-selections"
import { validateSafeChinoSelections } from "../safe-chino/validate"
import { stampSubOrderArticleCode } from "./article-code-service"

export const ORDER_STATUSES: OrderStatus[] = [
  "pledge_received", "configuring", "confirmed", "in_production", "shipped", "cancelled",
]
export const SUB_ORDER_STATUSES: SubOrderStatus[] = [
  "pending", "configuring", "confirmed", "in_production", "completed", "cancelled",
]

export interface OrderListItem {
  id: string
  order_number: string
  origin: OrderOrigin
  status: OrderStatus
  total_value: number
  currency: string
  created_at: string
  customer_name: string
  customer_email: string
  package_name: string | null
  sub_order_count: number
}

export interface SubOrderDetail {
  id: string
  package_slot_index: number
  garment_type: string
  item_type: string | null
  color: string | null
  sub_order_ref: string | null
  status: SubOrderStatus
  article_code_human: string | null
  article_code_barcode: string | null
  configurator_selections: Record<string, unknown>
  measurement_id: string | null
}

export interface OrderDetail {
  id: string
  order_number: string
  origin: OrderOrigin
  status: OrderStatus
  kickstarter_ref: string | null
  packing_note: string | null
  total_value: number
  currency: string
  notes: string | null
  created_at: string
  customer: {
    id: string; name: string; email: string; phone: string | null
    shipping_address: Record<string, unknown> | null
  } | null
  package: { id: string; code: string; name: string; garment_count: number } | null
  sub_orders: SubOrderDetail[]
}

export async function listOrders(filters: { status?: string; origin?: string } = {}): Promise<OrderListItem[]> {
  const db = getSupabaseAdmin()
  let query = db
    .from("orders")
    .select("id, order_number, origin, status, total_value, currency, created_at, customers(name,email), packages(name), sub_orders(count)")
    .order("created_at", { ascending: false })

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status as OrderStatus) as typeof query
  if (filters.origin && filters.origin !== "all") query = query.eq("origin", filters.origin as OrderOrigin) as typeof query

  const { data, error } = await query
  if (error || !data) return []

  return (data as unknown as Array<Record<string, any>>).map((o) => ({
    id: o.id,
    order_number: o.order_number,
    origin: o.origin,
    status: o.status,
    total_value: o.total_value,
    currency: o.currency,
    created_at: o.created_at,
    customer_name: o.customers?.name ?? "",
    customer_email: o.customers?.email ?? "",
    package_name: o.packages?.name ?? null,
    sub_order_count: o.sub_orders?.[0]?.count ?? 0,
  }))
}

export async function getOrderDetail(id: string): Promise<OrderDetail | null> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from("orders")
    .select("id, order_number, origin, status, kickstarter_ref, packing_note, total_value, currency, notes, created_at, customers(id,name,email,phone,shipping_address), packages(id,code,name,garment_count)")
    .eq("id", id)
    .single()
  if (error || !data) return null

  const { data: subs } = await db
    .from("sub_orders")
    .select("id, package_slot_index, garment_type, item_type, color, sub_order_ref, status, article_code_human, article_code_barcode, configurator_selections, measurement_id")
    .eq("order_id", id)
    .order("package_slot_index")

  const o = data as unknown as Record<string, any>
  return {
    id: o.id,
    order_number: o.order_number,
    origin: o.origin,
    status: o.status,
    kickstarter_ref: o.kickstarter_ref ?? null,
    packing_note: o.packing_note ?? null,
    total_value: o.total_value,
    currency: o.currency,
    notes: o.notes,
    created_at: o.created_at,
    customer: o.customers ?? null,
    package: o.packages ?? null,
    sub_orders: (subs as unknown as SubOrderDetail[]) ?? [],
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from("orders").update({ status }).eq("id", id)
  return !error
}

export async function updateSubOrderStatus(id: string, status: SubOrderStatus): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from("sub_orders").update({ status }).eq("id", id)
  return !error
}

// ─── Sub-order configuration (configurator → order linkage) ──────────────────

export interface SubOrderFull {
  id: string
  order_id: string
  package_slot_index: number
  garment_type: string
  item_type: string | null
  color: string | null
  sub_order_ref: string | null
  product_id: string | null
  configurator_selections: Record<string, unknown>
  measurement_id: string | null
  article_code_human: string | null
  article_code_barcode: string | null
  status: SubOrderStatus
  notes: string | null
  customer_id: string | null
  customer_name: string | null
  package_item_rules: ItemRules | null
  package_allowed_garment_types: string[] | null
  /** Colour allow-list for this slot (from package_items). Empty = full catalog. */
  allowed_colors: string[]
  /** Per-slot constraints, e.g. {"sleeve":"long","shirt_color":"white-only"}. */
  item_constraints: Record<string, unknown>
}

/** Full sub-order incl. the parent order's customer + package + slot rules. */
export async function getSubOrderFull(id: string): Promise<SubOrderFull | null> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from("sub_orders")
    .select("id, order_id, package_slot_index, garment_type, item_type, color, sub_order_ref, product_id, configurator_selections, measurement_id, article_code_human, article_code_barcode, status, notes, orders(customer_id, customers(name), packages(item_rules, allowed_garment_types)), package_items(allowed_colors, constraints)")
    .eq("id", id)
    .single()
  if (error || !data) return null
  const o = data as unknown as Record<string, any>
  return {
    id: o.id,
    order_id: o.order_id,
    package_slot_index: o.package_slot_index,
    garment_type: o.garment_type,
    item_type: o.item_type ?? o.garment_type,
    color: o.color,
    sub_order_ref: o.sub_order_ref,
    product_id: o.product_id,
    configurator_selections: o.configurator_selections ?? {},
    measurement_id: o.measurement_id,
    article_code_human: o.article_code_human,
    article_code_barcode: o.article_code_barcode,
    status: o.status,
    notes: o.notes,
    customer_id: o.orders?.customer_id ?? null,
    customer_name: o.orders?.customers?.name ?? null,
    package_item_rules: o.orders?.packages?.item_rules ?? null,
    package_allowed_garment_types: o.orders?.packages?.allowed_garment_types ?? null,
    allowed_colors: o.package_items?.allowed_colors ?? [],
    item_constraints: o.package_items?.constraints ?? {},
  }
}

export interface SaveConfigInput {
  selections: Record<string, unknown>
  color?: string | null
  productId?: string | null
  notes?: string | null
  /** When true, validation failures block the save; otherwise saved as a draft. */
  confirm?: boolean
}

export interface SaveConfigResult {
  ok: boolean
  errors?: string[]
  articleCodeHuman?: string | null
  articleCodeBarcode?: string | null
}

/**
 * Persist the configurator selections onto a sub-order. Enforces the package's
 * item_rules + this slot's colour allow-list, resolves the article code from the
 * matching SKU, and — when `confirm` is set — advances status to 'confirmed'.
 */
export async function saveSubOrderConfiguration(id: string, input: SaveConfigInput): Promise<SaveConfigResult> {
  const db = getSupabaseAdmin()
  const sub = await getSubOrderFull(id)
  if (!sub) return { ok: false, errors: ["Sub-order not found"] }

  const color = (input.color ?? sub.color ?? null) as string | null

  const validation = validateSafeChinoSelections({
    itemType: sub.item_type ?? sub.garment_type,
    color,
    selections: input.selections,
    allowedColors: sub.allowed_colors,
    constraints: sub.item_constraints,
  })
  const errors = validation.errors

  if (errors.length && input.confirm) return { ok: false, errors }

  const { error } = await db
    .from("sub_orders")
    .update({
      configurator_selections: input.selections,
      color,
      product_id: input.productId ?? sub.product_id,
      notes: input.notes ?? sub.notes,
      status: input.confirm ? "confirmed" : (sub.status === "pending" ? "configuring" : sub.status),
    })
    .eq("id", id)
  if (error) return { ok: false, errors: [error.message] }

  const sku = await stampSubOrderArticleCode(id)

  return {
    ok: true,
    errors: errors.length ? errors : undefined, // non-blocking warnings when not confirming
    articleCodeHuman: sku?.article_human ?? null,
    articleCodeBarcode: sku?.article_machine ?? null,
  }
}

// ─── Full order fetch for production-sheet / CSV export ──────────────────────

export interface ExportSubOrder {
  package_slot_index: number
  sub_order_ref: string | null
  garment_type: string
  item_type: string | null
  color: string | null
  status: SubOrderStatus
  product_id: string | null
  configurator_selections: Record<string, unknown>
  article_code_human: string | null
  article_code_barcode: string | null
  measurement: {
    raw_values: Record<string, number>
    production_values: Record<string, number>
    allowances: Record<string, number>
    unit: string
    version: number
    locked: boolean
    locked_at: string | null
  } | null
  material_specification?: {
    spec_id: string
    supplier_code: string | null
    supplier_name: string | null
    supplier_article_number: string | null
    supplier_colour_number: string | null
    supplier_colour_name: string | null
    our_colour_code: string | null
    our_colour_label: string | null
    our_colour_family: string | null
    fabric_type: string | null
    fabric_composition: string | null
    fabric_width: string | null
    fabric_weight_gsm: string | null
    fabric_construction: string | null
    finishings: Array<{ code: string; label: string }>
    notes: string | null
  } | null
}

export interface ExportOrder {
  id: string
  order_number: string
  origin: OrderOrigin
  status: OrderStatus
  kickstarter_ref: string | null
  packing_note: string | null
  total_value: number
  currency: string
  created_at: string
  customer: { name: string; email: string; phone: string | null; shipping_address: Record<string, unknown> | null } | null
  package: { code: string; name: string } | null
  sub_orders: ExportSubOrder[]
}

import { parseArticleCode } from "../article-code/engine"
import { getMaterialSpecBySpecId } from "./material-spec-service"

export async function getOrderForExport(id: string): Promise<ExportOrder | null> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from("orders")
    .select("id, order_number, origin, status, kickstarter_ref, packing_note, total_value, currency, created_at, customers(name,email,phone,shipping_address), packages(code,name)")
    .eq("id", id)
    .single()
  if (error || !data) return null

  const { data: subs } = await db
    .from("sub_orders")
    .select("package_slot_index, sub_order_ref, garment_type, item_type, color, status, product_id, configurator_selections, article_code_human, article_code_barcode, measurements(raw_values, production_values, allowances, unit, version, locked, locked_at)")
    .eq("order_id", id)
    .order("package_slot_index")

  const o = data as unknown as Record<string, any>
  const result: ExportOrder = {
    id: o.id,
    order_number: o.order_number,
    origin: o.origin,
    status: o.status,
    kickstarter_ref: o.kickstarter_ref ?? null,
    packing_note: o.packing_note ?? null,
    total_value: o.total_value,
    currency: o.currency,
    created_at: o.created_at,
    customer: o.customers ?? null,
    package: o.packages ?? null,
    sub_orders: ((subs as unknown as Array<Record<string, any>>) ?? []).map((s) => ({
      package_slot_index: s.package_slot_index,
      sub_order_ref: s.sub_order_ref,
      garment_type: s.garment_type,
      item_type: s.item_type,
      color: s.color,
      status: s.status,
      product_id: s.product_id,
      configurator_selections: s.configurator_selections ?? {},
      article_code_human: s.article_code_human,
      article_code_barcode: s.article_code_barcode,
      measurement: s.measurements
        ? {
            raw_values: s.measurements.raw_values ?? {},
            production_values: s.measurements.production_values ?? {},
            allowances: s.measurements.allowances ?? {},
            unit: s.measurements.unit ?? "cm",
            version: s.measurements.version ?? 1,
            locked: !!s.measurements.locked,
            locked_at: s.measurements.locked_at ?? null,
          }
        : null,
    }))
  }

  // Fetch material specifications for each sub-order based on the SKU
  for (const sub of result.sub_orders) {
    if (sub.article_code_barcode) {
      const parsed = parseArticleCode(sub.article_code_barcode)
      if (parsed?.material_spec_id) {
        const ms = await getMaterialSpecBySpecId(parsed.material_spec_id)
        if (ms) {
          sub.material_specification = {
            spec_id: ms.spec_id,
            supplier_code: ms.supplier_code,
            supplier_name: ms.supplier_name,
            supplier_article_number: ms.supplier_article_number,
            supplier_colour_number: ms.supplier_colour_number,
            supplier_colour_name: ms.supplier_colour_name,
            our_colour_code: ms.our_colour_code,
            our_colour_label: ms.our_colour_label,
            our_colour_family: ms.our_colour_family,
            fabric_type: ms.fabric_type,
            fabric_composition: ms.fabric_composition,
            fabric_width: ms.fabric_width,
            fabric_weight_gsm: ms.fabric_weight_gsm,
            fabric_construction: ms.fabric_construction,
            finishings: ms.finishings.map((f: any) => ({ code: f.code, label: f.label })),
            notes: ms.notes,
          }
        }
      }
    }
  }

  return result
}
