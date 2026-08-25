import { NextRequest, NextResponse } from "next/server"
import {
  listMaterialSpecs,
  createMaterialSpec,
  listFinishings,
  listColours,
} from "@/lib/supabase/material-spec-service"

export const dynamic = "force-dynamic"

// GET /api/admin/materials → list all material specs + finishings + colours
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const supplier_code = url.searchParams.get("supplier_code") || undefined
  const search = url.searchParams.get("search") || undefined
  const colour_family = url.searchParams.get("colour_family") || undefined
  const fabric_type = url.searchParams.get("fabric_type") || undefined

  const [specs, finishings, colours] = await Promise.all([
    listMaterialSpecs({ supplier_code, search, colour_family, fabric_type }),
    listFinishings(),
    listColours(),
  ])

  return NextResponse.json({ specs, finishings, colours })
}

// POST /api/admin/materials → create a new material specification
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
  const result = await createMaterialSpec(body)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 })
  return NextResponse.json({ ok: true, spec_id: result.spec_id, id: result.id }, { status: 201 })
}
