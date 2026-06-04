import { NextRequest, NextResponse } from "next/server"
import {
  updateSubOrderStatus, SUB_ORDER_STATUSES,
  getSubOrderFull, saveSubOrderConfiguration,
} from "@/lib/supabase/orders-service"
import type { SubOrderStatus } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

// GET /api/admin/sub-orders/[id] → full sub-order (selections, package rules, codes)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sub = await getSubOrderFull(id)
  if (!sub) return NextResponse.json({ error: "Sub-order not found" }, { status: 404 })
  return NextResponse.json(sub)
}

// PATCH /api/admin/sub-orders/[id]
//   body: { status }                       → status change
//   body: { configuration: {...} }         → save configurator selections + article code
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  if (body.configuration) {
    const cfg = body.configuration
    const result = await saveSubOrderConfiguration(id, {
      selections: cfg.selections ?? {},
      productId: cfg.productId ?? null,
      fabric: cfg.fabric ?? null,
      notes: cfg.notes ?? null,
      confirm: !!cfg.confirm,
    })
    if (!result.ok) return NextResponse.json({ error: "Validation failed", errors: result.errors }, { status: 422 })
    return NextResponse.json(result)
  }

  const status = body.status as SubOrderStatus | undefined
  if (!status || !SUB_ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }
  const ok = await updateSubOrderStatus(id, status)
  if (!ok) return NextResponse.json({ error: "Update failed" }, { status: 500 })
  return NextResponse.json({ ok: true })
}
