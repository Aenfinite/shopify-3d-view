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

// Main pants configurations
export const pantsConfigs: Record<string, PantsConfig> = {
  'flat-front': {
    priority: {
      style: "/models/pants/Style/Flat/Normal.gltf",
      beltLoops: "/models/pants/Beltloops/Single.gltf",
      waistband: "/models/pants/Waistband/Normal.gltf"
    },
    secondary: {}
  },
  'one-pleat': {
    priority: {
      style: "/models/pants/Style/1Pleats/Normal.gltf",
      beltLoops: "/models/pants/Beltloops/Single.gltf",
      waistband: "/models/pants/Waistband/Normal.gltf"
    },
    secondary: {}
  },
  'two-pleats': {
    priority: {
      style: "/models/pants/Style/2Pleats/Normal.gltf",
      beltLoops: "/models/pants/Beltloops/Single.gltf",
      waistband: "/models/pants/Waistband/Normal.gltf"
    },
    secondary: {}
  }
}

// Front pocket configurations
export const pantsFrontPocketConfigs: Record<string, string> = {
  'slanted-pockets': "/models/pants/Pocket/Slanted/Slanted.gltf",
  'seam-pockets': "/models/pants/Pocket/Seam/StraightWelt.gltf",
  'jeans-pockets': "/models/pants/Pocket/Jeans/Jeans.gltf"
}

// Back pocket configurations
export const pantsBackPocketConfigs: Record<string, string[]> = {
  'buttoned-welt': ["/models/pants/Backpockets/ButtonedWelt/Normal.gltf"],
  'welt-with-zipper': ["/models/pants/Backpockets/ZipWelt/Normal.gltf"],
  'flap-pocket': [
    "/models/pants/Backpockets/Flap/Modern.gltf",
    "/models/pants/Backpockets/Flap/S4.gltf",
    "/models/pants/Backpockets/Flap/Thread.gltf"
  ],
  'patch-pocket': ["/models/pants/Backpockets/Patch/Normal.gltf"]
}

// Bottom cuff configurations
export const pantsCuffConfigs: Record<string, string | null> = {
  'turn-ups': null, // No cuff (normal)
  'straight-hem': "/models/pants/Cuff/Cuff.gltf" // With cuff
}

// Waist band extension configurations
export const pantsWaistbandConfigs: Record<string, string[]> = {
  'no-extension': ["/models/pants/Waistband/Normal.gltf"],
  'with-extension': [
    "/models/pants/Beltloops/buttonsideadjusters.gltf",
    "/models/pants/Beltloops/s4.gltf",
    "/models/pants/Beltloops/thread.gltf"
  ]
}
