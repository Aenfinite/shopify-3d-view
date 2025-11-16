import type { FrontStyle, JacketConfig } from "./modular-jacket-loader"

export const jacketConfigs: Record<FrontStyle, JacketConfig> = {
  '2button': {
    priority: {
      frontBottom: "/models/jackets/Front/Bottom/2Button/Curved.gltf",
      frontButtons: "/models/jackets/Front/Button/2Button/S4.gltf",
      frontThread: "/models/jackets/Front/Thread/2Button.gltf",
      lapelUpper: "/models/jackets/Lapel/Regular/Upper/2Button/CL2.gltf",
      lapelLower: "/models/jackets/Lapel/Regular/Lower/2Button/CL2.gltf"
    },
    secondary: {
      sleeve: "/models/jackets/Sleeve/Sleeve.gltf",
      sleeveWorkingButtons: "/models/jackets/Sleeve/Working/4Button/S4.gltf",
      sleeveLastButton: "/models/jackets/Sleeve/Working/LastButton/S4.gltf",
      sleeveButtonThread: "/models/jackets/Sleeve/Working/Thread/LastThread.gltf",
      sleeve4ButtonThread: "/models/jackets/Sleeve/Working/Thread/4Button.gltf",
      centerVent: "/models/jackets/Vent/NoVent.gltf"
    }
  },
  '3button': {
    priority: {
      frontBottom: "/models/jackets/Front/Bottom/3Button/Curved.gltf",
      frontButtons: "/models/jackets/Front/Button/3Button/S4.gltf",
      frontThread: "/models/jackets/Front/Thread/3Button.gltf",
      lapelUpper: "/models/jackets/Lapel/Regular/Upper/3Button/CL2.gltf",
      lapelLower: "/models/jackets/Lapel/Regular/Lower/3Button/CL2.gltf"
    },
    secondary: {
      sleeve: "/models/jackets/Sleeve/Sleeve.gltf",
      sleeveWorkingButtons: "/models/jackets/Sleeve/Working/4Button/S4.gltf",
      sleeveLastButton: "/models/jackets/Sleeve/Working/LastButton/S4.gltf",
      sleeveButtonThread: "/models/jackets/Sleeve/Working/Thread/LastThread.gltf",
      sleeve4ButtonThread: "/models/jackets/Sleeve/Working/Thread/4Button.gltf",
      centerVent: "/models/jackets/Vent/NoVent.gltf"
    }
  },
  '6d2': {
    priority: {
      frontBottom: "/models/jackets/Front/Bottom/6D2/Straight.gltf",
      frontButtons: "/models/jackets/Front/Button/6D2/S4.gltf",
      frontThread: "/models/jackets/Front/Thread/6D2.gltf",
      lapelUpper: "/models/jackets/Lapel/Regular/Upper/6D2/CL1.gltf",
      lapelLower: "/models/jackets/Lapel/Regular/Lower/6D2/CL1.gltf"
    },
    secondary: {
      sleeve: "/models/jackets/Sleeve/Sleeve.gltf",
      sleeveWorkingButtons: "/models/jackets/Sleeve/Working/4Button/S4.gltf",
      sleeveLastButton: "/models/jackets/Sleeve/Working/LastButton/S4.gltf",
      sleeveButtonThread: "/models/jackets/Sleeve/Working/Thread/LastThread.gltf",
      sleeve4ButtonThread: "/models/jackets/Sleeve/Working/Thrad/4Button.gltf",
      centerVent: "/models/jackets/Vent/NoVent.gltf"
    }
  }
};

// Pocket style configurations - maps pocket selection to GLTF files
export const pocketConfigs: Record<string, { frontPocket: string; chestPocket?: string }> = {
  'flap-pocket': {
    frontPocket: "/models/jackets/Pocket/PK-1.gltf", // Flap pocket uses PK-9
    chestPocket: "/models/jackets/Pocket/ChestPocket.gltf"
  },
  'patch-pocket': {
    frontPocket: "/models/jackets/Pocket/PK-9.gltf", // Patch pocket uses PK-1
    chestPocket: "/models/jackets/Pocket/ChestPocket.gltf"
  }
};

// Chest pocket configurations
export const chestPocketConfigs: Record<string, string> = {
  'piping-pocket': "/models/jackets/Pocket/ChestPocket.gltf",  // Piping pocket
  'patch-pocket-chest': "/models/jackets/Pocket/ChestPatch2.gltf"  // Patch pocket for chest
};

// Sleeve button configurations
export const sleeveButtonConfigs: Record<string, {
  showThreads: boolean;  // Whether to show thread models
  sleeveWorkingButtons?: string;
  sleeveLastButton?: string;
}> = {
  '4-buttons-with-holes': {
    showThreads: true,  // Show threads for buttons with holes
    sleeveWorkingButtons: "/models/jackets/Sleeve/Working/4Button/S4.gltf",
    sleeveLastButton: "/models/jackets/Sleeve/Working/LastButton/S4.gltf"
  },
  '4-buttons-no-holes': {
    showThreads: false,  // No threads for buttons without holes
    sleeveWorkingButtons: "/models/jackets/Sleeve/Working/4Button/S4.gltf",
    sleeveLastButton: "/models/jackets/Sleeve/Working/LastButton/S4.gltf"
  }
};

// Vent style configurations
export const ventStyleConfigs: Record<string, string> = {
  'one-back-vent': "/models/jackets/Vent/CenterVent.gltf",  // One back vent = center vent
  'two-back-vent': "/models/jackets/Vent/SideVent.gltf"     // Two back vent = side vents
};