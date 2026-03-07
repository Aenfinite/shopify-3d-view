import * as THREE from "three"
import type { BasicJacketCustomization } from "@/types/configurator"
import { getMeshCategory, ColorCategories } from "./modular-jacket-loader"

/**
 * Adjusts the brightness of a color
 * @param color - The hex color string (e.g., "#ff0000")
 * @param factor - Brightness factor (0.0 to 1.0 for darker, > 1.0 for lighter)
 * @returns Adjusted hex color string
 */
function adjustColorBrightness(color: string, factor: number): string {
  try {
    const tempColor = new THREE.Color(color)
    
    // Adjust RGB values by the factor
    tempColor.r = Math.max(0, Math.min(1, tempColor.r * factor))
    tempColor.g = Math.max(0, Math.min(1, tempColor.g * factor))
    tempColor.b = Math.max(0, Math.min(1, tempColor.b * factor))
    
    return `#${tempColor.getHexString()}`
  } catch (error) {
    console.error(`❌ Error adjusting color brightness:`, error)
    return color // Return original color if error
  }
}

/**
 * Applies customizations to a loaded jacket part
 * @param object The 3D object to customize
 * @param customizations The customization options to apply
 */
export function applyCustomizations(object: THREE.Object3D, customizations: BasicJacketCustomization) {
  if (!customizations) return
  console.log("🎨 Applying customizations:", customizations)

  object.traverse((child: THREE.Object3D) => {
    if (!(child instanceof THREE.Mesh)) return

    // Get mesh category and log attempt
    console.log(`🔍 Checking category for mesh: ${child.name}`)
    const category = getMeshCategory(child.name)
    
    // If no category found, try common patterns
    if (!category) {
      const nameLower = child.name.toLowerCase()
      
      // Check for pocket patterns (should ALWAYS match fabric color)
      if (nameLower.includes('pocket') || nameLower.includes('pk-') || nameLower.includes('pk1') || 
          nameLower.includes('pk7') || nameLower.includes('pk9') || nameLower.includes('chest') ||
          nameLower.includes('patch') || nameLower.includes('cube')) {
        console.log(`🎯 Identified POCKET by name pattern: ${child.name} -> Applying FABRIC color`)
        if (customizations.fabricColor) {
          applyMaterialColor(child, customizations.fabricColor)
          return
        }
      }
      
      // Check for lapel/collar patterns
      if (nameLower.includes('lapel') || nameLower.includes('collar') || 
          nameLower.includes('cl1') || nameLower.includes('cl2') || nameLower.includes('cl3')) {
        console.log(`🎯 Identified lapel/collar by name pattern: ${child.name}`)
        if (customizations.lapelColor) {
          applyMaterialColor(child, customizations.lapelColor)
          return
        } else if (customizations.fabricColor) {
          // Check if fabricColor is a texture or solid color
          const isTexture = customizations.fabricColor.startsWith('/') || /\.(jpg|jpeg|png|webp)$/i.test(customizations.fabricColor)
          if (isTexture) {
            // Apply same texture for collar/lapel
            applyMaterialColor(child, customizations.fabricColor)
          } else {
            // Apply a slightly darker shade for collar/lapel contrast (solid colors only)
            const darkerColor = adjustColorBrightness(customizations.fabricColor, 0.85)
            applyMaterialColor(child, darkerColor)
          }
          return
        }
      }
      
      // Check for THREAD patterns FIRST (before buttons) to avoid confusion
      if (nameLower.includes('thread') || nameLower.includes('stitching') || nameLower.includes('hole')) {
        console.log(`🧵 Identified THREAD by name pattern: ${child.name} -> Applying FABRIC color`)
        if (customizations.fabricColor) {
          applyMaterialColor(child, customizations.fabricColor)
          return
        }
      }
      
      // Check for button patterns AFTER thread check - EXCLUDE thread from button matching
      if (!nameLower.includes('thread') && !nameLower.includes('stitching') && !nameLower.includes('hole')) {
        if (nameLower.includes('button') || nameLower.includes('standard') || 
            nameLower.includes('s4') || nameLower.includes('s14') || nameLower.includes('circle')) {
          console.log(`🔘 Identified BUTTON by name pattern: ${child.name} -> Applying buttonColor`)
          if (customizations.buttonColor) {
            applyMaterialColor(child, customizations.buttonColor)
            return
          }
        }
      }
      
      // Check for LINING patterns - catch LiningCurved, Lining-Half, PocketLining and other lining meshes
      if (nameLower.includes('lining') || nameLower.includes('curved') || 
          nameLower.includes('fully') || nameLower.includes('interior') ||
          nameLower.includes('lining-half') || nameLower.includes('pocketlining')) {
        console.log(`🎨 Identified LINING by name pattern: ${child.name}`)
        
        // Save original material for restoration
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          if (!child.userData._originalLiningMaterial) {
            child.userData._originalLiningMaterial = {
              color: child.material.color.clone(),
              map: child.material.map,
              roughness: child.material.roughness,
              metalness: child.material.metalness,
              envMapIntensity: child.material.envMapIntensity,
              flatShading: child.material.flatShading,
            }
          }
        }
        
        if (customizations.liningColor) {
          applyMaterialColor(child, customizations.liningColor)
          return
        } else if (customizations.liningMeshType === 'standard' || !customizations.liningMeshType) {
          // Standard lining - restore original GLTF texture
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial && child.userData._originalLiningMaterial) {
            const orig = child.userData._originalLiningMaterial
            child.material.color.copy(orig.color)
            child.material.map = orig.map
            child.material.roughness = orig.roughness
            child.material.metalness = orig.metalness
            child.material.envMapIntensity = orig.envMapIntensity
            child.material.flatShading = orig.flatShading
            child.material.needsUpdate = true
            console.log(`🔄 Restored original GLTF material for: ${child.name}`)
          }
          return
        }
      }
      
      console.log(`⚠️ No category found for mesh: ${child.name}`)
      return
    }

    try {
      switch (category) {
        case ColorCategories.MAIN_FABRIC:
          console.log(`🎨 Applying FABRIC color to: ${child.name}`)
          if (customizations.fabricColor) {
            applyMaterialColor(child, customizations.fabricColor)
          }
          break

        case ColorCategories.UPPER_LAPEL:
          console.log(`🎨 Applying UPPER LAPEL color to: ${child.name}`)
          if (customizations.lapelColor) {
            applyMaterialColor(child, customizations.lapelColor)
          } else if (customizations.fabricColor) {
            // Check if fabricColor is a texture or solid color
            const isTexture = customizations.fabricColor.startsWith('/') || /\.(jpg|jpeg|png|webp)$/i.test(customizations.fabricColor)
            if (isTexture) {
              // Apply same texture for upper lapel
              applyMaterialColor(child, customizations.fabricColor)
            } else {
              // Apply a slightly darker shade of fabric color for contrast (solid colors only)
              const darkerColor = adjustColorBrightness(customizations.fabricColor, 0.85)
              applyMaterialColor(child, darkerColor)
            }
          }
          break

        case ColorCategories.LOWER_LAPEL:
          console.log(`🎨 Applying LOWER LAPEL color to: ${child.name}`)
          if (customizations.lapelColor) {
            applyMaterialColor(child, customizations.lapelColor)
          } else if (customizations.fabricColor) {
            // Check if fabricColor is a texture or solid color
            const isTexture = customizations.fabricColor.startsWith('/') || /\.(jpg|jpeg|png|webp)$/i.test(customizations.fabricColor)
            if (isTexture) {
              // Apply same texture for lower lapel
              applyMaterialColor(child, customizations.fabricColor)
            } else {
              // Apply a slightly darker shade of fabric color for contrast (solid colors only)
              const darkerColor = adjustColorBrightness(customizations.fabricColor, 0.85)
              applyMaterialColor(child, darkerColor)
            }
          }
          break

        case ColorCategories.BUTTONS:
          console.log(`🔘 Applying BUTTON color to: ${child.name}`)
          // If buttonColor is not set or is "standard", use fabricColor instead
          if (customizations.buttonColor && customizations.buttonColor !== "standard") {
            applyMaterialColor(child, customizations.buttonColor)
          } else if (customizations.fabricColor) {
            // Use fabric color for standard/matching buttons
            applyMaterialColor(child, customizations.fabricColor)
          }
          break

        case ColorCategories.THREAD:
          console.log(`🧵 Applying THREAD color to: ${child.name}`)
          // Thread ALWAYS matches fabric color - IGNORE customizations.threadColor
          if (customizations.fabricColor) {
            applyMaterialColor(child, customizations.fabricColor)
            console.log(`✅ Thread color FORCED to match fabric: ${customizations.fabricColor}`)
          }
          break

        case ColorCategories.LINING:
          console.log(`🎨 LINING MESH DETECTED: ${child.name}`, {
            exactMeshName: child.name,
            liningColor: customizations.liningColor,
            liningMeshType: customizations.liningMeshType,
          })
          
          // Apply lining based on mesh type selection
          const meshName = child.name.toLowerCase()
          const isUnlined = customizations.liningMeshType === "unlined"
          const isStandardLining = customizations.liningMeshType === "standard" || !customizations.liningMeshType
          const isHalfLined = customizations.liningMeshType === "custom-coloured" // Half Lined
          const isFullLined = customizations.liningMeshType === "quilted" // Full Lined
          
          // If explicitly unlined, hide the lining mesh
          if (isUnlined) {
            console.log(`⏭️ Hiding ${child.name} - unlined selected`)
            child.visible = false
            break
          }
          
          // Save original material state for restoration when switching back to standard
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            if (!child.userData._originalLiningMaterial) {
              child.userData._originalLiningMaterial = {
                color: child.material.color.clone(),
                map: child.material.map,
                roughness: child.material.roughness,
                metalness: child.material.metalness,
                envMapIntensity: child.material.envMapIntensity,
                flatShading: child.material.flatShading,
              }
              console.log(`💾 Saved original lining material for ${child.name}`)
            }
          }
          
          // Standard lining - restore original GLTF texture
          if (isStandardLining && !customizations.liningColor) {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial && child.userData._originalLiningMaterial) {
              const orig = child.userData._originalLiningMaterial
              child.material.color.copy(orig.color)
              child.material.map = orig.map
              child.material.roughness = orig.roughness
              child.material.metalness = orig.metalness
              child.material.envMapIntensity = orig.envMapIntensity
              child.material.flatShading = orig.flatShading
              child.material.needsUpdate = true
              console.log(`🔄 Restored original GLTF material for standard lining: ${child.name}`)
            }
            child.visible = true
            break
          }
          
          // If no liningMeshType set, treat as full lined (standard lining = full lined)
          // This ensures proper visibility control for default/standard lining
          const treatAsFullLined = isStandardLining || isFullLined
          const treatAsHalfLined = isHalfLined
          
          console.log(`🎯 Lining visibility logic:`, {
            meshName: child.name,
            treatAsFullLined,
            treatAsHalfLined,
            hasLiningColor: !!customizations.liningColor
          })
          
          // FULL LINING: All meshes from Curved1.gltf (LiningCurved, LiningCurved001, etc.)
          // HALF LINING: All meshes from Halfed-lining.gltf (Lining-Half, PocketLining-*, LiningTriangle*, etc.)
          
          // Handle LiningCurved and LiningCurved001 - BOTH are part of FULL lining from Curved1.gltf
          if (meshName.includes("liningcurved") || child.name === "LiningCurved" || child.name === "LiningCurved001" || child.name === "LiningCurved.001") {
            console.log(`🎯 Found LiningCurved mesh (FULL lining from Curved1.gltf): ${child.name}`)
            if (treatAsFullLined) {
              if (customizations.liningColor) {
                console.log(`📸 Applying texture to FULL lining mesh:`, customizations.liningColor)
                applyMaterialColor(child, customizations.liningColor)
              }
              child.visible = true
              console.log(`✅ Showing FULL lining mesh: ${child.name}`)
            } else {
              console.log(`⏭️ Hiding FULL lining mesh ${child.name} - in half lined mode`)
              child.visible = false
            }
          }
          // Handle meshes from Halfed-lining.gltf - only show for half lined mode
          else if (meshName.includes("lining-half") || meshName.includes("pocketlining") || 
                   meshName.includes("liningtriangle") || meshName.includes("label-ojbrown")) {
            console.log(`🎯 Found Halfed-lining.gltf mesh: ${child.name}`)
            if (treatAsHalfLined) {
              if (customizations.liningColor) {
                console.log(`📸 Applying texture to half lining mesh:`, customizations.liningColor)
                applyMaterialColor(child, customizations.liningColor)
              }
              child.visible = true
              console.log(`✅ Showing HALF lining mesh: ${child.name}`)
            } else {
              console.log(`⏭️ Hiding ${child.name} - only for half lined mode`)
              child.visible = false
            }
          }
          // Handle LiningStraight1-4 (6d2 jacket lining)
          else if (meshName.includes("liningstraight")) {
            console.log(`🎯 Found LiningStraight1-4 (6d2 lining mesh)`)
            if (treatAsHalfLined || treatAsFullLined) {
              if (customizations.liningColor) {
                console.log(`📸 Applying texture to LiningStraight1-4:`, customizations.liningColor)
                applyMaterialColor(child, customizations.liningColor)
              }
              child.visible = true
              console.log(`✅ Applied lining texture to: ${child.name} (${treatAsHalfLined ? 'half' : 'full'} lined)`)
            } else {
              console.log(`⏭️ Hiding ${child.name} - half or full lined required`)
              child.visible = false
            }
          }
          // Handle other lining meshes
          else if (customizations.liningColor) {
            // Other lining meshes - apply normally if half or full lined
            console.log(`🎯 Found other lining mesh: ${child.name}`)
            if (treatAsHalfLined || treatAsFullLined) {
              applyMaterialColor(child, customizations.liningColor)
              child.visible = true
              console.log(`✅ Applied lining color/texture to: ${child.name}`)
            } else {
              child.visible = false
            }
          }
          break
      }
    } catch (error) {
      console.error(`❌ Error applying customization to ${child.name}:`, error)
    }
  })
}

