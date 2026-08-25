import { NextRequest, NextResponse } from "next/server"
import { parseArticleCode } from "@/lib/article-code/engine"
import { SEGMENTS } from "@/lib/article-code/segments"
import { getSegmentValues } from "@/lib/supabase/article-code-service"
import { getMaterialSpecBySpecId } from "@/lib/supabase/material-spec-service"
import { getSupabaseAdmin } from "@/lib/supabase/admin-client"

export const dynamic = "force-dynamic"

// GET /api/admin/sku-lookup?sku=1-01-01-01-005-143-000-000123
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const sku = url.searchParams.get("sku")?.trim()

  if (!sku) {
    return NextResponse.json({ error: "Provide a ?sku= query parameter" }, { status: 400 })
  }

  // Parse the SKU
  const parsed = parseArticleCode(sku)
  if (!parsed) {
    return NextResponse.json({ error: "Could not parse SKU. Expected 22-digit format (human or machine)." }, { status: 400 })
  }

  // Resolve segment labels
  const segValues = await getSegmentValues()
  const resolveLabel = (segNo: number, code: string | undefined) => {
    if (!code) return null
    return segValues.find((v) => v.segment_no === segNo && v.code === code)?.label ?? null
  }

  // Resolve colour
  const db = getSupabaseAdmin()
  let colourLabel: string | null = null
  let colourFamily: string | null = null
  if (parsed.our_colour) {
    const { data: colour } = await db
      .from("colour_master")
      .select("label, family_label")
      .eq("code", parsed.our_colour)
      .maybeSingle()
    if (colour) {
      colourLabel = (colour as any).label
      colourFamily = (colour as any).family_label
    }
  }

  // Resolve material specification
  let materialSpec = null
  if (parsed.material_spec_id) {
    materialSpec = await getMaterialSpecBySpecId(parsed.material_spec_id)
  }

  // Build decoded response
  const decoded = {
    raw_sku: sku,
    segments: SEGMENTS.map((seg) => ({
      no: seg.no,
      key: seg.key,
      name: seg.name,
      width: seg.width,
      code: parsed[seg.key] ?? "",
      label: seg.key === "our_colour"
        ? colourLabel
        : seg.key === "material_spec_id"
          ? materialSpec?.spec_id ?? null
          : resolveLabel(seg.no, parsed[seg.key]),
    })),
    colour: parsed.our_colour ? {
      code: parsed.our_colour,
      label: colourLabel,
      family: colourFamily,
    } : null,
    material_specification: materialSpec,
  }

  return NextResponse.json(decoded)
}
