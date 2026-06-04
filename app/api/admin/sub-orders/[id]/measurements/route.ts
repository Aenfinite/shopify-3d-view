import { NextRequest, NextResponse } from "next/server"
import { getSubOrderFull } from "@/lib/supabase/orders-service"
import { listVersionsForSubOrder, saveMeasurement } from "@/lib/supabase/measurements-service"
import { needsMeasurements } from "@/lib/measurements/fields"

export const dynamic = "force-dynamic"

// GET /api/admin/sub-orders/[id]/measurements → all versions for this garment item
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sub = await getSubOrderFull(id)
  if (!sub) return NextResponse.json({ error: "Sub-order not found" }, { status: 404 })
  const versions = await listVersionsForSubOrder(id)
  return NextResponse.json({
    currentMeasurementId: sub.measurement_id,
    garmentType: sub.item_type ?? sub.garment_type,
    versions,
  })
}

// POST /api/admin/sub-orders/[id]/measurements → save a new version + link it
//   body: { rawValues, allowances?, unit?, notes? }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sub = await getSubOrderFull(id)
  if (!sub || !sub.customer_id) return NextResponse.json({ error: "Sub-order/customer not found" }, { status: 404 })

  const garmentType = sub.item_type ?? sub.garment_type
  if (!needsMeasurements(garmentType)) {
    return NextResponse.json({ error: `${garmentType} does not require measurements` }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  if (!body.rawValues || typeof body.rawValues !== "object") {
    return NextResponse.json({ error: "rawValues object is required" }, { status: 400 })
  }

  const result = await saveMeasurement({
    subOrderId: id,
    customerId: sub.customer_id,
    garmentType,
    rawValues: body.rawValues,
    allowances: body.allowances,
    unit: body.unit === "in" ? "in" : "cm",
    notes: body.notes ?? null,
  })
  if (!result.ok) return NextResponse.json({ error: result.error ?? "Save failed" }, { status: 500 })
  return NextResponse.json(result.measurement, { status: 201 })
}
