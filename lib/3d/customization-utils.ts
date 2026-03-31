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

// ── PBR Fabric Texture System ─────────────────────────────────────────────────
// Uses real PBR maps (normal + roughness) stored locally in /public/textures/fabric/.
// Only the PBR maps are used — the user's chosen COLOR drives material.color, so
// all color customization continues to work perfectly.
//
// Jacket / Trousers maps (Polyhaven rough_linen, CC0):
//   linen_nor_gl_1k.jpg  — OpenGL normal map  (structured woven linen relief)
//   linen_rough_1k.jpg   — Roughness map       (linen matte variation)
//
// Shirt maps (ambientCG Fabric019, CC0):
//   shirt_nor_gl_1k.jpg  — OpenGL normal map  (fine soft-cotton weave)
//   shirt_rough_1k.jpg   — Roughness map       (cotton matte variation)

interface FabricPBRMaps {
  normalMap: THREE.Texture | null
  roughnessMap: THREE.Texture | null
  bumpMap?: THREE.Texture | null
  aoMap?: THREE.Texture | null
}

// Jacket / Trousers — Polyhaven rough_linen
let _fabricPBR: FabricPBRMaps | null = null
let _fabricPBRPromise: Promise<FabricPBRMaps> | null = null

// Shirt — ambientCG Fabric019 (fine cotton weave)
let _shirtPBR: FabricPBRMaps | null = null
let _shirtPBRPromise: Promise<FabricPBRMaps> | null = null

// Shirt surface noise — procedural canvas bump for micro-irregularity / natural variation
let _shirtSurfaceNoise: THREE.CanvasTexture | null = null

/**
 * Generates a smooth large-scale procedural noise texture used as a bumpMap
 * on shirt fabric. Simulates subtle fabric tension, soft folds, and micro-variation
 * that breaks up the otherwise uniform surface. Uses overlapping sine waves at low
 * frequency so the pattern is organic, not digital-looking.
 */
