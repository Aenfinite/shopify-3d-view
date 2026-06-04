import { NextRequest, NextResponse } from "next/server"
import { saveSku, deleteSku } from "@/lib/supabase/article-code-service"

export const dynamic = "force-dynamic"

// PATCH /api/admin/article-codes/skus/[id] → rebuild + save
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body?.sku_key || !body?.product_category || !body?.codes) {
    return NextResponse.json({ error: "sku_key, product_category and codes are required" }, { status: 400 })
  }
  const result = await saveSku({ ...body, id })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true, human: result.human, machine: result.machine })
}

// DELETE /api/admin/article-codes/skus/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = await deleteSku(id)
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  return NextResponse.json({ ok: true })
}
