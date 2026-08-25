import { NextResponse } from "next/server"
import { exportSkusCsv } from "@/lib/supabase/article-code-service"

export const dynamic = "force-dynamic"

// GET /api/admin/article-codes/export → download CSV of all SKUs with readable info
export async function GET() {
  const csv = await exportSkusCsv()
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sku-database-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
