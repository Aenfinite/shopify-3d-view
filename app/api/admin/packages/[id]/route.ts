import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin-client"
import type { Database } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

type PackageUpdate = Database["public"]["Tables"]["packages"]["Update"]

// PATCH /api/admin/packages/[id] → update
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const updates: PackageUpdate = {}
  if (body.code !== undefined) updates.code = String(body.code).trim()
  if (body.name !== undefined) updates.name = String(body.name).trim()
  if (body.description !== undefined) updates.description = body.description
  if (body.garment_count !== undefined) updates.garment_count = Number(body.garment_count) || 1
  if (body.allowed_garment_types !== undefined) updates.allowed_garment_types = body.allowed_garment_types
  if (body.item_rules !== undefined) updates.item_rules = body.item_rules
  if (body.base_value !== undefined) updates.base_value = Number(body.base_value) || 0
  if (body.currency !== undefined) updates.currency = body.currency
  if (body.is_active !== undefined) updates.is_active = body.is_active
  if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order) || 0

  const { data, error } = await supabaseAdmin
    .from("packages")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) {
    const status = error.code === "23505" ? 409 : 500
    return NextResponse.json({ error: error.message }, { status })
  }
  return NextResponse.json(data)
}

// DELETE /api/admin/packages/[id]  (orders.package_id is set null via FK)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabaseAdmin.from("packages").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
