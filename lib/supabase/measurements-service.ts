// ============================================================================
// SERVER-ONLY — Measurement service (raw → production + version locking).
// ----------------------------------------------------------------------------
// Each save creates a new version for the sub-order. Production values are
// computed (raw + allowance) and stored. A version can be LOCKED (frozen with a
// timestamp + admin); a locked version is never overwritten — a later edit makes
// a new version. Admins can unlock/relock. Belt items need no measurements.
// ============================================================================

import { getSupabaseAdmin } from "./admin-client"
import { defaultAllowances, withAllowances } from "../measurements/fields"

export interface MeasurementRecord {
  id: string
  customer_id: string
  sub_order_id: string | null
  garment_type: string
  raw_values: Record<string, number>
  allowances: Record<string, number>
  production_values: Record<string, number>
  unit: "cm" | "in"
  version: number
  locked: boolean
  locked_at: string | null
  locked_by: string | null
  notes: string | null
  created_at: string
}

const COLS = "id, customer_id, sub_order_id, garment_type, raw_values, allowances, production_values, unit, version, locked, locked_at, locked_by, notes, created_at"

/** All versions for a sub-order, newest first. */
export async function listVersionsForSubOrder(subOrderId: string): Promise<MeasurementRecord[]> {
  const db = getSupabaseAdmin()
  const { data } = await db.from("measurements").select(COLS).eq("sub_order_id", subOrderId).order("version", { ascending: false })
  return (data as MeasurementRecord[]) ?? []
}

export async function getMeasurement(id: string): Promise<MeasurementRecord | null> {
  const db = getSupabaseAdmin()
  const { data } = await db.from("measurements").select(COLS).eq("id", id).single()
  return (data as MeasurementRecord) ?? null
}

async function nextVersion(subOrderId: string): Promise<number> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from("measurements")
    .select("version")
    .eq("sub_order_id", subOrderId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle()
  return ((data?.version as number | undefined) ?? 0) + 1
}

export interface SaveMeasurementInput {
  subOrderId: string
  customerId: string
  garmentType: string
  rawValues: Record<string, number>
  allowances?: Record<string, number>
  unit?: "cm" | "in"
  notes?: string | null
  createdBy?: string | null
}

export interface SaveMeasurementResult {
  ok: boolean
  measurement?: MeasurementRecord
  error?: string
}

/** Save a new measurement version and link it to the sub-order. */
export async function saveMeasurement(input: SaveMeasurementInput): Promise<SaveMeasurementResult> {
  const db = getSupabaseAdmin()
  const allowances = input.allowances ?? defaultAllowances(input.garmentType)
  const production = withAllowances(input.rawValues, allowances)
  const version = await nextVersion(input.subOrderId)

  const { data, error } = await db
    .from("measurements")
    .insert({
      customer_id: input.customerId,
      sub_order_id: input.subOrderId,
      garment_type: input.garmentType,
      raw_values: input.rawValues ?? {},
      allowances,
      production_values: production,
      unit: input.unit ?? "cm",
      version,
      locked: false,
      notes: input.notes ?? null,
      created_by: input.createdBy ?? null,
    })
    .select(COLS)
    .single()

  if (error || !data) return { ok: false, error: error?.message ?? "insert failed" }

  // Point the sub-order at the latest version, and nudge a pending slot forward.
  await db.from("sub_orders").update({ measurement_id: data.id }).eq("id", input.subOrderId)
  await db.from("sub_orders").update({ status: "configuring" }).eq("id", input.subOrderId).eq("status", "pending")

  return { ok: true, measurement: data as MeasurementRecord }
}

/** Lock a version — freezes its production values with a timestamp. */
export async function lockMeasurement(id: string, adminId: string | null): Promise<boolean> {
  const db = getSupabaseAdmin()
  // Re-freeze production from current raw + allowances at lock time.
  const m = await getMeasurement(id)
  if (!m) return false
  const production = withAllowances(m.raw_values, m.allowances)
  const { error } = await db
    .from("measurements")
    .update({ locked: true, locked_at: new Date().toISOString(), locked_by: adminId, production_values: production })
    .eq("id", id)
  return !error
}

/** Admin unlock — re-opens a locked version for correction. */
export async function unlockMeasurement(id: string): Promise<boolean> {
  const { error } = await getSupabaseAdmin()
    .from("measurements")
    .update({ locked: false, locked_at: null, locked_by: null })
    .eq("id", id)
  return !error
}
