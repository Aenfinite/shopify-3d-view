import { NextRequest, NextResponse } from "next/server"
import { saveSku } from "@/lib/supabase/article-code-service"

export const dynamic = "force-dynamic"

// POST /api/admin/article-codes/skus → build + save a SKU (generates the code)
//   body: { sku_key, product_category, color?, label?, fabric_composition?, codes: {...8 segments} }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.sku_key || !body?.product_category || !body?.codes) {
    return NextResponse.json({ error: "sku_key, product_category and codes are required" }, { status: 400 })
  }
  const result = await saveSku(body)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true, human: result.human, machine: result.machine }, { status: 201 })
}
