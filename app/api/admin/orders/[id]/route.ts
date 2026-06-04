import { NextRequest, NextResponse } from "next/server"
import { getOrderDetail, updateOrderStatus, ORDER_STATUSES } from "@/lib/supabase/orders-service"
import type { OrderStatus } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

// GET /api/admin/orders/[id] → order detail with customer, package, sub-orders
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderDetail(id)
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  return NextResponse.json(order)
}

// PATCH /api/admin/orders/[id]  body: { status }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const status = body.status as OrderStatus | undefined
  if (!status || !ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }
  const ok = await updateOrderStatus(id, status)
  if (!ok) return NextResponse.json({ error: "Update failed" }, { status: 500 })
  return NextResponse.json({ ok: true })
}
