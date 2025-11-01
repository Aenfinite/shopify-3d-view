/**
 * Basic Standard Jacket Model Configuration
 * 
 * This configuration is for a simple, standard jacket model without complex customizations.
 * It focuses on basic display and material changes rather than part swapping.
 */

import * as THREE from "three"

export interface StandardJacketParts {
  // Main jacket parts that should always be present
  mainBody?: THREE.Object3D
  leftSleeve?: THREE.Object3D
  rightSleeve?: THREE.Object3D
  collar?: THREE.Object3D
  buttons?: THREE.Object3D[]
  // Optional parts that might exist
  pockets?: THREE.Object3D[]
  lining?: THREE.Object3D
}

export interface BasicJacketCustomization {
  // Simple customizations for standard model
  fabricColor?: string
  fabricType?: string
  buttonColor?: string
  liningColor?: string
}

// Simple mapping for standard jacket model
export const standardJacketMapping = {
  // Main body - most common names
  body: [
    "jacket", "body", "main", "torso", "jacket_body", "main_body",
    "Jacket", "Body", "Main", "Torso", "JACKET", "BODY"
  ],
  
  // Sleeves - common naming patterns
  leftSleeve: [
    "sleeve_left", "left_sleeve", "sleeve_l", "l_sleeve", "sleeve.left",
    "Sleeve_Left", "Left_Sleeve", "SLEEVE_LEFT", "arm_left", "left_arm"
  ],
  
  rightSleeve: [
    "sleeve_right", "right_sleeve", "sleeve_r", "r_sleeve", "sleeve.right",
    "Sleeve_Right", "Right_Sleeve", "SLEEVE_RIGHT", "arm_right", "right_arm"
  ],
  
  // Collar variations
  collar: [
    "collar", "Collar", "COLLAR", "collar_main", "jacket_collar"
  ],
  
  // Buttons
  buttons: [
    "button", "buttons", "Button", "Buttons", "BUTTON", "BUTTONS",
    "button_front", "front_button", "jacket_button"
  ],
  
  // Pockets
  pockets: [
    "pocket", "pockets", "Pocket", "Pockets", "POCKET", "POCKETS"
  ],
  
  // Lining
  lining: [
    "lining", "Lining", "LINING", "inner", "Inner", "inside"
  ]
}

// Helper function to find parts in a standard model
export function findStandardJacketParts(model: THREE.Group): StandardJacketParts {
  const parts: StandardJacketParts = {
    buttons: [],
    pockets: []
  }

  // Function to check if object name matches any pattern
  const matchesPattern = (objectName: string, patterns: string[]): boolean => {
    const name = objectName.toLowerCase()
    return patterns.some(pattern => 
      name.includes(pattern.toLowerCase()) || 
      name === pattern.toLowerCase()
    )
  }

  // Traverse the model and find parts
  model.traverse((child: THREE.Object3D) => {
    if (!child.name) return

    const childName = child.name

    // Find main body
    if (!parts.mainBody && matchesPattern(childName, standardJacketMapping.body)) {
      parts.mainBody = child
      console.log("Found jacket body:", childName)
    }
    
    // Find left sleeve
    else if (!parts.leftSleeve && matchesPattern(childName, standardJacketMapping.leftSleeve)) {
      parts.leftSleeve = child
      console.log("Found left sleeve:", childName)
    }
    
    // Find right sleeve
    else if (!parts.rightSleeve && matchesPattern(childName, standardJacketMapping.rightSleeve)) {
      parts.rightSleeve = child
      console.log("Found right sleeve:", childName)
    }
    
    // Find collar
    else if (!parts.collar && matchesPattern(childName, standardJacketMapping.collar)) {
      parts.collar = child
      console.log("Found collar:", childName)
    }
    
    // Find buttons
    else if (matchesPattern(childName, standardJacketMapping.buttons)) {
      parts.buttons!.push(child)
      console.log("Found button:", childName)
    }
    
    // Find pockets
    else if (matchesPattern(childName, standardJacketMapping.pockets)) {
      parts.pockets!.push(child)
      console.log("Found pocket:", childName)
    }
    
    // Find lining
    else if (!parts.lining && matchesPattern(childName, standardJacketMapping.lining)) {
      parts.lining = child
      console.log("Found lining:", childName)
    }
  })

  console.log("Found jacket parts:", {
    hasBody: !!parts.mainBody,
    hasLeftSleeve: !!parts.leftSleeve,
    hasRightSleeve: !!parts.rightSleeve,
    hasCollar: !!parts.collar,
    buttonCount: parts.buttons?.length || 0,
    pocketCount: parts.pockets?.length || 0,
    hasLining: !!parts.lining
  })

  return parts
}

// Apply basic customizations to standard model
export function applyStandardCustomizations(
  parts: StandardJacketParts, 
  customizations: BasicJacketCustomization
): void {
  const { fabricColor, fabricType, buttonColor, liningColor } = customizations

  // Apply fabric color to main parts
  if (fabricColor) {
    const mainParts = [parts.mainBody, parts.leftSleeve, parts.rightSleeve, parts.collar]
    
    mainParts.forEach(part => {
      if (part) {
        applyColorToPart(part, fabricColor)
      }
    })

    // Apply to pockets
    parts.pockets?.forEach(pocket => {
      applyColorToPart(pocket, fabricColor)
    })
  }

  // Apply lining color
  if (liningColor && parts.lining) {
    applyColorToPart(parts.lining, liningColor)
  }

  // Apply button color
  if (buttonColor) {
    parts.buttons?.forEach(button => {
      applyColorToPart(button, buttonColor)
    })
  }

  // Apply fabric type properties
  if (fabricType) {
    const mainParts = [parts.mainBody, parts.leftSleeve, parts.rightSleeve]
    
    mainParts.forEach(part => {
      if (part) {
        applyFabricProperties(part, fabricType)
      }
    })
  }
}

// Helper function to apply color to a part
function applyColorToPart(object: THREE.Object3D, color: string): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const material = Array.isArray(child.material) ? child.material[0] : child.material
      
      if (material instanceof THREE.MeshStandardMaterial || 
          material instanceof THREE.MeshPhongMaterial ||
          material instanceof THREE.MeshLambertMaterial) {
        material.color.setStyle(color)
        material.needsUpdate = true
      }
    }
  })
}

// Helper function to apply fabric type properties
function applyFabricProperties(object: THREE.Object3D, fabricType: string): void {
  const properties = getFabricProperties(fabricType)
  
  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const material = Array.isArray(child.material) ? child.material[0] : child.material
      
      if (material instanceof THREE.MeshStandardMaterial) {
        material.roughness = properties.roughness
        material.metalness = properties.metalness
        material.needsUpdate = true
      }
    }
  })
}

// Get material properties for different fabric types
function getFabricProperties(fabricType: string): { roughness: number; metalness: number } {
  switch (fabricType.toLowerCase()) {
    case 'wool':
    case 'wool-blend':
      return { roughness: 0.8, metalness: 0.0 }
    case 'silk':
      return { roughness: 0.2, metalness: 0.1 }
    case 'cotton':
    case 'cotton-blend':
      return { roughness: 0.9, metalness: 0.0 }
    case 'velvet':
      return { roughness: 0.95, metalness: 0.0 }
    case 'leather':
      return { roughness: 0.3, metalness: 0.0 }
    case 'linen':
    case 'linen-blend':
      return { roughness: 0.85, metalness: 0.0 }
    default:
      return { roughness: 0.6, metalness: 0.1 }
  }
}