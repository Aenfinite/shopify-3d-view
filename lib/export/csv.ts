// ============================================================================
// CSV / Excel-compatible export builder (pure). SAFE CHINO — Layer 7.
// ----------------------------------------------------------------------------
// One row per SUB-ORDER (the production unit). UTF-8 BOM for Excel. Columns
// cover the full production picture: refs, article code, design choices, and
// the locked production measurements.
// ============================================================================

import type { ExportOrder } from "../supabase/orders-service"

const BOM = "﻿"

function escapeCell(value: unknown): string {
  const s = value == null ? "" : String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function selectionsSummary(sel: Record<string, unknown>): string {
  return Object.entries(sel)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}=${v}`)
    .join(" | ")
}

function measure(m: Record<string, number> | undefined, unit: string): string {
  if (!m) return ""
  return Object.entries(m).map(([k, v]) => `${k}:${v}${unit}`).join(" ")
}

const HEADERS = [
  "Master order", "Kickstarter ref", "Sub-order ref", "Customer", "Email",
  "Package", "Item", "Colour", "Article (human)", "Article (machine)",
  "Sub-order status", "Design choices",
  "Body measurements", "Production measurements", "Meas. version", "Locked", "Packing", "Created",
]

/** Build a CSV string for one or many orders (sub-order granularity). */
export function ordersToCsv(orders: ExportOrder[]): string {
  const rows: string[] = [HEADERS.map(escapeCell).join(",")]

  for (const o of orders) {
    const base = {
      order: o.order_number,
      ksRef: o.kickstarter_ref ?? "",
      customer: o.customer?.name ?? "",
      email: o.customer?.email ?? "",
      pkg: o.package?.name ?? "",
      packing: o.packing_note ?? "",
      created: new Date(o.created_at).toISOString().slice(0, 10),
    }
    if (o.sub_orders.length === 0) {
      rows.push([base.order, base.ksRef, "", base.customer, base.email, base.pkg, "", "", "", "", "", "", "", "", "", "", base.packing, base.created].map(escapeCell).join(","))
      continue
    }
    for (const s of o.sub_orders) {
      const m = s.measurement
      rows.push([
        base.order, base.ksRef, s.sub_order_ref ?? "", base.customer, base.email, base.pkg,
        s.item_type ?? s.garment_type, s.color ?? "",
        s.article_code_human ?? "", s.article_code_barcode ?? "",
        s.status, selectionsSummary(s.configurator_selections),
        m ? measure(m.raw_values, m.unit) : "",
        m ? measure(m.production_values, m.unit) : "",
        m ? `v${m.version}` : "",
        m ? (m.locked ? "LOCKED" : "draft") : "",
        base.packing, base.created,
      ].map(escapeCell).join(","))
    }
  }

  return BOM + rows.join("\r\n")
}
