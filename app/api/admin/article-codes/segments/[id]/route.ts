import { NextRequest, NextResponse } from "next/server"
import { upsertSegmentValue, deleteSegmentValue } from "@/lib/supabase/article-code-service"

export const dynamic = "force-dynamic"

// PATCH /api/admin/article-codes/segments/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body?.segment_no || !body?.code || !body?.label) {
    return NextResponse.json({ error: "segment_no, code and label are required" }, { status: 400 })
  }
  const result = await upsertSegmentValue({ ...body, id })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/article-codes/segments/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = await deleteSegmentValue(id)
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  return NextResponse.json({ ok: true })
}
