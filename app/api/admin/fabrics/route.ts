import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin-client"

export const dynamic = "force-dynamic"

// GET  /api/admin/fabrics           → all fabrics
// GET  /api/admin/fabrics?product=x → fabrics for one product
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("product")
  let query = supabaseAdmin.from("fabrics").select("*").order("sort_order").order("created_at")
  if (productId && productId !== "all") {
    query = query.eq("product_id", productId) as typeof query
  }
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/fabrics  → create new fabric
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from("fabrics")
    .insert(body)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
