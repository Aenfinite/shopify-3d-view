/**
 * Jacket Parts Mapping Configuration
 * 
 * This file defines how customization options map to GLTF model parts.
 * It provides a flexible system for different jacket models with various naming conventions.
 */

import * as THREE from "three"

export interface PartMapping {
  // Exact mesh/node names in the GLTF model
  meshNames: string[]
  // Alternative names to check for
  alternatives?: string[]
  // Whether this part should be hidden/shown based on customization
  visibility?: {
    showWhen?: string[]
    hideWhen?: string[]
  }
  // Material modifications
  materialChanges?: {
    color?: boolean
    texture?: boolean
    roughness?: number
    metalness?: number
  }
}

export interface JacketPartsMapping {
  // Main body parts
  body: PartMapping
  sleeves: {
    left: PartMapping
    right: PartMapping
  }
  
  // Front panels
  front: {
    left: PartMapping
    right: PartMapping
  }
  
  // Lapel variations
  lapels: {
    notched: {
      left: PartMapping
      right: PartMapping
    }
    peak: {
      left: PartMapping
      right: PartMapping
    }
    shawl: {
      left: PartMapping
      right: PartMapping
    }
  }
  
  // Pocket variations
  pockets: {
    chest: {
      welt: PartMapping
      flap: PartMapping
      patch: PartMapping
    }
    waist: {
      welt: PartMapping
      flap: PartMapping
      patch: PartMapping
    }
  }
  
  // Button configurations
  buttons: {
    front: {
      single: PartMapping
      double: PartMapping
    }
    sleeves: PartMapping
  }
  
  // Collar variations
  collar: {
    standard: PartMapping
    mandarin: PartMapping
    wing: PartMapping
  }
  
  // Cuffs
  cuffs: {
    left: PartMapping
    right: PartMapping
  }
  
  // Lining
  lining: PartMapping
  
  // Vents
  vents: {
    single: PartMapping
    double: PartMapping
    none: PartMapping
  }
}

