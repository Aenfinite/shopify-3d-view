import { NextResponse } from "next/server"
import { getSegmentValues, listSkus } from "@/lib/supabase/article-code-service"
import { SEGMENTS } from "@/lib/article-code/segments"

export const dynamic = "force-dynamic"

// GET /api/admin/article-codes → segment definitions + lookup values + SKU registry
export async function GET() {
  const [segmentValues, skus] = await Promise.all([getSegmentValues(), listSkus()])
  return NextResponse.json({ definitions: SEGMENTS, segmentValues, skus })
}
