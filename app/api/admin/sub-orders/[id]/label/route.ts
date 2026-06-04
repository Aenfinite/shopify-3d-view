import { NextRequest, NextResponse } from "next/server"
import { getSubOrderFull } from "@/lib/supabase/orders-service"
import { code128Svg } from "@/lib/article-code/barcode"

export const dynamic = "force-dynamic"

// GET /api/admin/sub-orders/[id]/label → printable Code 128 barcode label (SVG)
// for the sub-order's machine article code.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sub = await getSubOrderFull(id)
  if (!sub) return NextResponse.json({ error: "Sub-order not found" }, { status: 404 })
  if (!sub.article_code_barcode) {
    return NextResponse.json({ error: "No article code yet — configure the item first." }, { status: 409 })
  }

  const barcode = code128Svg(sub.article_code_barcode, { height: 70, moduleWidth: 2, showText: true })
  // Wrap with the item ref + human code for a workshop-ready label.
  const label =
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="150" viewBox="0 0 320 150">` +
    `<rect width="320" height="150" fill="#fff" stroke="#e2e8f0"/>` +
    `<text x="12" y="22" font-family="monospace" font-size="13" font-weight="bold">${sub.sub_order_ref ?? ""}</text>` +
    `<text x="12" y="40" font-family="monospace" font-size="12">${(sub.item_type ?? sub.garment_type)}${sub.color ? " · " + sub.color : ""}</text>` +
    `<text x="12" y="58" font-family="monospace" font-size="12">${sub.article_code_human ?? ""}</text>` +
    `<g transform="translate(12,66)">${barcode.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</g>` +
    `</svg>`

  return new NextResponse(label, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `inline; filename="${(sub.sub_order_ref ?? id).replace(/[^\w-]/g, "_")}-label.svg"`,
    },
  })
}