// Default mapping for standard jacket models
export const defaultJacketMapping: JacketPartsMapping = {
  body: {
    meshNames: ["jacket_body", "body", "main_body", "torso"],
    alternatives: ["jacket_main", "main", "body_main"],
    materialChanges: {
      color: true,
      texture: true,
      roughness: 0.6,
      metalness: 0.1
    }
  },
  
  sleeves: {
    left: {
      meshNames: ["sleeve_left", "left_sleeve", "l_sleeve", "sleeve_L"],
      alternatives: ["arm_left", "left_arm"],
      materialChanges: {
        color: true,
        texture: true
      }
    },
    right: {
      meshNames: ["sleeve_right", "right_sleeve", "r_sleeve", "sleeve_R"],
      alternatives: ["arm_right", "right_arm"],
      materialChanges: {
        color: true,
        texture: true
      }
    }
  },
  
  front: {
    left: {
      meshNames: ["front_left", "left_front", "l_front", "front_L"],
      alternatives: ["panel_left", "left_panel"],
      materialChanges: {
        color: true,
        texture: true
      }
    },
    right: {
      meshNames: ["front_right", "right_front", "r_front", "front_R"],
      alternatives: ["panel_right", "right_panel"],
      materialChanges: {
        color: true,
        texture: true
      }
    }
  },
  
  lapels: {
    notched: {
      left: {
        meshNames: ["lapel_notched_left", "notched_lapel_left", "lapel_left_notched"],
        alternatives: ["lapel_left"],
        visibility: {
          showWhen: ["notched", "standard"],
          hideWhen: ["peak", "shawl"]
        }
      },
      right: {
        meshNames: ["lapel_notched_right", "notched_lapel_right", "lapel_right_notched"],
        alternatives: ["lapel_right"],
        visibility: {
          showWhen: ["notched", "standard"],
          hideWhen: ["peak", "shawl"]
        }
      }
    },
    peak: {
      left: {
        meshNames: ["lapel_peak_left", "peak_lapel_left", "lapel_left_peak"],
        visibility: {
          showWhen: ["peak"],
          hideWhen: ["notched", "shawl", "standard"]
        }
      },
      right: {
        meshNames: ["lapel_peak_right", "peak_lapel_right", "lapel_right_peak"],
        visibility: {
          showWhen: ["peak"],
          hideWhen: ["notched", "shawl", "standard"]
        }
      }
    },
    shawl: {
      left: {
        meshNames: ["lapel_shawl_left", "shawl_lapel_left", "lapel_left_shawl"],
        visibility: {
          showWhen: ["shawl"],
          hideWhen: ["notched", "peak", "standard"]
        }
      },
      right: {
        meshNames: ["lapel_shawl_right", "shawl_lapel_right", "lapel_right_shawl"],
        visibility: {
          showWhen: ["shawl"],
          hideWhen: ["notched", "peak", "standard"]
        }
      }
    }
  },
  
  pockets: {
    chest: {
      welt: {
        meshNames: ["pocket_chest_welt", "chest_pocket_welt", "welt_pocket_chest"],
        visibility: {
          showWhen: ["welt", "welted"],
          hideWhen: ["flap", "patch", "none"]
        }
      },
      flap: {
        meshNames: ["pocket_chest_flap", "chest_pocket_flap", "flap_pocket_chest"],
        visibility: {
          showWhen: ["flap", "flapped"],
          hideWhen: ["welt", "patch", "none"]
        }
      },
      patch: {
        meshNames: ["pocket_chest_patch", "chest_pocket_patch", "patch_pocket_chest"],
        visibility: {
          showWhen: ["patch"],
          hideWhen: ["welt", "flap", "none"]
        }
      }
    },
    waist: {
      welt: {
        meshNames: ["pocket_waist_welt", "waist_pocket_welt", "welt_pocket_waist", "side_pocket_welt"],
        visibility: {
          showWhen: ["welt", "welted"],
          hideWhen: ["flap", "patch", "none"]
        }
      },
      flap: {
        meshNames: ["pocket_waist_flap", "waist_pocket_flap", "flap_pocket_waist", "side_pocket_flap"],
        visibility: {
          showWhen: ["flap", "flapped"],
          hideWhen: ["welt", "patch", "none"]
        }
      },
      patch: {
        meshNames: ["pocket_waist_patch", "waist_pocket_patch", "patch_pocket_waist", "side_pocket_patch"],
        visibility: {
          showWhen: ["patch"],
          hideWhen: ["welt", "flap", "none"]
        }
      }
    }
  },
  
  buttons: {
    front: {
      single: {
        meshNames: ["button_front_single", "front_button_single", "single_button"],
        alternatives: ["button_front", "front_buttons"],
        visibility: {
          showWhen: ["single-breasted", "single"],
          hideWhen: ["double-breasted", "double"]
        }
      },
      double: {
        meshNames: ["button_front_double", "front_button_double", "double_button"],
        visibility: {
          showWhen: ["double-breasted", "double"],
          hideWhen: ["single-breasted", "single"]
        }
      }
    },
    sleeves: {
      meshNames: ["button_sleeve", "sleeve_button", "cuff_button"],
      alternatives: ["buttons_sleeve", "sleeve_buttons"],
      materialChanges: {
        color: false,
        metalness: 0.3,
        roughness: 0.7
      }
    }
  },
  
  collar: {
    standard: {
      meshNames: ["collar", "collar_standard", "standard_collar"],
      visibility: {
        showWhen: ["standard", "regular"],
        hideWhen: ["mandarin", "wing"]
      }
    },
    mandarin: {
      meshNames: ["collar_mandarin", "mandarin_collar", "band_collar"],
      visibility: {
        showWhen: ["mandarin", "band"],
        hideWhen: ["standard", "wing"]
      }
    },
    wing: {
      meshNames: ["collar_wing", "wing_collar"],
      visibility: {
        showWhen: ["wing"],
        hideWhen: ["standard", "mandarin"]
      }
    }
  },
  
  cuffs: {
    left: {
      meshNames: ["cuff_left", "left_cuff", "l_cuff", "cuff_L"],
      materialChanges: {
        color: true,
        texture: true
      }
    },
    right: {
      meshNames: ["cuff_right", "right_cuff", "r_cuff", "cuff_R"],
      materialChanges: {
        color: true,
        texture: true
      }
    }
  },
  
  lining: {
    meshNames: ["lining", "inner_lining", "jacket_lining"],
    alternatives: ["inner", "inside"],
    materialChanges: {
      color: true,
      texture: true,
      roughness: 0.4,
      metalness: 0.0
    }
  },
  
  vents: {
    single: {
      meshNames: ["vent_single", "single_vent", "center_vent"],
      visibility: {
        showWhen: ["single", "center"],
        hideWhen: ["double", "none"]
      }
    },
    double: {
      meshNames: ["vent_double", "double_vent", "side_vent"],
      visibility: {
        showWhen: ["double", "side"],
        hideWhen: ["single", "none"]
      }
    },
    none: {
      meshNames: ["vent_none"],
      visibility: {
        showWhen: ["none"],
        hideWhen: ["single", "double"]
      }
    }
  }
}

// Helper function to find mesh by name using the mapping
export function findMeshByMapping(model: THREE.Object3D, mapping: PartMapping): THREE.Object3D | null {
  let foundMesh: THREE.Object3D | null = null
  
  model.traverse((child: THREE.Object3D) => {
    if (foundMesh) return // Already found
    
    const childName = child.name.toLowerCase()
    
    // Check primary names
    if (mapping.meshNames.some(name => childName.includes(name.toLowerCase()))) {
      foundMesh = child
      return
    }
    
    // Check alternatives
    if (mapping.alternatives?.some(name => childName.includes(name.toLowerCase()))) {
      foundMesh = child
      return
    }
  })
  
  return foundMesh
}

// Helper function to check if part should be visible based on customization
export function shouldPartBeVisible(mapping: PartMapping, customizationValue: string): boolean {
  if (!mapping.visibility) return true
  
  const value = customizationValue.toLowerCase()
  
  if (mapping.visibility.showWhen) {
    return mapping.visibility.showWhen.some(condition => 
      value.includes(condition.toLowerCase())
    )
  }
  
  if (mapping.visibility.hideWhen) {
    return !mapping.visibility.hideWhen.some(condition => 
      value.includes(condition.toLowerCase())
    )
  }
  
  return true
}

// Export the default mapping
export { defaultJacketMapping as jacketPartsMapping }