// ============================================================================
// Branded production sheet (PDF) generator — SAFE CHINO, Layer 7.
// ----------------------------------------------------------------------------
// One sheet per ORDER, a section per sub-order (garment): sub-order ref, item +
// colour, article code + Code 128 barcode (vector rects, no plugin), the design
// selections, and the body + production (locked) measurements. Returns a Buffer.
// ============================================================================

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { code128Bits } from "../article-code/barcode"
import type { ExportOrder, ExportSubOrder } from "../supabase/orders-service"

const BRAND = { r: 41, g: 128, b: 185 }
const INK = { r: 30, g: 41, b: 59 }
const MUTED = { r: 100, g: 116, b: 139 }

const PAGE_W = 210
const MARGIN = 16

function drawBarcode(doc: jsPDF, payload: string, x: number, y: number, opts: { height?: number; moduleWidth?: number } = {}) {
  const bits = code128Bits(payload)
  if (!bits) return
  const mw = opts.moduleWidth ?? 0.34
  const height = opts.height ?? 11
  doc.setFillColor(0, 0, 0)
  let cx = x
  for (const bit of bits) {
    if (bit === "1") doc.rect(cx, y, mw, height, "F")
    cx += mw
  }
  doc.setFontSize(7)
  doc.setTextColor(INK.r, INK.g, INK.b)
  doc.text(payload, x, y + height + 2.6)
}

function header(doc: jsPDF, order: ExportOrder) {
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b)
  doc.rect(0, 0, PAGE_W, 26, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("PRODUCTION SHEET", MARGIN, 12)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Order ${order.order_number}${order.kickstarter_ref ? `  ·  KS ${order.kickstarter_ref}` : ""}`, MARGIN, 19)
  doc.text(new Date(order.created_at).toLocaleDateString(), PAGE_W - MARGIN, 19, { align: "right" })
}

function customerBlock(doc: jsPDF, order: ExportOrder, y: number): number {
  doc.setTextColor(INK.r, INK.g, INK.b)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("Customer", MARGIN, y)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b)
  const c = order.customer
  const addr = (c?.shipping_address ?? {}) as Record<string, string>
  const addrLine = [addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(", ")
  const lines = [
    c?.name || "—",
    c?.email || "",
    c?.phone || "",
    addrLine || "No shipping address on file",
    order.package ? `Package: ${order.package.name} (${order.package.code})` : "No package",
    order.packing_note ? `Packing: ${order.packing_note}` : "",
  ].filter(Boolean)
  doc.text(lines, MARGIN, y + 5)
  return y + 5 + lines.length * 4.5
}

function garmentSection(doc: jsPDF, sub: ExportSubOrder, index: number, y: number): number {
  const item = sub.item_type ?? sub.garment_type
  doc.setFillColor(241, 245, 249)
  doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, 8, "F")
  doc.setTextColor(INK.r, INK.g, INK.b)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  const title = `${sub.sub_order_ref ?? `#${index + 1}`}  ·  ${item.toUpperCase()}${sub.color ? ` · ${sub.color}` : ""}  ·  ${sub.status}`
  doc.text(title, MARGIN + 2, y + 5.5)
  let cursor = y + 12

  if (sub.article_code_human || sub.article_code_barcode) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(INK.r, INK.g, INK.b)
    doc.text(`Article: ${sub.article_code_human ?? "—"}`, MARGIN + 2, cursor)
    if (sub.article_code_barcode) drawBarcode(doc, sub.article_code_barcode, PAGE_W - MARGIN - 58, cursor - 4)
    cursor += 6
  }

  const optionRows = Object.entries(sub.configurator_selections)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => [k, String(v)])
  if (optionRows.length) {
    autoTable(doc, {
      startY: cursor,
      margin: { left: MARGIN + 2, right: PAGE_W / 2 },
      head: [["Design choice", "Selection"]],
      body: optionRows,
      theme: "grid",
      styles: { fontSize: 7.5, cellPadding: 1.2 },
      headStyles: { fillColor: [BRAND.r, BRAND.g, BRAND.b] },
    })
  }

  if (sub.measurement) {
    const m = sub.measurement
    const rows = Object.keys(m.raw_values).map((k) => [
      k,
      `${m.raw_values[k]} ${m.unit}`,
      `+${m.allowances[k] ?? 0}`,
      `${m.production_values[k] ?? m.raw_values[k]} ${m.unit}`,
    ])
    autoTable(doc, {
      startY: cursor,
      margin: { left: PAGE_W / 2 + 2, right: MARGIN },
      head: [[`Measure v${m.version}${m.locked ? " (LOCKED)" : ""}`, "Body", "Ease", "Production"]],
      body: rows,
      theme: "grid",
      styles: { fontSize: 7.5, cellPadding: 1.2 },
      headStyles: { fillColor: m.locked ? [22, 101, 52] : [INK.r, INK.g, INK.b] },
    })
  }

  const last = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cursor
  return Math.max(last, cursor) + 8
}

/** Generate the production-sheet PDF for an order. Returns a Node Buffer. */
export function buildProductionSheet(order: ExportOrder): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  header(doc, order)
  let y = customerBlock(doc, order, 34) + 4

  if (order.sub_orders.length === 0) {
    doc.setFontSize(10)
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b)
    doc.text("No garments / sub-orders on this order yet.", MARGIN, y + 6)
  }

  for (let i = 0; i < order.sub_orders.length; i++) {
    if (y > 250) { doc.addPage(); y = 20 }
    y = garmentSection(doc, order.sub_orders[i], i, y)
  }

  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b)
    doc.text(`${order.order_number} — production sheet`, MARGIN, 290)
    doc.text(`Page ${p}/${pageCount}`, PAGE_W - MARGIN, 290, { align: "right" })
  }

  return Buffer.from(doc.output("arraybuffer"))
}
