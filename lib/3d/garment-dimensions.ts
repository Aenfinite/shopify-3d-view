/**
 * Garment physical dimensions (cm) per product type.
 *
 * These values define the real-world surface area that the fabric texture
 * covers on the 3D model. They are used together with a fabric's
 * "repeat_width_cm" / "repeat_height_cm" to compute how many times the
 * fabric pattern should tile across the garment:
 *
 *     repeats_x = garment_width_cm  / fabric_repeat_width_cm
 *     repeats_y = garment_height_cm / fabric_repeat_height_cm
 *
 * This is then passed to `texture.repeat.set(repeats_x, repeats_y)` so the
 * digital 3D pattern matches the real production pattern size in cm.
 *
 * Admin can override these per product type at runtime via the settings
 * UI (values persist in localStorage on the admin's machine). Defaults
 * are Dany's visual reference measurements (shirt Size L, trousers Size 32).
 * Jacket TBD — placeholder values used until confirmed.
 */

export interface GarmentDimensionsCm {
  /** Front-panel width (shoulder-to-shoulder or chest width) in cm. */
  width: number
  /** Length from HPS (high-point-shoulder) to hem in cm. */
  height: number
}

export type GarmentKey = "shirt" | "pants" | "jacket" | "trousers"

// ─── Hardcoded UV-calibration defaults ───────────────────────────────────
// These values represent how many real-world cm the UV coordinate range
// [0 → 1] spans on each 3D garment model's fabric panel.
//
// Shirt UV calibration (PER-PANEL — front, back, sleeve each have their
// own UV [0,1] normalized to their own surface):
//   UV width  = 53.34 cm  (half-chest flat — matches one shirt panel)
//   UV height = 73.39 cm  (front length HPS→hem)
//
//   At 60in fabric (152.4cm wide):
//     rX = 53.34 / 152.4 = 0.35
//     The front panel shows 35% of the 60in fabric = 21in = 53.4cm ✓
//     (matches real production: cut one panel per 21in of fabric width)
//
// Trousers — UV calibration (half-hip flat, per-panel):
//   half hip width (flat)       = 47.5 cm
//   outseam length (waist→hem)  = 92.5 cm
//
// Jacket — TBD (not urgent). Placeholder kept.
const DEFAULT_DIMENSIONS_CM: Record<GarmentKey, GarmentDimensionsCm> = {
  shirt:    { width: 53.34, height: 73.39 },
  pants:    { width: 47.5,  height: 92.5  },
  trousers: { width: 47.5,  height: 92.5  },
  jacket:   { width: 56.0,  height: 76.0  },
}

const LS_KEY = "garment-dimensions-cm-overrides-v1"

/** Load admin overrides from localStorage (browser only). */
function loadOverrides(): Partial<Record<GarmentKey, GarmentDimensionsCm>> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === "object" && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

/** Save admin overrides to localStorage (browser only). */
export function saveGarmentDimensionsOverride(
  key: GarmentKey,
  dims: GarmentDimensionsCm,
) {
  if (typeof window === "undefined") return
  const all = loadOverrides()
  all[key] = dims
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(all))
  } catch {
    // ignore (quota/disabled)
  }
}

/** Reset overrides for a product type back to the hardcoded default. */
export function resetGarmentDimensions(key: GarmentKey) {
  if (typeof window === "undefined") return
  const all = loadOverrides()
  delete all[key]
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
}

/**
 * Resolve the effective garment dimensions for a given product type,
 * respecting admin localStorage overrides first, falling back to defaults.
 */
export function getGarmentDimensionsCm(
  productType: string,
): GarmentDimensionsCm {
  const key = normalizeKey(productType)
  const overrides = loadOverrides()
  const override = overrides[key]
  if (override && typeof override.width === "number" && typeof override.height === "number" && override.width > 0 && override.height > 0) {
    return override
  }
  return DEFAULT_DIMENSIONS_CM[key]
}

/** Return the hardcoded default (ignoring any admin override). */
export function getDefaultGarmentDimensionsCm(
  productType: string,
): GarmentDimensionsCm {
  return DEFAULT_DIMENSIONS_CM[normalizeKey(productType)]
}

function normalizeKey(productType: string): GarmentKey {
  const p = (productType || "").toLowerCase()
  if (p === "pants" || p === "pant" || p === "trousers" || p === "trouser") return "pants"
  if (p === "jacket" || p === "blazer" || p === "coat") return "jacket"
  return "shirt"
}

/**
 * Compute real-cm tiling factors for a fabric on a given garment.
 *
 * @param productType  - "shirt" | "pants" | "jacket" (etc.)
 * @param repeatWidthCm  - Real repeat width of the fabric print in cm
 * @param repeatHeightCm - Real repeat height of the fabric print in cm
 * @param fineTune       - Optional ±20% fine-tune multiplier (default: 1.0)
 * @returns { repeatsX, repeatsY } suitable for `texture.repeat.set()`
 */
export function computeCmBasedRepeats(
  productType: string,
  repeatWidthCm: number,
  repeatHeightCm: number,
  fineTune = 1.0,
): { repeatsX: number; repeatsY: number } {
  const dims = getGarmentDimensionsCm(productType)
  const safeW = repeatWidthCm > 0 ? repeatWidthCm : 22 // 22cm fallback
  const safeH = repeatHeightCm > 0 ? repeatHeightCm : 22
  return {
    repeatsX: (dims.width / safeW) * fineTune,
    repeatsY: (dims.height / safeH) * fineTune,
  }
}

/** True when both cm values are set and positive — enables cm-based tiling. */
export function hasCmScaling(
  repeatWidthCm: number | undefined | null,
  repeatHeightCm: number | undefined | null,
): repeatWidthCm is number {
  return (
    typeof repeatWidthCm === "number" &&
    typeof repeatHeightCm === "number" &&
    repeatWidthCm > 0 &&
    repeatHeightCm > 0
  )
}
