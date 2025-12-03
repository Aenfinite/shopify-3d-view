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
      
      // Check for LINING patterns - catch LiningCurved and other lining meshes
      if (nameLower.includes('lining') || nameLower.includes('curved') || 
          nameLower.includes('fully') || nameLower.includes('interior')) {
        console.log(`🎨 Identified LINING by name pattern: ${child.name} -> Applying liningColor`)
        if (customizations.liningColor) {
          applyMaterialColor(child, customizations.liningColor)
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
            customType: customizations.customType,
            isTexture: customizations.liningColor?.startsWith('/') || /\.(jpg|jpeg|png|webp)$/i.test(customizations.liningColor || ''),
            allCustomizations: customizations
          })
          
          console.log(`🔍 DEBUG - All customization keys with 'lining':`, 
            Object.keys(customizations).filter(k => k.toLowerCase().includes('lining'))
          )
          console.log(`🔍 DEBUG - All customization values:`, 
            Object.keys(customizations).filter(k => k.toLowerCase().includes('lining')).reduce((acc, k) => {
              acc[k] = customizations[k as keyof typeof customizations]
              return acc
            }, {} as any)
          )
          
          // Apply lining based on mesh type selection
          const meshName = child.name.toLowerCase()
          const isUnlined = customizations.liningMeshType === "unlined"
          const isHalfLined = customizations.liningMeshType === "custom-coloured" // Half Lined
          const isFullLined = customizations.liningMeshType === "quilted" // Full Lined
          
          console.log(`🔍 Lining type check:`, {
            meshName: child.name,
            liningMeshType: customizations.liningMeshType,
            isUnlined,
            isHalfLined,
            isFullLined,
            hasLiningColor: !!customizations.liningColor
          })
          
          // If explicitly unlined, skip texture application
          if (isUnlined) {
            console.log(`⏭️ Skipping ${child.name} - unlined selected, no texture applied`)
            break
          }
          
          // If no liningMeshType set but has liningColor, treat as full lined (backward compatibility)
          if (!customizations.liningMeshType && customizations.liningColor) {
            console.log(`⚠️ No liningMeshType but has liningColor - applying as full lined`)
            applyMaterialColor(child, customizations.liningColor)
            console.log(`✅ Applied lining texture to: ${child.name} (default full)`)
            break
          }
          
          // LiningCurved (without .001) - Apply for both half and full
          // LiningCurved.001 - Only apply for full lined
          // LiningStraight1-4 - For 6d2 jacket, apply based on type
          if (customizations.liningColor) {
            if (meshName.includes("liningstraight")) {
              // This is the straight lining mesh used in 6d2 jacket
              console.log(`🎯 Found LiningStraight1-4 (6d2 lining mesh)`)
              if (isHalfLined || isFullLined) {
                console.log(`📸 Applying texture to LiningStraight1-4:`, customizations.liningColor)
                applyMaterialColor(child, customizations.liningColor)
                console.log(`✅ Applied lining texture to: ${child.name} (${isHalfLined ? 'half' : 'full'} lined)`)
              } else {
                console.log(`⏭️ Skipping ${child.name} - half or full lined required (current: ${customizations.liningMeshType})`)
              }
            } else if (meshName.includes("liningcurved.001") || child.name === "LiningCurved.001") {
              // This is the full lining mesh - only apply if full lined selected
              console.log(`🎯 Found LiningCurved.001 (full lining mesh)`)
              if (isFullLined) {
                console.log(`📸 Applying texture to LiningCurved.001:`, customizations.liningColor)
                applyMaterialColor(child, customizations.liningColor)
                console.log(`✅ Applied FULL lining texture to: ${child.name}`)
              } else {
                console.log(`⏭️ Skipping ${child.name} - only for full lined (current: ${customizations.liningMeshType})`)
              }
            } else if (meshName.includes("liningcurved") || child.name === "LiningCurved") {
              // This is the half lining mesh - apply for both half and full
              console.log(`🎯 Found LiningCurved (half lining mesh)`)
              if (isHalfLined || isFullLined) {
                console.log(`📸 Applying texture to LiningCurved:`, customizations.liningColor)
                applyMaterialColor(child, customizations.liningColor)
                console.log(`✅ Applied lining texture to: ${child.name} (${isHalfLined ? 'half' : 'full'} lined)`)
              } else {
                console.log(`⏭️ Skipping ${child.name} - half or full lined required (current: ${customizations.liningMeshType})`)
              }
            } else {
              // Other lining meshes - apply normally if half or full lined
              console.log(`🎯 Found other lining mesh: ${child.name}`)
              if (isHalfLined || isFullLined) {
                applyMaterialColor(child, customizations.liningColor)
                console.log(`✅ Applied lining color/texture to: ${child.name}`)
              }
            }
          } else {
            console.log(`⚠️ No liningColor provided - keeping default material for: ${child.name}`)
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
 */
function applyMaterialColor(mesh: THREE.Mesh, color: string) {
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
              material.color.setHex(0xaaaaaa) // Darker gray to better match actual fabric colors
              
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
          
          // Apply professional suit fabric properties with subtle shine
          material.roughness = 0.55  // Reduced roughness for subtle shine like quality suit fabric
          material.metalness = 0.05  // Tiny bit of metalness for professional sheen
          
          // Enable proper lighting response
          material.flatShading = false  // Use smooth shading for realistic fabric
          
          // Increase environment map for subtle reflections and depth
          material.envMapIntensity = 0.6  // More environment reflection for professional look
          
          material.needsUpdate = true
          console.log(`✅ Applied realistic fabric color ${color} to ${mesh.name}`)
        }
      } catch (error) {
        console.error(`❌ Error applying color/texture ${color} to ${mesh.name}:`, error)
      }
    }
  })
}