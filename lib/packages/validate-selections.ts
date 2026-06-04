// ============================================================================
// Package item-rules enforcement (pure).
// ----------------------------------------------------------------------------
// `packages.item_rules` (jsonb) constrains what a sub-order may select. The
// configurator-save path runs every selection through this before persisting, so
// a backer can never confirm a garment the tier doesn't allow.
//
// Supported rules (all optional — an empty `{}` allows everything):
//   allowed_garment_types : string[]            — restrict garment type
//   allowed_fabrics       : string[]            — fabric id/category allow-list
//   forbidden_fabrics     : string[]            — fabric id/category deny-list
//   allowed_options       : { [dim]: string[] } — per-dimension allow-list
//   forbidden_options     : { [dim]: string[] } — per-dimension deny-list
//   required_options      : string[]            — dimensions that must be chosen
//   max_monograms         : number              — cap on monogram selections
// ============================================================================

export interface ItemRules {
  allowed_garment_types?: string[]
  allowed_fabrics?: string[]
  forbidden_fabrics?: string[]
  allowed_options?: Record<string, string[]>
  forbidden_options?: Record<string, string[]>
  required_options?: string[]
  max_monograms?: number
}

export interface SelectionInput {
  garmentType: string
  fabric?: string | null
  selections: Record<string, unknown>
}

export interface ValidationResult {
  ok: boolean
  errors: string[]
}

const norm = (s: unknown) => String(s ?? "").toLowerCase().trim()

function matchesAny(value: string, list: string[]): boolean {
  const v = norm(value)
  return list.some((entry) => {
    const e = norm(entry)
    return v === e || v.includes(e) || e.includes(v)
  })
}

export function validateSelections(input: SelectionInput, rules: ItemRules | null | undefined): ValidationResult {
  const errors: string[] = []
  const r = rules ?? {}

  if (r.allowed_garment_types?.length && !matchesAny(input.garmentType, r.allowed_garment_types)) {
    errors.push(`Garment type "${input.garmentType}" is not allowed by this package (allowed: ${r.allowed_garment_types.join(", ")}).`)
  }

  if (input.fabric) {
    if (r.allowed_fabrics?.length && !matchesAny(input.fabric, r.allowed_fabrics)) {
      errors.push(`Fabric "${input.fabric}" is not in this package's allowed fabrics.`)
    }
    if (r.forbidden_fabrics?.length && matchesAny(input.fabric, r.forbidden_fabrics)) {
      errors.push(`Fabric "${input.fabric}" is not permitted by this package.`)
    }
  }

  if (r.allowed_options) {
    for (const [dim, allowed] of Object.entries(r.allowed_options)) {
      const chosen = input.selections?.[dim]
      if (chosen != null && allowed.length && !matchesAny(String(chosen), allowed)) {
        errors.push(`Option "${chosen}" for ${dim} is not allowed (allowed: ${allowed.join(", ")}).`)
      }
    }
  }

  if (r.forbidden_options) {
    for (const [dim, forbidden] of Object.entries(r.forbidden_options)) {
      const chosen = input.selections?.[dim]
      if (chosen != null && matchesAny(String(chosen), forbidden)) {
        errors.push(`Option "${chosen}" for ${dim} is forbidden by this package.`)
      }
    }
  }

  if (r.required_options?.length) {
    for (const dim of r.required_options) {
      const chosen = input.selections?.[dim]
      if (chosen == null || norm(chosen) === "") errors.push(`A selection for "${dim}" is required by this package.`)
    }
  }

  if (typeof r.max_monograms === "number") {
    const monogramCount = Object.entries(input.selections ?? {}).filter(
      ([k, v]) => k.toLowerCase().includes("monogram") && v != null && !norm(v).includes("none"),
    ).length
    if (monogramCount > r.max_monograms) {
      errors.push(`Too many monograms (${monogramCount}); this package allows at most ${r.max_monograms}.`)
    }
  }

  return { ok: errors.length === 0, errors }
}
