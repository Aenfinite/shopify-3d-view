// ============================================================================
// SERVER-ONLY — Material Specification service.
// ----------------------------------------------------------------------------
//   * CRUD for material_specifications (auto-generated 6-digit spec_id)
//   * Finishing master lookups
//   * Colour master lookups
//   * CSV export for the complete material database
// ============================================================================

import { getSupabaseAdmin } from "./admin-client"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Finishing {
  id: string
  code: string
  label: string
  sort_order: number
}

export interface Colour {
  id: string
  code: string
  label: string
  family_label: string
  family_range_start: number
  sort_order: number
}

export interface MaterialSpec {
  id: string
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
  product_specification: string | null
  fabric_composition: string | null
  fabric_width: string | null
  fabric_weight_gsm: string | null
  fabric_construction: string | null
  notes: string | null
  finishings: Finishing[]
  created_at: string
  updated_at: string
}

export interface MaterialSpecListItem {
  id: string
  spec_id: string
  supplier_code: string | null
  supplier_name: string | null
  supplier_article_number: string | null
  supplier_colour_number: string | null
  supplier_colour_name: string | null
  our_colour_code: string | null
  fabric_type: string | null
  fabric_composition: string | null
  fabric_weight_gsm: string | null
  notes: string | null
  finishings: string[]  // labels only for list view
  created_at: string
}

export interface MaterialSpecInput {
  supplier_code?: string | null
  supplier_name?: string | null
  supplier_article_number?: string | null
  supplier_colour_number?: string | null
  supplier_colour_name?: string | null
  our_colour_code?: string | null
  fabric_type?: string | null
  product_specification?: string | null
  fabric_composition?: string | null
  fabric_width?: string | null
  fabric_weight_gsm?: string | null
  fabric_construction?: string | null
  notes?: string | null
  finishing_ids?: string[]  // UUIDs of selected finishings
}

// ─── Finishing Master ───────────────────────────────────────────────────────

export async function listFinishings(): Promise<Finishing[]> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from("finishing_master")
    .select("id, code, label, sort_order")
    .order("sort_order")
  return (data as Finishing[]) ?? []
}

// ─── Colour Master ──────────────────────────────────────────────────────────

export async function listColours(): Promise<Colour[]> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from("colour_master")
    .select("id, code, label, family_label, family_range_start, sort_order")
    .order("sort_order")
  return (data as Colour[]) ?? []
}

export async function getColourByCode(code: string): Promise<Colour | null> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from("colour_master")
    .select("id, code, label, family_label, family_range_start, sort_order")
    .eq("code", code)
    .maybeSingle()
  return (data as Colour) ?? null
}

// ─── Material Specifications CRUD ───────────────────────────────────────────

export async function listMaterialSpecs(filters?: {
  supplier_code?: string
  search?: string
  colour_family?: string
  fabric_type?: string
}): Promise<MaterialSpecListItem[]> {
  const db = getSupabaseAdmin()
  let query = db
    .from("material_specifications")
    .select("id, spec_id, supplier_code, supplier_name, supplier_article_number, supplier_colour_number, supplier_colour_name, our_colour_code, fabric_type, fabric_composition, fabric_weight_gsm, notes, created_at")
    .order("created_at", { ascending: false })

  if (filters?.supplier_code) {
    query = query.eq("supplier_code", filters.supplier_code) as typeof query
  }
  if (filters?.fabric_type) {
    query = query.eq("fabric_type", filters.fabric_type) as typeof query
  }
  if (filters?.search) {
    const s = `%${filters.search}%`
    query = query.or(
      `spec_id.ilike.${s},supplier_name.ilike.${s},supplier_article_number.ilike.${s},supplier_colour_name.ilike.${s},fabric_composition.ilike.${s}`
    ) as typeof query
  }

  const { data: specs } = await query
  if (!specs || specs.length === 0) return []

  // Fetch finishings for all specs in one query
  const specIds = (specs as any[]).map((s) => s.id)
  const { data: finishingJoins } = await db
    .from("material_specification_finishings")
    .select("material_spec_id, finishing_master(label)")
    .in("material_spec_id", specIds)

  const finishingMap = new Map<string, string[]>()
  if (finishingJoins) {
    for (const fj of finishingJoins as any[]) {
      const arr = finishingMap.get(fj.material_spec_id) ?? []
      arr.push(fj.finishing_master?.label ?? "")
      finishingMap.set(fj.material_spec_id, arr)
    }
  }

  // Colour family filter (post-query since it's from colour_master)
  let result = (specs as any[]).map((s) => ({
    ...s,
    finishings: finishingMap.get(s.id) ?? [],
  })) as MaterialSpecListItem[]

  if (filters?.colour_family) {
    // Colour family is the range start, e.g. "140" for Navy Tones
    const rangeStart = parseInt(filters.colour_family, 10)
    const rangeEnd = rangeStart + 9
    result = result.filter((s) => {
      if (!s.our_colour_code) return false
      const code = parseInt(s.our_colour_code, 10)
      return code >= rangeStart && code <= rangeEnd
    })
  }

  return result
}

