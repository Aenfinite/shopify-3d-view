import { NextRequest, NextResponse } from "next/server"
import { updateMemberRole, removeMember } from "@/lib/supabase/team-service"
import { normalizeRole } from "@/lib/admin/roles"

export const dynamic = "force-dynamic"

// PATCH /api/admin/team/[id]  body: { role }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  if (body.role !== "admin" && body.role !== "operator") {
    return NextResponse.json({ error: "role must be 'admin' or 'operator'" }, { status: 400 })
  }
  const ok = await updateMemberRole(id, normalizeRole(body.role))
  if (!ok) return NextResponse.json({ error: "Update failed" }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/team/[id] → revoke access
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = await removeMember(id)
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  return NextResponse.json({ ok: true })
}
