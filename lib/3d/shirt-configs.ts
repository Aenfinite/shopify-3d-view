// Shirt part configuration — maps selectable options to GLTF model paths
// Follows the same pattern as pants-configs.ts and configs.ts (jackets)
//
// Model set lives under /public/models/Shirt/. The pieces assemble at a shared
// origin: Front + Back + Collar + Sleeve (+ Cuff for full sleeve) + optional Pocket.

export interface ShirtConfig {
  priority: {
    front: string      // Front placket (default: box placket)
    back: string       // Back / yoke panel (always present)
    collar: string     // Collar style (default: kent collar)
    sleeve: string     // Sleeve geometry (full or half)
    cuff?: string       // Cuff model — only loaded for full sleeves
  }
  secondary: {
    pocket?: string    // Optional chest pocket
  }
}

// ──────────────────── Collar configurations ────────────────────
export const shirtCollarConfigs: Record<string, string> = {
  'kent-collar': "/models/Shirt/Collar/Kent.gltf",
  'button-down-collar': "/models/Shirt/Collar/Buttondown.gltf",
  'spread-collar': "/models/Shirt/Collar/Spread.gltf",
}

// ──────────────────── Sleeve configurations ────────────────────
// Sleeve geometry only. For full sleeves a separate cuff (see shirtCuffConfigs)
// is loaded as well; half sleeves have no cuff.
export const shirtSleeveConfigs: Record<string, string> = {
  'full-sleeve': "/models/Shirt/Sleeves/Full.gltf",
  'half-sleeve': "/models/Shirt/Sleeves/Half.gltf",
}

// ──────────────────── Cuff configurations ────────────────────
// Only relevant when the user has selected full sleeves.
// Two selectable cuffs, both 2-button. Each model carries one fabric mesh
// ('cuff_outside' — the contrast surface) plus its button mesh ('Bottone').
// The older Rounded/French models are no longer selectable; their legacy option
// ids stay mapped to the new rounded cuff so saved configs keep rendering.
export const shirtCuffConfigs: Record<string, string> = {
  'rounded-cuff-2-buttons': "/models/Shirt/Cuff/Round.gltf",
  'square-cuff-2-buttons': "/models/Shirt/Cuff/Square.gltf",
  // Legacy ids from earlier saved configurations.
  'rounded-cuff': "/models/Shirt/Cuff/Round.gltf",
  'french-cuff': "/models/Shirt/Cuff/Round.gltf",
}

/** Fallback cuff used when no style is chosen or an unknown id is stored. */
export const DEFAULT_SHIRT_CUFF = 'rounded-cuff-2-buttons'

// ──────────────────── Chest pocket configurations ────────────────────
export const shirtPocketConfigs: Record<string, string | null> = {
  'no-pocket': null,
  'chest-pocket': "/models/Shirt/Pocket/Front.gltf",
}

// ──────────────────── Front placket configurations ────────────────────
export const shirtFrontConfigs: Record<string, string> = {
  'box-placket': "/models/Shirt/Front/Box.gltf",
  'french-placket': "/models/Shirt/Front/French.gltf",
}

// ──────────────────── Back panel ────────────────────
// Single shared back/yoke piece — always loaded regardless of other options.
export const shirtBackConfig = "/models/Shirt/Back/Back.gltf"

// ──────────────────── Default shirt configuration ────────────────────
// Kent collar + full sleeve (rounded 2-button cuff) + box placket + back + no pocket
export const defaultShirtConfig: ShirtConfig = {
  priority: {
    front: shirtFrontConfigs['box-placket'],
    back: shirtBackConfig,
    collar: shirtCollarConfigs['kent-collar'],
    sleeve: shirtSleeveConfigs['full-sleeve'],
    cuff: shirtCuffConfigs[DEFAULT_SHIRT_CUFF],
  },
  secondary: {
    pocket: undefined, // no pocket by default
  },
}
