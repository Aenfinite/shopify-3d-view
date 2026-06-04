import { NextRequest, NextResponse } from "next/server"
import { listTeam, createMember } from "@/lib/supabase/team-service"
import { normalizeRole } from "@/lib/admin/roles"

export const dynamic = "force-dynamic"

// GET /api/admin/team → all admin users
export async function GET() {
  return NextResponse.json(await listTeam())
}

// POST /api/admin/team → create an admin/operator (provisions auth + profile)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }
  if (String(body.password).length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }
  const result = await createMember({
    email: String(body.email).trim(),
    password: String(body.password),
    name: body.name ? String(body.name) : "",
    role: normalizeRole(body.role),
  })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
