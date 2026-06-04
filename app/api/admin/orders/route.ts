import { NextRequest, NextResponse } from "next/server"
import { listOrders } from "@/lib/supabase/orders-service"

export const dynamic = "force-dynamic"

// GET /api/admin/orders?status=&origin=
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? undefined
  const origin = req.nextUrl.searchParams.get("origin") ?? undefined
  try {
    const orders = await listOrders({ status, origin })
    return NextResponse.json(orders)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