function getShirtSurfaceNoise(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  if (_shirtSurfaceNoise) return _shirtSurfaceNoise
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(size, size)
  const data = imageData.data
  for (let y = 0; y < size; y++) {
    const ny = y / size
    for (let x = 0; x < size; x++) {
      const nx = x / size
      // Three overlapping low-frequency sine waves — organic, no grid feel
      const v1 = Math.sin(nx * 5.1 + 0.9) * Math.cos(ny * 4.3 + 1.4)
      const v2 = Math.sin(nx * 2.7 + ny * 3.8 + 0.6)
      const v3 = Math.cos(nx * 6.2 - ny * 2.3 + 2.5)
      const combined = v1 * 0.5 + v2 * 0.3 + v3 * 0.2 // weighted blend
      // ±20 gray range around mid-gray — very subtle, just enough to break uniformity
      const gray = Math.round(128 + combined * 20)
      const i = (y * size + x) * 4
      data[i] = data[i + 1] = data[i + 2] = Math.max(0, Math.min(255, gray))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(imageData, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1.5, 1.5) // large scale — simulates broad tension zones, not fine grain
  _shirtSurfaceNoise = tex
  return tex
}

function configureFabricTex(
  tex: THREE.Texture,
  repeatU = 8,
  repeatV = 8,
  rotationDeg = 0,
): THREE.Texture {
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeatU, repeatV)
  tex.anisotropy = 8
  if (rotationDeg !== 0) {
    tex.rotation = (rotationDeg * Math.PI) / 180
    tex.center.set(0.5, 0.5)
  }
  // Required: tell GPU to re-upload with updated wrap/repeat settings
  tex.needsUpdate = true
  return tex
}

/**
 * Blends a loaded THREE.Texture toward neutral gray using a canvas compositing step.
 * This reduces the contrast of the source map so it reads as very subtle surface
 * variation rather than a visible structured pattern.
 *
 * @param tex        - The source THREE.Texture (must have an image already loaded)
 * @param blendAlpha - 0 = pure neutral gray (invisible), 1 = original (no change).
 *                     0.18 gives barely-perceptible, natural-feeling variation.
 * @param neutralL   - Neutral luminance to blend toward (128 = mid-gray for roughness,
 *                     128 = flat normal for normal maps)
 */
function softenTexture(tex: THREE.Texture, blendAlpha = 0.18, neutralL = 128): THREE.Texture {
  if (typeof document === 'undefined') return tex
  try {
    const src = tex.image as HTMLImageElement | HTMLCanvasElement | null
    if (!src) return tex
    const w = (src as HTMLImageElement).naturalWidth || (src as HTMLCanvasElement).width || 512
    const h = (src as HTMLImageElement).naturalHeight || (src as HTMLCanvasElement).height || 512
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    // Step 1: fill with neutral gray
    ctx.fillStyle = `rgb(${neutralL},${neutralL},${neutralL})`
    ctx.fillRect(0, 0, w, h)
    // Step 2: draw the original texture on top with low opacity — blends it softly
    ctx.globalAlpha = blendAlpha
    ctx.drawImage(src as CanvasImageSource, 0, 0, w, h)
    ctx.globalAlpha = 1
    // Step 3: create a new CanvasTexture from the composited result
    const softened = new THREE.CanvasTexture(canvas)
    softened.wrapS = tex.wrapS
    softened.wrapT = tex.wrapT
    softened.repeat.copy(tex.repeat)
    softened.rotation = tex.rotation
    softened.center.copy(tex.center)
    softened.anisotropy = tex.anisotropy
    return softened
  } catch {
    return tex // fallback: use original if anything fails
  }
}

/**
 * Eagerly starts loading PBR maps and caches the promise.
 * Safe to call multiple times — only one load is ever started.
 */
export function preloadFabricPBR(): void {
  if (_fabricPBRPromise) return
  const loader = new THREE.TextureLoader()
  _fabricPBRPromise = Promise.all([
    new Promise<THREE.Texture | null>(resolve =>
      loader.load('/textures/fabric/linen_nor_gl_1k.jpg', t => {
        const configured = configureFabricTex(t, 5, 5, 7)
        resolve(softenTexture(configured, 0.18, 128)) // blend toward flat-normal gray
      }, undefined, () => resolve(null))
    ),
    new Promise<THREE.Texture | null>(resolve =>
      loader.load('/textures/fabric/linen_rough_1k.jpg', t => {
        const configured = configureFabricTex(t, 5, 5, 7)
        resolve(softenTexture(configured, 0.22, 180)) // blend toward smooth (light gray) for roughness
      }, undefined, () => resolve(null))
    ),
  ]).then(([normalMap, roughnessMap]) => {
    _fabricPBR = { normalMap, roughnessMap }
    console.log('✅ Fabric PBR maps loaded (softened):', { normalMap: !!normalMap, roughnessMap: !!roughnessMap })
    return _fabricPBR
  })
}

/**
 * Eagerly starts loading shirt-specific PBR maps (Superellipse Cotton Poplin — photogrammetry-scanned).
 * Maps: Normal (RGB), Roughness, Height (→ bumpMap), AO.
 * Drop the purchased files into /public/textures/fabric/ with these names:
 *   shirt_nor_gl.jpg  — Normal map (OpenGL RGB)
 *   shirt_rough.jpg   — Roughness map
 *   shirt_height.jpg  — Height map (used as bumpMap)
 *   shirt_ao.jpg      — Ambient Occlusion map
 * Safe to call multiple times — only one load is ever started.
 */
export function preloadShirtPBR(): void {
  if (_shirtPBRPromise) return
  const loader = new THREE.TextureLoader()
  // Simple loader — configure tiling directly, NO softenTexture canvas processing.
  // The scanned maps are already calibrated; canvas copies waste memory and cause silent failures.
  const loadRaw = (path: string) =>
    new Promise<THREE.Texture | null>(resolve =>
      loader.load(
        path,
        t => {
          // CRITICAL: PBR utility maps (normal, roughness, height, AO) are raw data —
          // NOT color images. THREE.TextureLoader defaults to SRGBColorSpace which
          // applies gamma correction and completely corrupts normal/bump values,
          // making the surface appear perfectly flat.
          // NoColorSpace = no gamma transform = raw float values preserved.
          t.colorSpace = THREE.NoColorSpace
          configureFabricTex(t, 4, 4, 0)
          console.log(`📦 Loaded shirt map: ${path} (${t.image?.width}×${t.image?.height})`)
          resolve(t)
        },
        undefined,
        (err) => {
          console.warn(`⚠️ Failed to load shirt map: ${path}`, err)
          resolve(null)
        },
      )
    )
  _shirtPBRPromise = Promise.all([
    loadRaw('/textures/fabric/shirt_nor_gl.jpg'),
    loadRaw('/textures/fabric/shirt_rough.jpg'),
    loadRaw('/textures/fabric/shirt_height.jpg'),
    loadRaw('/textures/fabric/shirt_ao.jpg'),
  ]).then(([normalMap, roughnessMap, bumpMap, aoMap]) => {
    _shirtPBR = { normalMap, roughnessMap, bumpMap, aoMap }
    console.log('✅ Shirt PBR maps loaded (Superellipse Cotton Poplin):', {
      normalMap: !!normalMap,
      roughnessMap: !!roughnessMap,
      bumpMap: !!bumpMap,
      aoMap: !!aoMap,
    })
    return _shirtPBR
  })
}

// Start loading immediately when this module is imported (client-side only)
if (typeof window !== 'undefined') {
  preloadFabricPBR()
  preloadShirtPBR()
}

// ─── Per-garment material profiles ───────────────────────────────────────────
// Each garment has slightly different surface behaviour:
//   jacket  → visible woven grain, moderate sheen — structured tailoring fabric
//   trousers → same linen maps but slightly stronger relief — dress trouser weight
//   shirt   → no directional weave, near-zero reflections — soft cotton/poplin feel

export type GarmentType = 'jacket' | 'trousers' | 'shirt'

interface GarmentProfile {
  useNormalMap: boolean    // include linen normal map (adds directional weave relief)
  normalScale: number      // surface relief strength
  useRoughnessMap: boolean // include linen roughness map (micro-variation)
  roughness: number        // base diffuse roughness
  sheen: number            // cross-fibre retro-reflection
  sheenRoughness: number   // how diffuse the sheen is
  envMapIntensity: number  // how much the environment reflects
}

const GARMENT_PROFILES: Record<GarmentType, GarmentProfile> = {
  jacket: {
    useNormalMap: true,
    normalScale: 0.12,
    useRoughnessMap: true,
    roughness: 0.90,
    sheen: 0.12,
    sheenRoughness: 0.97,
    envMapIntensity: 0.06,
  },
  trousers: {
    // Slightly more relief than jacket — gives the micro-weave read needed on
    // dress trouser fabric without being as bold as a woven jacket.
    useNormalMap: true,
    normalScale: 0.22,
    useRoughnessMap: true,
    roughness: 0.90,
    sheen: 0.18,
    sheenRoughness: 0.97,
    envMapIntensity: 0.07,
  },
  shirt: {
    // Superellipse Cotton Poplin — photogrammetry-scanned PBR set.
    // normalScale 0.75: scanned normal maps need strong scale to be visible.
    // roughness 0.72: cotton matte look (Astra spec: 0.68–0.75).
    useNormalMap: true,
    normalScale: 0.75,
    useRoughnessMap: true,
    roughness: 0.72,
    sheen: 0.18,
    sheenRoughness: 0.98,
    envMapIntensity: 0.08,
  },
}

// Optional PBR override — lets callers (admin wizard sliders) override the hard-coded
// GARMENT_PROFILES values with user-configured values from pbr_settings.
export interface PBROverride {
  roughness?: number
  normalScale?: number
  bumpScale?: number
  sheen?: number
}

/**
 * Creates a MeshPhysicalMaterial tuned for realistic textile rendering.
 * Profile is selected per garment type so each material behaves appropriately.
 * pbrOverride (if provided) takes priority over the hard-coded GARMENT_PROFILES,
 * allowing the admin wizard sliders to actually affect the 3D preview.
 */
/** Returns the correct PBR map set for the given garment type. */
function getPBRForGarment(garmentType: GarmentType): FabricPBRMaps | null {
  return garmentType === 'shirt' ? _shirtPBR : _fabricPBR
}

/** Returns the correct PBR promise for the given garment type (used for deferred patching). */
function getPBRPromiseForGarment(garmentType: GarmentType): Promise<FabricPBRMaps> | null {
  return garmentType === 'shirt' ? _shirtPBRPromise : _fabricPBRPromise
}

function createFabricPhysicalMaterial(
  source: THREE.MeshStandardMaterial,
  color: THREE.Color,
  map: THREE.Texture | null,
  garmentType: GarmentType = 'jacket',
  pbrOverride?: PBROverride,
): THREE.MeshPhysicalMaterial {
  const pbr = getPBRForGarment(garmentType) // may be null on very first render; maps applied in callback once ready
  const profile = GARMENT_PROFILES[garmentType]

  // pbrOverride values come from admin wizard sliders — use them when provided
  const roughness    = pbrOverride?.roughness    ?? profile.roughness
  const normalScale  = pbrOverride?.normalScale  ?? profile.normalScale
  const bumpScale    = pbrOverride?.bumpScale    ?? (garmentType === 'shirt' ? 0.20 : 0)
  const sheen        = pbrOverride?.sheen        ?? profile.sheen

  return new THREE.MeshPhysicalMaterial({
    color,
    map,                                   // user-supplied fabric image (if any)
    roughness,
    metalness: 0.0,
    envMapIntensity: profile.envMapIntensity,
    // Normal map: garment-specific PBR set (linen for jacket/trousers, Fabric019 for shirt)
    normalMap: (profile.useNormalMap && pbr?.normalMap) ? pbr.normalMap : undefined,
    normalScale: new THREE.Vector2(normalScale, normalScale),
    // Roughness map: garment-specific PBR set
    roughnessMap: (profile.useRoughnessMap && pbr?.roughnessMap) ? pbr.roughnessMap : undefined,
    // Height map as bumpMap (shirt: scanned map preferred; others: no bump unless override says so)
    bumpMap: garmentType === 'shirt' ? (pbr?.bumpMap ?? getShirtSurfaceNoise()) : (bumpScale > 0 ? (pbr?.bumpMap ?? undefined) : undefined),
    bumpScale,
    // Specular: shirt cotton is non-reflective (0.25 vs MeshPhysical default of 1.0)
    specularIntensity: garmentType === 'shirt' ? 0.25 : 1.0,
    // Sheen: cross-fibre retro-reflection
    sheen,
    sheenRoughness: profile.sheenRoughness,
    sheenColor: color.clone(),
    flatShading: false,
    // AO: prefer scanned AO map for shirt; fall back to GLTF-baked AO for jacket/trousers
    aoMap: (garmentType === 'shirt' && pbr?.aoMap) ? pbr.aoMap : source.aoMap,
    aoMapIntensity: (garmentType === 'shirt' && pbr?.aoMap) ? 1.0 : (source.aoMapIntensity ?? 1),
    emissive: source.emissive ? source.emissive.clone() : new THREE.Color(0),
    emissiveMap: source.emissiveMap,
  })
}
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Applies a color or texture to a mesh's material with realistic fabric properties.
 * Upgrades to MeshPhysicalMaterial (sheen + PBR maps) for a natural textile appearance.
 * @param mesh - The mesh to apply the material to
 * @param color - Either a hex color string (e.g., "#ff0000") or a texture path
 * @param baseColor - Base color multiplier for texture mode (default: 0xaaaaaa)
 */
function replaceMeshMaterial(
  mesh: THREE.Mesh,
  idx: number,
  isMaterialArray: boolean,
  physMat: THREE.MeshPhysicalMaterial,
) {
  if (isMaterialArray) {
    ;(mesh.material as THREE.Material[])[idx] = physMat
  } else {
    mesh.material = physMat
  }
  const prevMat = mesh.userData._fabricPhysicalMat as THREE.MeshPhysicalMaterial | undefined
  if (prevMat && prevMat !== physMat) prevMat.dispose()
  mesh.userData._fabricPhysicalMat = physMat
}

function applyMaterialColor(mesh: THREE.Mesh, color: string, baseColor: number = 0xaaaaaa, garmentType: GarmentType = 'jacket', repeatX = 6, repeatY = 6, pbrOverride?: PBROverride) {
  if (!mesh.material) {
    console.warn(`⚠️ No material found on mesh: ${mesh.name}`)
    return
  }

  const isTexture = color.startsWith('/') || color.startsWith('data:') || /\.(jpg|jpeg|png|webp)$/i.test(color)
  const isMaterialArray = Array.isArray(mesh.material)
  const rawMaterials: THREE.Material[] = isMaterialArray
    ? [...(mesh.material as THREE.Material[])]
    : [mesh.material as THREE.Material]

  rawMaterials.forEach((material, idx) => {
    if (!(material instanceof THREE.MeshStandardMaterial)) return

    try {
      if (isTexture) {
        // ── Texture / fabric-image path ───────────────────────────────────────
        console.log(`🖼️ Loading fabric texture: ${color} for ${mesh.name}`)
        const baseCol = new THREE.Color(baseColor)
        const physMat = createFabricPhysicalMaterial(material, baseCol, null, garmentType, pbrOverride)

        replaceMeshMaterial(mesh, idx, isMaterialArray, physMat)

        // If PBR maps are still loading, patch them in once ready
        const _pbrForGarment = getPBRForGarment(garmentType)
        const _pbrPromiseForGarment = getPBRPromiseForGarment(garmentType)
        if (!_pbrForGarment && _pbrPromiseForGarment) {
          const profile = GARMENT_PROFILES[garmentType]
          _pbrPromiseForGarment.then(pbr => {
            if (profile.useNormalMap && pbr.normalMap) {
              physMat.normalMap = pbr.normalMap
              const ns = pbrOverride?.normalScale ?? profile.normalScale
              physMat.normalScale.set(ns, ns)
            }
            if (profile.useRoughnessMap && pbr.roughnessMap) physMat.roughnessMap = pbr.roughnessMap
            if (pbr.bumpMap) { physMat.bumpMap = pbr.bumpMap; physMat.bumpScale = pbrOverride?.bumpScale ?? 0.20 }
            if (pbr.aoMap) { physMat.aoMap = pbr.aoMap; physMat.aoMapIntensity = 1.0 }
            physMat.needsUpdate = true
          })
        }

        const textureLoader = new THREE.TextureLoader()
        textureLoader.load(
          color,
          (texture) => {
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            texture.repeat.set(repeatX, repeatY)
            texture.colorSpace = THREE.SRGBColorSpace
            physMat.map = texture
            physMat.needsUpdate = true
            console.log(`✅ Applied fabric texture to ${mesh.name}`)
          },
          undefined,
          (error) => {
            console.error(`❌ Error loading texture ${color}:`, error)
            physMat.color.setHex(0x808080)
            physMat.needsUpdate = true
          }
        )
      } else {
        // ── Solid colour path ─────────────────────────────────────────────────
        const newColor = new THREE.Color(color)
        const physMat = createFabricPhysicalMaterial(material, newColor, null, garmentType, pbrOverride)

        replaceMeshMaterial(mesh, idx, isMaterialArray, physMat)

        // If PBR maps are still loading, patch them in once ready
        const _pbrForGarment2 = getPBRForGarment(garmentType)
        const _pbrPromiseForGarment2 = getPBRPromiseForGarment(garmentType)
        if (!_pbrForGarment2 && _pbrPromiseForGarment2) {
          const profile = GARMENT_PROFILES[garmentType]
          _pbrPromiseForGarment2.then(pbr => {
            if (profile.useNormalMap && pbr.normalMap) {
              physMat.normalMap = pbr.normalMap
              const ns = pbrOverride?.normalScale ?? profile.normalScale
              physMat.normalScale.set(ns, ns)
            }
            if (profile.useRoughnessMap && pbr.roughnessMap) physMat.roughnessMap = pbr.roughnessMap
            if (pbr.bumpMap) { physMat.bumpMap = pbr.bumpMap; physMat.bumpScale = pbrOverride?.bumpScale ?? 0.20 }
            if (pbr.aoMap) { physMat.aoMap = pbr.aoMap; physMat.aoMapIntensity = 1.0 }
            physMat.needsUpdate = true
          })
        }

        physMat.needsUpdate = true
        console.log(`✅ Applied fabric material to ${mesh.name}: ${color}`)
      }
    } catch (error) {
      console.error(`❌ Error applying color/texture ${color} to ${mesh.name}:`, error)
    }
  })
}

/**
 * Exported wrapper for applying fabric customization to a mesh
 * @param mesh - The mesh to apply the material to
 * @param color - Either a hex color string or a texture path
 * @param baseColor - Optional base color multiplier for textures (default: 0xaaaaaa for jackets)
 */
export function applyFabricCustomization(
  mesh: THREE.Mesh,
  color: string,
  baseColor?: number,
  garmentType: GarmentType = 'jacket',
  repeatX = 6,
  repeatY = 6,
  pbrOverride?: PBROverride,
) {
  applyMaterialColor(mesh, color, baseColor, garmentType, repeatX, repeatY, pbrOverride)
}
