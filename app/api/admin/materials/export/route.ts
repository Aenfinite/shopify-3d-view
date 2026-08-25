import { NextResponse } from "next/server"
import { exportMaterialSpecsCsv } from "@/lib/supabase/material-spec-service"

export const dynamic = "force-dynamic"

// GET /api/admin/materials/export → download CSV of all material specifications
export async function GET() {
  const csv = await exportMaterialSpecsCsv()
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="material-specifications-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
