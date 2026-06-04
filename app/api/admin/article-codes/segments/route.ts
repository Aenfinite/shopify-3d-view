import { NextRequest, NextResponse } from "next/server"
import { upsertSegmentValue } from "@/lib/supabase/article-code-service"

export const dynamic = "force-dynamic"

// POST /api/admin/article-codes/segments → add/upsert a segment lookup value
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.segment_no || !body?.code || !body?.label) {
    return NextResponse.json({ error: "segment_no, code and label are required" }, { status: 400 })
  }
  const result = await upsertSegmentValue(body)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
