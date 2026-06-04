// ============================================================================
// Measurement field definitions per garment type (SAFE CHINO — Layer 4).
// ----------------------------------------------------------------------------
//   Chino: Waist, Hip, Thigh, Rise, Inseam, Leg Opening
//   Shirt: Chest, Length, Sleeves
//   Belt:  no measurements.
// Production value = raw body value + allowance (ease). Allowances default to
// +0.5 cm per field (workshop spec) and are editable per measurement set.
// ============================================================================

export type GarmentType = "chino" | "shirt"

export interface MeasurementField {
  key: string
  label: string
  /** Plausible body-measurement range in cm — soft validation only. */
  min: number
  max: number
  /** Default production allowance (ease) in cm added on top of the body value. */
  defaultAllowance: number
  hint?: string
}

const CHINO_FIELDS: MeasurementField[] = [
  { key: "waist", label: "Waist", min: 60, max: 140, defaultAllowance: 0.5, hint: "Around the natural waist where the chino sits" },
  { key: "hip", label: "Hip", min: 70, max: 160, defaultAllowance: 0.5 },
  { key: "thigh", label: "Thigh", min: 45, max: 90, defaultAllowance: 0.5 },
  { key: "rise", label: "Rise", min: 18, max: 40, defaultAllowance: 0.5 },
  { key: "inseam", label: "Inseam", min: 60, max: 95, defaultAllowance: 0.5 },
  { key: "legOpening", label: "Leg Opening", min: 28, max: 55, defaultAllowance: 0.5 },
]

const SHIRT_FIELDS: MeasurementField[] = [
  { key: "chest", label: "Chest", min: 80, max: 160, defaultAllowance: 0.5, hint: "Around the fullest part of the chest" },
  { key: "length", label: "Length", min: 60, max: 90, defaultAllowance: 0.5 },
  { key: "sleeves", label: "Sleeves", min: 50, max: 75, defaultAllowance: 0.5 },
]

export const MEASUREMENT_FIELDS: Record<GarmentType, MeasurementField[]> = {
  chino: CHINO_FIELDS,
  shirt: SHIRT_FIELDS,
}

/** Garment types that require fitting (belt has none). */
export function needsMeasurements(garmentType: string): boolean {
  return garmentType === "chino" || garmentType === "shirt"
}

export function getMeasurementFields(garmentType: string): MeasurementField[] {
  return MEASUREMENT_FIELDS[(garmentType as GarmentType)] ?? []
}

/** Default production-allowance map for a garment type (field key → ease). */
export function defaultAllowances(garmentType: string): Record<string, number> {
  return Object.fromEntries(getMeasurementFields(garmentType).map((f) => [f.key, f.defaultAllowance]))
}

export interface FieldValidationIssue {
  key: string
  label: string
  message: string
}

/**
 * Soft validation: flags out-of-range body values so an obvious typo (e.g. 840
 * for 84) is caught before locking. Never blocks saving — only warns.
 */
export function validateMeasurements(
  garmentType: string,
  values: Record<string, number>,
): FieldValidationIssue[] {
  const issues: FieldValidationIssue[] = []
  for (const f of getMeasurementFields(garmentType)) {
    const v = values[f.key]
    if (v === undefined || v === null || Number.isNaN(v)) continue
    if (v < f.min || v > f.max) {
      issues.push({ key: f.key, label: f.label, message: `Outside the usual ${f.min}–${f.max} cm range` })
    }
  }
  return issues
}

/** Production measurements = body values + allowances (per field). */
export function withAllowances(
  values: Record<string, number>,
  allowances: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(values)) {
    out[k] = Math.round((Number(v) + Number(allowances[k] ?? 0)) * 100) / 100
  }
  return out
}
