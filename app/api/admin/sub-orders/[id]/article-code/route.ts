import { NextRequest, NextResponse } from "next/server"
import { stampSubOrderArticleCode } from "@/lib/supabase/article-code-service"

export const dynamic = "force-dynamic"

// POST /api/admin/sub-orders/[id]/article-code → resolve from SKU + persist
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sku = await stampSubOrderArticleCode(id)
  if (!sku) {
    return NextResponse.json(
      { error: "No SKU matches this item + colour. Add it under Article Codes → SKUs, then retry." },
      { status: 404 },
    )
  }
  return NextResponse.json({ human: sku.article_human, machine: sku.article_machine, sku_key: sku.sku_key })
}
