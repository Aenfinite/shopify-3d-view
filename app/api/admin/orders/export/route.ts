import { NextRequest, NextResponse } from "next/server"
import { listOrders, getOrderForExport } from "@/lib/supabase/orders-service"
import { ordersToCsv } from "@/lib/export/csv"

export const dynamic = "force-dynamic"

// GET /api/admin/orders/export?status=&origin= → CSV of all matching orders
// (sub-order granularity). Static "export" segment wins over the [id] route.
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? undefined
  const origin = req.nextUrl.searchParams.get("origin") ?? undefined

  const list = await listOrders({ status, origin })
  const orders = (await Promise.all(list.map((o) => getOrderForExport(o.id)))).filter(Boolean) as NonNullable<
    Awaited<ReturnType<typeof getOrderForExport>>
  >[]

  const csv = ordersToCsv(orders)
  const stamp = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-export-${stamp}.csv"`,
    },
  })
}
