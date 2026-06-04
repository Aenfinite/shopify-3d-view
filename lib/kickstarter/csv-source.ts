// ============================================================================
// Kickstarter CSV source — Phase 1 primary feeder
// ----------------------------------------------------------------------------
// Maps the *standard Kickstarter backer-report* columns into NormalizedBacker.
// Column names vary slightly between exports and pledge managers, so the
// mapping uses candidate lists (first match wins) and the resolved mapping is
// persisted on the import row, letting us re-map without re-uploading.
//
// No external CSV dependency: a small RFC-4180-ish parser handles quoted
// fields, escaped quotes and embedded newlines, which is all KS exports need.
// ============================================================================

import type {
  KickstarterSource,
  NormalizedBacker,
  NormalizedShippingAddress,
} from "./types"

/** Standard Kickstarter backer-report headers → our normalized fields. */
export const STANDARD_KS_COLUMNS: Record<string, string[]> = {
  backerUid: ["Backer Number", "Backer UID", "Backer ID"],
  name: ["Backer Name", "Shipping Name", "Name"],
  email: ["Email", "Backer Email"],
  pledgeTierLabel: ["Reward Title", "Reward", "Pledge Tier", "Tier"],
  rewardTitle: ["Reward Title", "Reward"],
  quantity: ["Quantity", "Reward Quantity", "Qty"],
  pledgeStatus: ["Pledged Status", "Pledge Status", "Status", "Backer Completed?", "Errored"],
  pledgeAmount: ["Pledge Amount", "Pledge Amount (USD)", "Amount"],
  currency: ["Currency", "Pledge Currency"],
  addonsRaw: ["Add-ons", "Add-Ons", "Addons", "Bonus"],
  addrLine1: ["Shipping Address 1", "Shipping Address", "Address 1"],
  addrLine2: ["Shipping Address 2", "Address 2"],
  addrCity: ["Shipping City", "City"],
  addrState: ["Shipping State", "State", "Province"],
  addrPostal: ["Shipping Postal Code", "Postal Code", "Zip", "Zip Code"],
  addrCountry: ["Shipping Country Name", "Shipping Country", "Country"],
}

/** Resolve which actual header to use for each field, given the file's headers. */
export function resolveColumnMapping(
  headers: string[],
): Record<string, string | null> {
  const lookup = new Map(headers.map((h) => [h.trim().toLowerCase(), h]))
  const mapping: Record<string, string | null> = {}
  for (const [field, candidates] of Object.entries(STANDARD_KS_COLUMNS)) {
    mapping[field] = candidates.map((c) => lookup.get(c.toLowerCase())).find(Boolean) ?? null
  }
  return mapping
}

/** Minimal RFC-4180 CSV parser → array of header-keyed row objects. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let field = ""
  let row: string[] = []
  let inQuotes = false

  // Normalize newlines, strip a UTF-8 BOM if present.
  const src = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n")

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++ }   // escaped quote
        else inQuotes = false
      } else field += ch
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ",") {
      row.push(field); field = ""
    } else if (ch === "\n") {
      row.push(field); field = ""
      if (row.some((c) => c !== "")) rows.push(row)
      row = []
    } else field += ch
  }
  if (field !== "" || row.length) { row.push(field); if (row.some((c) => c !== "")) rows.push(row) }

  if (rows.length === 0) return []
  const headers = rows[0].map((h) => h.trim())
  return rows.slice(1).map((cols) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => { obj[h] = (cols[idx] ?? "").trim() })
    return obj
  })
}

export class CsvSource implements KickstarterSource {
  readonly kind = "kickstarter_csv" as const

  constructor(private readonly csvText: string) {}

  /** The file's column headers, for persisting the resolved mapping. */
  get headers(): string[] {
    const rows = parseCsv(this.csvText)
    return rows.length ? Object.keys(rows[0]) : []
  }

  async fetchBackers(): Promise<NormalizedBacker[]> {
    const rows = parseCsv(this.csvText)
    if (rows.length === 0) return []
    const mapping = resolveColumnMapping(Object.keys(rows[0]))

    const pick = (row: Record<string, string>, field: string): string | undefined => {
      const col = mapping[field]
      const v = col ? row[col] : undefined
      return v && v.trim() !== "" ? v.trim() : undefined
    }
    const num = (v?: string): number | undefined => {
      if (!v) return undefined
      const n = Number(v.replace(/[^0-9.,-]/g, "").replace(",", "."))
      return Number.isFinite(n) ? n : undefined
    }

    return rows.map((row) => {
      const address: NormalizedShippingAddress = {
        line1: pick(row, "addrLine1"),
        line2: pick(row, "addrLine2"),
        city: pick(row, "addrCity"),
        state: pick(row, "addrState"),
        postalCode: pick(row, "addrPostal"),
        country: pick(row, "addrCountry"),
      }
      const hasAddress = Object.values(address).some(Boolean)

      // Treat a pledge as not-collected only when a status column explicitly
      // says so (errored/dropped/cancelled/declined). Absent column → collected.
      const status = (pick(row, "pledgeStatus") ?? "").toLowerCase()
      const collected = !/error|drop|cancel|declin|fail/.test(status)

      return {
        // Fall back to email when no backer number column exists, so dedupe
        // still has a stable key.
        backerUid: pick(row, "backerUid") ?? pick(row, "email") ?? "",
        email: pick(row, "email") ?? "",
        name: pick(row, "name") ?? "",
        pledgeTierLabel: pick(row, "pledgeTierLabel") ?? "",
        rewardTitle: pick(row, "rewardTitle"),
        quantity: Math.max(1, Math.round(num(pick(row, "quantity")) ?? 1)),
        collected,
        pledgeAmount: num(pick(row, "pledgeAmount")),
        currency: pick(row, "currency"),
        addonsRaw: pick(row, "addonsRaw"),
        shippingAddress: hasAddress ? address : undefined,
        raw: row,
      }
    })
  }
}
