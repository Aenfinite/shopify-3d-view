// ============================================================================
// SAFE CHINO option catalog (Layer 3).
// ----------------------------------------------------------------------------
// The fixed design options per item type (chino / shirt / belt). Drives the
// configurator UI and selection validation. Colour values match product_skus
// `color` so the article code resolves from (item_type, colour).
// ============================================================================

export type ItemType = "chino" | "shirt" | "belt"

export interface Option {
  value: string
  label: string
}
export interface ColorOption extends Option {
  hex: string
}

// ─── Colours ────────────────────────────────────────────────────────────────
export const CHINO_COLORS: ColorOption[] = [
  { value: "midnight-navy", label: "Midnight Navy", hex: "#1c2540" },
  { value: "urban-slate", label: "Urban Slate", hex: "#4a5568" },
  { value: "smoked-charcoal", label: "Smoked Charcoal", hex: "#36383b" },
  { value: "dark-wallnut", label: "Dark Wallnut", hex: "#4e3629" },
  { value: "muted-olive", label: "Muted Olive", hex: "#5b5e3a" },
  { value: "tobacco-camel", label: "Tobacco Camel", hex: "#a87a4a" },
  { value: "storm-grey", label: "Storm Grey", hex: "#7d8285" },
  { value: "stone-taupe", label: "Stone Taupe", hex: "#b9a98f" },
]

export const SHIRT_COLORS: ColorOption[] = [
  { value: "white", label: "White", hex: "#ffffff" },
  { value: "light-blue", label: "Light Blue", hex: "#bcd4e6" },
]

export const BELT_COLORS: ColorOption[] = [
  { value: "brown", label: "Brown", hex: "#5a3a23" },
  { value: "black", label: "Black", hex: "#1a1a1a" },
]

// ─── Shared embroidery options (chino + shirt) ───────────────────────────────
export const EMBROIDERY_FONTS: Option[] = [
  { value: "serif", label: "Serif" },
  { value: "sans", label: "Sans" },
  { value: "script", label: "Script" },
  { value: "block", label: "Block" },
]
export const EMBROIDERY_COLORS: ColorOption[] = [
  { value: "ivory", label: "Ivory", hex: "#fffff0" },
  { value: "navy", label: "Navy", hex: "#1c2540" },
  { value: "black", label: "Black", hex: "#1a1a1a" },
  { value: "burgundy", label: "Burgundy", hex: "#6e2639" },
  { value: "gold", label: "Gold", hex: "#c9a227" },
  { value: "silver", label: "Silver", hex: "#c0c0c0" },
]
export const EMBROIDERY_MAX_CHARS = 5

// ─── Chino options ──────────────────────────────────────────────────────────
export const CHINO_FRONT: Option[] = [
  { value: "plain", label: "Plain front" },
  { value: "one-front-pleat", label: "One front pleat" },
]
export const CHINO_BACK_POCKETS: Option[] = [
  { value: "flat-button", label: "Flat with button" },
  { value: "double-welt-zipper", label: "Double welt with zipper" },
]
export const SAFE_POCKET_POSITIONS: Option[] = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "both", label: "Both" },
]

// ─── Shirt options ──────────────────────────────────────────────────────────
export const SHIRT_COLLAR: Option[] = [
  { value: "kent", label: "Kent" },
  { value: "button-down", label: "Button-down" },
]
export const SHIRT_FRONT: Option[] = [
  { value: "french-front", label: "French front" },
  { value: "front-placket", label: "Front placket" },
]
export const SHIRT_BACK: Option[] = [
  { value: "plain", label: "Plain" },
  { value: "side-pleats", label: "Side pleats" },
]
export const SHIRT_SLEEVE: Option[] = [
  { value: "short", label: "Short sleeve" },
  { value: "long", label: "Long sleeve" },
]

export function colorsFor(itemType: string): ColorOption[] {
  if (itemType === "chino") return CHINO_COLORS
  if (itemType === "shirt") return SHIRT_COLORS
  if (itemType === "belt") return BELT_COLORS
  return []
}

/** Items that have design options beyond colour (belt is colour-only). */
export function hasConfigurableOptions(itemType: string): boolean {
  return itemType === "chino" || itemType === "shirt"
}
