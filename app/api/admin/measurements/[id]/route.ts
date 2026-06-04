import { NextRequest, NextResponse } from "next/server"
import { lockMeasurement, unlockMeasurement } from "@/lib/supabase/measurements-service"

export const dynamic = "force-dynamic"

// PATCH /api/admin/measurements/[id]  body: { action: 'lock' | 'unlock', adminId? }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  if (body.action === "lock") {
    const ok = await lockMeasurement(id, body.adminId ?? null)
    return ok ? NextResponse.json({ ok: true, locked: true }) : NextResponse.json({ error: "Lock failed" }, { status: 500 })
  }
  if (body.action === "unlock") {
    const ok = await unlockMeasurement(id)
    return ok ? NextResponse.json({ ok: true, locked: false }) : NextResponse.json({ error: "Unlock failed" }, { status: 500 })
  }
  return NextResponse.json({ error: "action must be 'lock' or 'unlock'" }, { status: 400 })
}
