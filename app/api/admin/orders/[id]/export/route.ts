import { NextRequest, NextResponse } from "next/server"
import { getOrderForExport } from "@/lib/supabase/orders-service"
import { buildProductionSheet } from "@/lib/export/production-sheet"
import { ordersToCsv } from "@/lib/export/csv"

export const dynamic = "force-dynamic"

// GET /api/admin/orders/[id]/export?format=pdf|csv
// Default pdf → branded production sheet. csv → single-order sub-order rows.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const format = req.nextUrl.searchParams.get("format") ?? "pdf"
  const order = await getOrderForExport(id)
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  if (format === "csv") {
    const csv = ordersToCsv([order])
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${order.order_number}.csv"`,
      },
    })
  }

  const pdf = buildProductionSheet(order)
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${order.order_number}-production-sheet.pdf"`,
    },
  })
}
