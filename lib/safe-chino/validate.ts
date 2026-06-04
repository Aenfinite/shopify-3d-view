// ============================================================================
// SAFE CHINO selection validation (Layer 3 rules engine).
// ----------------------------------------------------------------------------
// Validates a sub-order's colour + design selections against the catalog and
// the package slot's constraints (allowed colours, sleeve length, white-only,
// SAFE-pocket dimensions, embroidery length).
// ============================================================================

import {
  colorsFor, hasConfigurableOptions, EMBROIDERY_MAX_CHARS,
  CHINO_FRONT, CHINO_BACK_POCKETS, SAFE_POCKET_POSITIONS,
  SHIRT_COLLAR, SHIRT_FRONT, SHIRT_BACK, SHIRT_SLEEVE,
  EMBROIDERY_FONTS, EMBROIDERY_COLORS,
} from "./catalog"

export interface SafeChinoSelectionInput {
  itemType: string
  color: string | null
  selections: Record<string, unknown>
  /** package_items.allowed_colors — empty = full catalog. */
  allowedColors?: string[]
  /** package_items.constraints — e.g. {"sleeve":"long","shirt_color":"white-only"}. */
  constraints?: Record<string, unknown>
}

export interface SafeChinoValidation {
  ok: boolean
  errors: string[]
}

const inSet = (value: unknown, opts: { value: string }[]) =>
  value == null || value === "" || opts.some((o) => o.value === value)

export function validateSafeChinoSelections(input: SafeChinoSelectionInput): SafeChinoValidation {
  const errors: string[] = []
  const sel = input.selections ?? {}
  const constraints = input.constraints ?? {}
  const allowed = input.allowedColors ?? []

  // ── Colour ────────────────────────────────────────────────────────────────
  const catalogColors = colorsFor(input.itemType)
  if (input.color) {
    if (catalogColors.length && !catalogColors.some((c) => c.value === input.color)) {
      errors.push(`Colour "${input.color}" is not a valid ${input.itemType} colour.`)
    }
    if (allowed.length && !allowed.includes(input.color)) {
      errors.push(`Colour "${input.color}" is not allowed for this slot (allowed: ${allowed.join(", ")}).`)
    }
  }

  // Belt is colour-only — nothing more to validate.
  if (!hasConfigurableOptions(input.itemType)) return { ok: errors.length === 0, errors }

  // ── Embroidery (shared) ─────────────────────────────────────────────────────
  const initials = sel.embroideryInitials
  if (typeof initials === "string" && initials.length > EMBROIDERY_MAX_CHARS) {
    errors.push(`Embroidery initials may be at most ${EMBROIDERY_MAX_CHARS} characters.`)
  }
  if (!inSet(sel.embroideryFont, EMBROIDERY_FONTS)) errors.push(`Invalid embroidery font "${sel.embroideryFont}".`)
  if (!inSet(sel.embroideryColor, EMBROIDERY_COLORS)) errors.push(`Invalid embroidery colour "${sel.embroideryColor}".`)

  if (input.itemType === "chino") {
    if (!inSet(sel.front, CHINO_FRONT)) errors.push(`Invalid chino front "${sel.front}".`)
    if (!inSet(sel.backPockets, CHINO_BACK_POCKETS)) errors.push(`Invalid back pocket "${sel.backPockets}".`)
    if (sel.safePocketPosition && !SAFE_POCKET_POSITIONS.some((o) => o.value === sel.safePocketPosition)) {
      errors.push(`Invalid SAFE pocket position "${sel.safePocketPosition}".`)
    }
    // SAFE pocket custom dimensions (cm) — must be positive & sane when set.
    for (const [k, label, max] of [["safePocketH", "height", 40], ["safePocketW", "width", 30], ["safePocketT", "thickness", 10]] as const) {
      const v = sel[k]
      if (v != null && v !== "") {
        const n = Number(v)
        if (Number.isNaN(n) || n <= 0 || n > max) errors.push(`SAFE pocket ${label} must be between 0 and ${max} cm.`)
      }
    }
  }

  if (input.itemType === "shirt") {
    if (!inSet(sel.collar, SHIRT_COLLAR)) errors.push(`Invalid collar "${sel.collar}".`)
    if (!inSet(sel.front, SHIRT_FRONT)) errors.push(`Invalid shirt front "${sel.front}".`)
    if (!inSet(sel.back, SHIRT_BACK)) errors.push(`Invalid shirt back "${sel.back}".`)
    if (!inSet(sel.sleeve, SHIRT_SLEEVE)) errors.push(`Invalid sleeve "${sel.sleeve}".`)
    // Package-enforced sleeve length (e.g. Jetsetter Summer = short only).
    if (constraints.sleeve && sel.sleeve && sel.sleeve !== constraints.sleeve) {
      errors.push(`This slot requires ${constraints.sleeve}-sleeve shirts.`)
    }
  }

  return { ok: errors.length === 0, errors }
}