export async function getMaterialSpec(id: string): Promise<MaterialSpec | null> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from("material_specifications")
    .select("*")
    .eq("id", id)
    .single()
  if (error || !data) return null

  const spec = data as any

  // Get finishings
  const { data: finishingJoins } = await db
    .from("material_specification_finishings")
    .select("finishing_master(id, code, label, sort_order)")
    .eq("material_spec_id", id)

  const finishings = (finishingJoins as any[] ?? [])
    .map((fj) => fj.finishing_master)
    .filter(Boolean) as Finishing[]

  // Get colour info
  let our_colour_label: string | null = null
  let our_colour_family: string | null = null
  if (spec.our_colour_code) {
    const colour = await getColourByCode(spec.our_colour_code)
    if (colour) {
      our_colour_label = colour.label
      our_colour_family = colour.family_label
    }
  }

  return {
    id: spec.id,
    spec_id: spec.spec_id,
    supplier_code: spec.supplier_code,
    supplier_name: spec.supplier_name,
    supplier_article_number: spec.supplier_article_number,
    supplier_colour_number: spec.supplier_colour_number,
    supplier_colour_name: spec.supplier_colour_name,
    our_colour_code: spec.our_colour_code,
    our_colour_label,
    our_colour_family,
    fabric_type: spec.fabric_type,
    product_specification: spec.product_specification,
    fabric_composition: spec.fabric_composition,
    fabric_width: spec.fabric_width,
    fabric_weight_gsm: spec.fabric_weight_gsm,
    fabric_construction: spec.fabric_construction,
    notes: spec.notes,
    finishings,
    created_at: spec.created_at,
    updated_at: spec.updated_at,
  }
}

export async function getMaterialSpecBySpecId(specId: string): Promise<MaterialSpec | null> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from("material_specifications")
    .select("id")
    .eq("spec_id", specId)
    .maybeSingle()
  if (!data) return null
  return getMaterialSpec((data as any).id)
}

export async function createMaterialSpec(input: MaterialSpecInput): Promise<{ ok: boolean; error?: string; spec_id?: string; id?: string }> {
  const db = getSupabaseAdmin()

  const payload: Record<string, unknown> = {
    supplier_code: input.supplier_code?.trim() || null,
    supplier_name: input.supplier_name?.trim() || null,
    supplier_article_number: input.supplier_article_number?.trim() || null,
    supplier_colour_number: input.supplier_colour_number?.trim() || null,
    supplier_colour_name: input.supplier_colour_name?.trim() || null,
    our_colour_code: input.our_colour_code?.trim() || null,
    fabric_type: input.fabric_type?.trim() || null,
    product_specification: input.product_specification?.trim() || null,
    fabric_composition: input.fabric_composition?.trim() || null,
    fabric_width: input.fabric_width?.trim() || null,
    fabric_weight_gsm: input.fabric_weight_gsm?.trim() || null,
    fabric_construction: input.fabric_construction?.trim() || null,
    notes: input.notes?.trim() || null,
  }

  const { data, error } = await db
    .from("material_specifications")
    .insert(payload)
    .select("id, spec_id")
    .single()

  if (error) return { ok: false, error: error.message }
  const newSpec = data as any

  // Save finishings
  if (input.finishing_ids && input.finishing_ids.length > 0) {
    const finishingRows = input.finishing_ids.map((fid) => ({
      material_spec_id: newSpec.id,
      finishing_id: fid,
    }))
    await db.from("material_specification_finishings").insert(finishingRows)
  }

  return { ok: true, spec_id: newSpec.spec_id, id: newSpec.id }
}

