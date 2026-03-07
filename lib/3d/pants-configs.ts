export interface PantsConfig {
  priority: {
    style: string
    beltLoops: string
    waistband: string
  }
  secondary: {
    frontPocket?: string
    backPocket?: string
    cuff?: string
    lining?: string
  }
}

// Main pants configurations — updated to match new model folder structure
export const pantsConfigs: Record<string, PantsConfig> = {
  'flat-front': {
    priority: {
      style: "/models/pants/FrontStyle/NoPleats.gltf",
      beltLoops: "/models/pants/BeltLoops/01.gltf",
      waistband: "/models/pants/Backandbasebeltarea/Basemodel.gltf"
    },
    secondary: {}
  },
  'one-pleat': {
    priority: {
      style: "/models/pants/FrontStyle/1Pleat.gltf",
      beltLoops: "/models/pants/BeltLoops/01.gltf",
      waistband: "/models/pants/Backandbasebeltarea/Basemodel.gltf"
    },
    secondary: {}
  },
  'two-pleats': {
    priority: {
      style: "/models/pants/FrontStyle/2Pleats.gltf",
      beltLoops: "/models/pants/BeltLoops/01.gltf",
      waistband: "/models/pants/Backandbasebeltarea/Basemodel.gltf"
    },
    secondary: {}
  }
}

// Front pocket configurations
export const pantsFrontPocketConfigs: Record<string, string> = {
  'slanted-pockets': "/models/pants/Pockets/Slanted.gltf",
  'seam-pockets': "/models/pants/Pockets/StraightWelt.gltf",
  'jeans-pockets': "/models/pants/Pockets/Jeanss.gltf"
}

// Back pocket configurations
export const pantsBackPocketConfigs: Record<string, string[]> = {
  'buttoned-welt': ["/models/pants/BackPockets/Buttonedweltpocket.gltf"],
  'welt-with-zipper': ["/models/pants/BackPockets/ZipWelt.gltf"],
  'flap-pocket': ["/models/pants/BackPockets/Flap.gltf"],
  'patch-pocket': ["/models/pants/BackPockets/Patch.gltf"]
}

// Bottom cuff configurations
export const pantsCuffConfigs: Record<string, string | null> = {
  'turn-ups': null, // No cuff (normal)
  'straight-hem': "/models/pants/BottomCuffs/22020.gltf" // With cuff
}

// Waist band extension configurations
export const pantsWaistbandConfigs: Record<string, string[]> = {
  'no-extension': ["/models/pants/Backandbasebeltarea/Basemodel.gltf"],
  'with-extension': ["/models/pants/BeltLoops/01.gltf"]
}
