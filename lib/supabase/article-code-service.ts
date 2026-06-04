// ============================================================================
// SERVER-ONLY — Article-code service (SAFE CHINO 8-segment model).
// ----------------------------------------------------------------------------
//   * Segment-value lookups CRUD (admin manages suppliers, specs, variants...).
//   * SKU registry: build + persist a product_sku (article code per product+colour).
//   * Resolve & stamp a sub-order's article code from its (item_type, color) SKU.
// ============================================================================

import { getSupabaseAdmin } from "./admin-client"
import { generateArticleCode, validateArticleInput } from "../article-code/engine"
import { SEGMENTS, type SegmentKey } from "../article-code/segments"
import type { ArticleCodeInput } from "../article-code/types"

// ─── Segment value lookups ──────────────────────────────────────────────────

export interface SegmentValue {
  id: string
  segment_no: number
  code: string
  label: string
  supplier_code: string | null
  sort_order: number
}

export async function getSegmentValues(): Promise<SegmentValue[]> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from("article_segment_values")
    .select("id, segment_no, code, label, supplier_code, sort_order")
    .order("segment_no")
    .order("sort_order")
    .order("code")
  return (data as SegmentValue[]) ?? []
}

export async function upsertSegmentValue(row: {
  id?: string; segment_no: number; code: string; label: string; supplier_code?: string | null; sort_order?: number
}): Promise<{ ok: boolean; error?: string }> {
  const db = getSupabaseAdmin()
  const seg = SEGMENTS.find((s) => s.no === Number(row.segment_no))
  if (!seg) return { ok: false, error: "Unknown segment number" }
  const code = row.code.replace(/\D/g, "").padStart(seg.width, "0").slice(0, seg.width)
  const payload = {
    segment_no: seg.no,
    code,
    label: row.label.trim(),
    supplier_code: row.supplier_code?.trim() || null,
    sort_order: Number(row.sort_order) || 0,
  }
  const q = row.id
    ? db.from("article_segment_values").update(payload).eq("id", row.id)
    : db.from("article_segment_values").upsert(payload, { onConflict: "segment_no,code,supplier_code" })
  const { error } = await q
  return error ? { ok: false, error: error.message } : { ok: true }
}

export async function deleteSegmentValue(id: string): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from("article_segment_values").delete().eq("id", id)
  return !error
}

// ─── SKU registry ───────────────────────────────────────────────────────────

export interface ProductSku {
  id: string
  sku_key: string
  product_category: string
  color: string | null
  label: string | null
  fabric_composition: string | null
  article_human: string
  article_machine: string
}

export async function listSkus(): Promise<ProductSku[]> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from("product_skus")
    .select("id, sku_key, product_category, color, label, fabric_composition, article_human, article_machine")
    .order("product_category")
    .order("color")
  return (data as ProductSku[]) ?? []
}

export interface SkuInput {
  id?: string
  sku_key: string
  product_category: string
  color?: string | null
  label?: string | null
  fabric_composition?: string | null
  codes: ArticleCodeInput
}

/** Build the article code from segment codes and persist the SKU. */
export async function saveSku(input: SkuInput): Promise<{ ok: boolean; error?: string; human?: string; machine?: string }> {
  const validation = validateArticleInput(input.codes)
  if (!validation.ok) return { ok: false, error: validation.errors.join(" ") }

  const code = generateArticleCode(input.codes)
  const db = getSupabaseAdmin()
  const payload = {
    sku_key: input.sku_key.trim(),
    product_category: input.product_category.trim(),
    color: input.color?.trim() || null,
    label: input.label?.trim() || null,
    fabric_composition: input.fabric_composition?.trim() || null,
    target_group_code: input.codes.target_group,
    product_category_code: input.codes.product_category,
    fabric_family_code: input.codes.fabric_family,
    fabric_type_code: input.codes.fabric_type,
    supplier_code: input.codes.supplier,
    supplier_article_code: input.codes.supplier_article_no,
    specs_code: input.codes.specs_finishing,
    reserved_code: input.codes.reserved || null,
    article_human: code.human,
    article_machine: code.machine,
  }
  const q = input.id
    ? db.from("product_skus").update(payload).eq("id", input.id)
    : db.from("product_skus").upsert(payload, { onConflict: "sku_key" })
  const { error } = await q
  if (error) return { ok: false, error: error.message }
  return { ok: true, human: code.human, machine: code.machine }
}

export async function deleteSku(id: string): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from("product_skus").delete().eq("id", id)
  return !error
}

// ─── Resolve & stamp a sub-order's article code ─────────────────────────────

/** Look up the SKU for a (product_category, color) pair. */
export async function findSku(productCategory: string, color: string | null): Promise<ProductSku | null> {
  const db = getSupabaseAdmin()
  let q = db
    .from("product_skus")
    .select("id, sku_key, product_category, color, label, fabric_composition, article_human, article_machine")
    .eq("product_category", productCategory)
  q = color ? q.eq("color", color) : q.is("color", null)
  const { data } = await q.limit(1).maybeSingle()
  return (data as ProductSku) ?? null
}

/**
 * Resolve the article code for a sub-order from its item_type + color SKU and
 * persist it. Returns the SKU used, or null if no matching SKU exists.
 */
export async function stampSubOrderArticleCode(subOrderId: string): Promise<ProductSku | null> {
  const db = getSupabaseAdmin()
  const { data: sub } = await db
    .from("sub_orders")
    .select("id, item_type, garment_type, color")
    .eq("id", subOrderId)
    .single()
  if (!sub) return null

  const category = (sub.item_type ?? sub.garment_type) as string
  const sku = await findSku(category, (sub.color as string | null) ?? null)
  if (!sku) {
    // Clear any stale code so the UI shows "no SKU matched" rather than a wrong one.
    await db.from("sub_orders").update({ article_code_human: null, article_code_barcode: null }).eq("id", subOrderId)
    return null
  }
  await db
    .from("sub_orders")
    .update({ article_code_human: sku.article_human, article_code_barcode: sku.article_machine })
    .eq("id", subOrderId)
  return sku
}
