// ============================================================================
// SERVER-ONLY — Article-code service (22-digit Material Management model).
// ----------------------------------------------------------------------------
//   * Segment-value lookups CRUD (admin manages suppliers, colours, specs...)
//   * SKU registry: build + persist a product_sku (article code per product+colour)
//   * Resolve & stamp a sub-order's article code from its (item_type, color) SKU
//   * CSV export of the complete SKU database with readable info
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
    supplier_article_code: null,    // deprecated in new model
    specs_code: null,               // deprecated in new model
    our_colour_code: input.codes.our_colour,
    material_spec_id: input.codes.material_spec_id,
    reserved_code: input.codes.reserved || "000",
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

// ─── SKU CSV Export ─────────────────────────────────────────────────────────

const BOM = "\uFEFF"

function escapeCell(value: unknown): string {
  const s = value == null ? "" : String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function exportSkusCsv(): Promise<string> {
  const db = getSupabaseAdmin()
  const { data: skuRows } = await db
    .from("product_skus")
    .select("*")
    .order("product_category")
    .order("color")

  if (!skuRows || skuRows.length === 0) return BOM + "No SKUs"

  // Load segment values for readable labels
  const segVals = await getSegmentValues()
  const segLookup = (segNo: number, code: string | null) => {
    if (!code) return ""
    return segVals.find((v) => v.segment_no === segNo && v.code === code)?.label ?? code
  }

  // Load colours
  const { data: colourRows } = await db
    .from("colour_master")
    .select("code, label, family_label")
  const colourMap = new Map((colourRows as any[] ?? []).map((c: any) => [c.code, c]))

  // Load material specs
  const { data: matRows } = await db
    .from("material_specifications")
    .select("spec_id, supplier_article_number, supplier_colour_number, supplier_colour_name, fabric_composition, fabric_construction, fabric_weight_gsm, fabric_width")
  const matMap = new Map((matRows as any[] ?? []).map((m: any) => [m.spec_id, m]))

  // Load material finishings
  const { data: matFinishings } = await db
    .from("material_specification_finishings")
    .select("material_spec_id, finishing_master(label)")

  const { data: matSpecs } = await db
    .from("material_specifications")
    .select("id, spec_id")
  const specIdToUuid = new Map((matSpecs as any[] ?? []).map((m: any) => [m.spec_id, m.id]))

  const finishingsBySpec = new Map<string, string[]>()
  for (const mf of (matFinishings as any[] ?? [])) {
    const specUuid = mf.material_spec_id
    const arr = finishingsBySpec.get(specUuid) ?? []
    arr.push(mf.finishing_master?.label ?? "")
    finishingsBySpec.set(specUuid, arr)
  }

  const HEADERS = [
    "SKU (Human)", "SKU (Machine)", "SKU Key", "Label",
    "Target Group Code", "Target Group", "Product Category Code", "Product Category",
    "Fabric Family Code", "Fabric Family", "Fabric Type Code", "Fabric Type",
    "Supplier Code", "Supplier", "Our Colour Code", "Our Colour", "Colour Family",
    "Reserved", "Material Spec ID",
    "Supplier Article #", "Supplier Colour #", "Supplier Colour Name",
    "Composition", "Construction", "Weight (GSM)", "Width", "Finishings",
    "Created",
  ]

  const rows: string[] = [HEADERS.map(escapeCell).join(",")]

  for (const sku of skuRows as any[]) {
    const colourInfo = sku.our_colour_code ? colourMap.get(sku.our_colour_code) : null
    const mat = sku.material_spec_id ? matMap.get(sku.material_spec_id) : null
    const matUuid = sku.material_spec_id ? specIdToUuid.get(sku.material_spec_id) : null
    const finishings = matUuid ? (finishingsBySpec.get(matUuid) ?? []) : []

    rows.push([
      sku.article_human,
      sku.article_machine,
      sku.sku_key,
      sku.label ?? "",
      sku.target_group_code, segLookup(1, sku.target_group_code),
      sku.product_category_code, segLookup(2, sku.product_category_code),
      sku.fabric_family_code, segLookup(3, sku.fabric_family_code),
      sku.fabric_type_code, segLookup(4, sku.fabric_type_code),
      sku.supplier_code, segLookup(5, sku.supplier_code),
      sku.our_colour_code ?? "", (colourInfo as any)?.label ?? "", (colourInfo as any)?.family_label ?? "",
      sku.reserved_code ?? "000",
      sku.material_spec_id ?? "",
      mat?.supplier_article_number ?? "",
      mat?.supplier_colour_number ?? "",
      mat?.supplier_colour_name ?? "",
      mat?.fabric_composition ?? "",
      mat?.fabric_construction ?? "",
      mat?.fabric_weight_gsm ?? "",
      mat?.fabric_width ?? "",
      finishings.join(", "),
      sku.created_at ? new Date(sku.created_at).toISOString().slice(0, 10) : "",
    ].map(escapeCell).join(","))
  }

  return BOM + rows.join("\r\n")
}