/**
 * Applies a color or texture to a mesh's material with realistic fabric properties
 * @param mesh - The mesh to apply the material to
 * @param color - Either a hex color string (e.g., "#ff0000") or a texture path (e.g., "/images/fabric/IMG-20250831-WA0001.jpg")
 * @param baseColor - Optional base color multiplier for textures (e.g., 0xaaaaaa for jackets, 0x1a1a1a for darker pants)
 */
function applyMaterialColor(mesh: THREE.Mesh, color: string, baseColor: number = 0xaaaaaa) {
  if (!mesh.material) {
    console.warn(`⚠️ No material found on mesh: ${mesh.name}`)
    return
  }

  // Handle both single materials and material arrays
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

  materials.forEach((material) => {
    if (material instanceof THREE.MeshStandardMaterial) {
      try {
        // Check if this is a texture path (starts with / or contains image extension)
        const isTexture = color.startsWith('/') || /\.(jpg|jpeg|png|webp)$/i.test(color)
        
        if (isTexture) {
          // Load and apply texture
          console.log(`🖼️ Loading fabric texture: ${color} for ${mesh.name}`)
          const textureLoader = new THREE.TextureLoader()
          textureLoader.load(
            color,
            (texture) => {
              // Configure texture for realistic fabric appearance
              texture.wrapS = THREE.RepeatWrapping
              texture.wrapT = THREE.RepeatWrapping
              texture.repeat.set(8, 8) // Increased repeat for smaller, more detailed pattern
              
              material.map = texture
              material.color.setHex(baseColor) // Use custom base color for fabric appearance
              
              // Apply realistic fabric properties
              material.roughness = 0.75  // Higher roughness for more matte fabric appearance
              material.metalness = 0.0  // No metalness for pure fabric look
              material.flatShading = false
              material.envMapIntensity = 0.2  // Further reduced environment reflection
              
              material.needsUpdate = true
              console.log(`✅ Applied fabric texture to ${mesh.name}`)
            },
            undefined,
            (error) => {
              console.error(`❌ Error loading texture ${color}:`, error)
              // Fallback to a neutral color if texture fails
              material.color.setHex(0x808080)
              material.needsUpdate = true
            }
          )
        } else {
          // Apply solid color
          const newColor = new THREE.Color(color)
          material.color.copy(newColor)
          
          // IMPORTANT: Remove any base textures that might darken the color
          // This ensures buttons get the actual selected color, not a darkened version
          if (material.map) {
            console.log(`🔄 Removing base texture from ${mesh.name} to apply pure color`)
            material.map = null
          }
          
          // Apply professional suit fabric properties — matte, non-shiny
          material.roughness = 0.92  // High roughness for realistic fabric without shine
          material.metalness = 0.0   // No metalness for natural fabric appearance
          
          // Enable proper lighting response
          material.flatShading = false  // Use smooth shading for realistic fabric
          
          // Low environment map to prevent shiny/glossy look on fabric
          material.envMapIntensity = 0.15  // Subtle reflection only — avoids plastic look
          
          material.needsUpdate = true
          console.log(`✅ Applied realistic fabric color ${color} to ${mesh.name}`)
        }
      } catch (error) {
        console.error(`❌ Error applying color/texture ${color} to ${mesh.name}:`, error)
      }
    }
  })
}

/**
 * Exported wrapper for applying fabric customization to a mesh
 * @param mesh - The mesh to apply the material to
 * @param color - Either a hex color string or a texture path
 * @param baseColor - Optional base color multiplier for textures (default: 0xaaaaaa for jackets)
 */
export function applyFabricCustomization(mesh: THREE.Mesh, color: string, baseColor?: number) {
  applyMaterialColor(mesh, color, baseColor)
}
