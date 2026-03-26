// Shirt part configuration — maps selectable options to GLTF model paths
// Follows the same pattern as pants-configs.ts and configs.ts (jackets)

export interface ShirtConfig {
  priority: {
    front: string      // Front placket (default: box placket)
    collar: string     // Collar style (default: kent collar)
    sleeve: string     // Sleeve or cuff model (default: rounded cuff = full sleeve)
  }
  secondary: {
    pocket?: string    // Optional chest pocket
  }
}

// ──────────────────── Collar configurations ────────────────────
export const shirtCollarConfigs: Record<string, string> = {
  'kent-collar': "/models/shirts/Collar/kentcollar.gltf",
  'button-down-collar': "/models/shirts/Collar/Buttondowncollar.gltf",
  'spread-collar': "/models/shirts/Collar/spreadcollar.gltf",
}

// ──────────────────── Sleeve configurations ────────────────────
// "Full sleeve" means a cuff model is loaded (cuffs include the sleeve)
// "Half sleeve" loads the standalone half-sleeve model
export const shirtSleeveConfigs: Record<string, string> = {
  'half-sleeve': "/models/shirts/Sleeve/halfsleeve.gltf",
  'full-sleeve-rounded': "/models/shirts/Cuffs/roundedcuff.gltf",   // default for full sleeve
  'full-sleeve-french': "/models/shirts/Cuffs/frenchcuff.gltf",
}

// ──────────────────── Cuff configurations ────────────────────
// Only relevant when user has selected full sleeves
export const shirtCuffConfigs: Record<string, string> = {
  'rounded-cuff': "/models/shirts/Cuffs/roundedcuff.gltf",
  'french-cuff': "/models/shirts/Cuffs/frenchcuff.gltf",
}

// ──────────────────── Chest pocket configurations ────────────────────
export const shirtPocketConfigs: Record<string, string | null> = {
  'no-pocket': null,
  'chest-pocket': "/models/shirts/Pocket/pocket.gltf",
}

// ──────────────────── Front placket configurations ────────────────────
export const shirtFrontConfigs: Record<string, string> = {
  'box-placket': "/models/shirts/Front/boxplacket.gltf",
  'french-placket': "/models/shirts/Front/frenchfront.gltf",
}

// ──────────────────── Default shirt configuration ────────────────────
// Kent collar + full sleeve (rounded cuff) + box placket + no pocket
export const defaultShirtConfig: ShirtConfig = {
  priority: {
    front: shirtFrontConfigs['box-placket'],
    collar: shirtCollarConfigs['kent-collar'],
    sleeve: shirtSleeveConfigs['full-sleeve-rounded'],
  },
  secondary: {
    pocket: undefined, // no pocket by default
  },
}