export async function updateMaterialSpec(id: string, input: MaterialSpecInput): Promise<{ ok: boolean; error?: string }> {
  const db = getSupabaseAdmin()

  const payload: Record<string, unknown> = {
    supplier_code: input.supplier_code?.trim() || null,
    supplier_name: input.supplier_name?.trim() || null,
    supplier_article_number: input.supplier_article_number?.trim() || null,
    supplier_colour_number: input.supplier_colour_number?.trim() || null,
    supplier_colour_name: input.supplier_colour_name?.trim() || null,
    our_colour_code: input.our_colour_code?.trim() || null,
    fabric_type: input.fabric_type?.trim() || null,
    product_specification: input.product_specification?.trim() || null,
    fabric_composition: input.fabric_composition?.trim() || null,
    fabric_width: input.fabric_width?.trim() || null,
    fabric_weight_gsm: input.fabric_weight_gsm?.trim() || null,
    fabric_construction: input.fabric_construction?.trim() || null,
    notes: input.notes?.trim() || null,
  }

  const { error } = await db.from("material_specifications").update(payload).eq("id", id)
  if (error) return { ok: false, error: error.message }

  // Replace finishings
  await db.from("material_specification_finishings").delete().eq("material_spec_id", id)
  if (input.finishing_ids && input.finishing_ids.length > 0) {
    const finishingRows = input.finishing_ids.map((fid) => ({
      material_spec_id: id,
      finishing_id: fid,
    }))
    await db.from("material_specification_finishings").insert(finishingRows)
  }

  return { ok: true }
}

export async function deleteMaterialSpec(id: string): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from("material_specifications").delete().eq("id", id)
  return !error
}

// ─── CSV Export ─────────────────────────────────────────────────────────────

const BOM = "\uFEFF"

function escapeCell(value: unknown): string {
  const s = value == null ? "" : String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function exportMaterialSpecsCsv(): Promise<string> {
  const specs = await listMaterialSpecs()

  // Resolve colour labels
  const colours = await listColours()
  const colourMap = new Map(colours.map((c) => [c.code, c]))

  const HEADERS = [
    "Spec ID", "Supplier Code", "Supplier Name", "Supplier Article Number",
    "Supplier Colour Number", "Supplier Colour Name",
    "Our Colour Code", "Our Colour", "Colour Family",
    "Fabric Type", "Composition", "Width", "Weight (GSM)", "Construction",
    "Finishings", "Notes", "Created",
  ]

  const rows: string[] = [HEADERS.map(escapeCell).join(",")]

  for (const s of specs) {
    const colour = s.our_colour_code ? colourMap.get(s.our_colour_code) : null
    rows.push([
      s.spec_id,
      s.supplier_code ?? "",
      s.supplier_name ?? "",
      s.supplier_article_number ?? "",
      s.supplier_colour_number ?? "",
      s.supplier_colour_name ?? "",
      s.our_colour_code ?? "",
      colour?.label ?? "",
      colour?.family_label ?? "",
      s.fabric_type ?? "",
      s.fabric_composition ?? "",
      "",  // width not in list view, could be added
      s.fabric_weight_gsm ?? "",
      "",  // construction not in list view
      (s.finishings ?? []).join(", "),
      s.notes ?? "",
      s.created_at ? new Date(s.created_at).toISOString().slice(0, 10) : "",
    ].map(escapeCell).join(","))
  }

  return BOM + rows.join("\r\n")
}
