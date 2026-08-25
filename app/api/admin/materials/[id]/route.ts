import { NextRequest, NextResponse } from "next/server"
import {
  getMaterialSpec,
  updateMaterialSpec,
  deleteMaterialSpec,
} from "@/lib/supabase/material-spec-service"

export const dynamic = "force-dynamic"

// GET /api/admin/materials/[id] → get a single material specification
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const spec = await getMaterialSpec(id)
  if (!spec) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(spec)
}

// PATCH /api/admin/materials/[id] → update a material specification
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  const result = await updateMaterialSpec(id, body)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/materials/[id] → delete a material specification
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = await deleteMaterialSpec(id)
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  return NextResponse.json({ ok: true })
}
