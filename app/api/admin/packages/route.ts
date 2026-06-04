import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin-client"

export const dynamic = "force-dynamic"

// GET /api/admin/packages → all packages (incl. inactive; admin bypasses RLS)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("packages")
    .select("*")
    .order("sort_order")
    .order("created_at")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/packages → create
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.code || !body?.name) {
    return NextResponse.json({ error: "Code and name are required" }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from("packages")
    .insert({
      code: String(body.code).trim(),
      name: String(body.name).trim(),
      description: body.description ?? null,
      garment_count: Number(body.garment_count) || 1,
      allowed_garment_types: Array.isArray(body.allowed_garment_types) ? body.allowed_garment_types : [],
      item_rules: body.item_rules ?? {},
      base_value: Number(body.base_value) || 0,
      currency: body.currency || "EUR",
      is_active: body.is_active ?? true,
      sort_order: Number(body.sort_order) || 0,
    })
    .select()
    .single()
  if (error) {
    const status = error.code === "23505" ? 409 : 500   // unique violation on code
    return NextResponse.json({ error: error.message }, { status })
  }
  return NextResponse.json(data, { status: 201 })
}
