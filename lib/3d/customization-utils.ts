import * as THREE from "three"
import type { BasicJacketCustomization } from "@/types/configurator"
import { getMeshCategory, ColorCategories } from "./modular-jacket-loader"
import { computeCmBasedRepeats, hasCmScaling } from "./garment-dimensions"

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
  const _fabricPbr = (customizations as any).fabricPbr as PBROverride | undefined
  const _fabricRxRaw: number = (customizations as any).fabricRepeatX ?? 6
  const _fabricRyRaw: number = (customizations as any).fabricRepeatY ?? 6
  const _fabricRepeatWidthCm: number | undefined = (customizations as any).fabricRepeatWidthCm
  const _fabricRepeatHeightCm: number | undefined = (customizations as any).fabricRepeatHeightCm

  // When cm values are provided, use production-accurate tiling:
  //   repeats_x = garment_width_cm / fabric_repeat_width_cm
  // The legacy repeat_x/repeat_y slider (default 4) then becomes a ±% fine-tune.
  let _fabricRx = _fabricRxRaw
  let _fabricRy = _fabricRyRaw
  if (hasCmScaling(_fabricRepeatWidthCm, _fabricRepeatHeightCm)) {
    // fine-tune is a ±knob centered at 1.0 (= exact cm scale). UV spans are normalized
    // per-mesh in applyMaterialColor, so no global fudge is needed here.
    const userFineTune = Math.max(0.1, (_fabricPbr as any)?.fineTune ?? 1)
    const r = computeCmBasedRepeats('jacket', _fabricRepeatWidthCm!, _fabricRepeatHeightCm!, 1 / userFineTune)
    _fabricRx = r.repeatsX
    _fabricRy = r.repeatsY
  }

  // ─── Lining material (independent layer) ───────────────────────────────────
  const _liningPbr = (customizations as any).liningPbr as PBROverride | undefined
  const _liningRxRaw: number = (customizations as any).liningRepeatX ?? 4
  const _liningRyRaw: number = (customizations as any).liningRepeatY ?? 4
  const _liningRepeatWidthCm: number | undefined = (customizations as any).liningRepeatWidthCm
  const _liningRepeatHeightCm: number | undefined = (customizations as any).liningRepeatHeightCm

  let _liningRx = _liningRxRaw
  let _liningRy = _liningRyRaw
  if (hasCmScaling(_liningRepeatWidthCm, _liningRepeatHeightCm)) {
    // Exact cm scale (UV spans normalized per-mesh in applyMaterialColor).
    const r = computeCmBasedRepeats('lining', _liningRepeatWidthCm!, _liningRepeatHeightCm!, 1)
    _liningRx = r.repeatsX
    _liningRy = r.repeatsY
  }

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
          applyMaterialColor(child, customizations.fabricColor, undefined, 'jacket', _fabricRx, _fabricRy, _fabricPbr)
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
            applyMaterialColor(child, customizations.fabricColor, undefined, 'jacket', _fabricRx, _fabricRy, _fabricPbr)
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
          applyMaterialColor(child, customizations.fabricColor, undefined, 'jacket', _fabricRx, _fabricRy, _fabricPbr)
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
          applyMaterialColor(child, customizations.liningColor, 0xffffff, 'lining', _liningRx, _liningRy, _liningPbr)
          return
        } else if (customizations.liningMeshType === 'standard' || !customizations.liningMeshType) {
          // Standard lining - restore original GLTF texture but force matte PBR values
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial && child.userData._originalLiningMaterial) {
            const orig = child.userData._originalLiningMaterial
            child.material.color.copy(orig.color)
            child.material.map = orig.map
            child.material.roughness = 1.0
            child.material.metalness = 0.0
            child.material.envMapIntensity = 0.0
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
            applyMaterialColor(child, customizations.fabricColor, undefined, 'jacket', _fabricRx, _fabricRy, _fabricPbr)
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
              applyMaterialColor(child, customizations.fabricColor, undefined, 'jacket', _fabricRx, _fabricRy, _fabricPbr)
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
              applyMaterialColor(child, customizations.fabricColor, undefined, 'jacket', _fabricRx, _fabricRy, _fabricPbr)
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
            applyMaterialColor(child, customizations.fabricColor, undefined, 'jacket', _fabricRx, _fabricRy, _fabricPbr)
          }
          break

        case ColorCategories.THREAD:
          console.log(`🧵 Applying THREAD color to: ${child.name}`)
          // Thread ALWAYS matches fabric color - IGNORE customizations.threadColor
          if (customizations.fabricColor) {
            applyMaterialColor(child, customizations.fabricColor, undefined, 'jacket', _fabricRx, _fabricRy, _fabricPbr)
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
              child.material.roughness = 1.0
              child.material.metalness = 0.0
              child.material.envMapIntensity = 0.0
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
                applyMaterialColor(child, customizations.liningColor, 0xffffff, 'lining', _liningRx, _liningRy, _liningPbr)
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
                applyMaterialColor(child, customizations.liningColor, 0xffffff, 'lining', _liningRx, _liningRy, _liningPbr)
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
                applyMaterialColor(child, customizations.liningColor, 0xffffff, 'lining', _liningRx, _liningRy, _liningPbr)
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
              applyMaterialColor(child, customizations.liningColor, 0xffffff, 'lining', _liningRx, _liningRy, _liningPbr)
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
 * Largest dimension (px) we ever upload a user fabric image to the GPU at.
 * Uploaded prints are often full-resolution scans (4000–6000px / many MB). Pushing
 * those straight to the GPU — once per mesh, with a fresh copy on every re-apply —
 * exhausts VRAM and causes the browser to drop the WebGL context (canvas goes blank,
 * model disappears). 2048 is plenty for a tiled fabric and keeps memory bounded.
 */
const MAX_FABRIC_TEXTURE_PX = 2048

/** Below this, a UV axis carries no information at all (every vertex identical). */
const DEGENERATE_UV_SPAN = 1e-3

/**
 * Rescues a panel whose UV map is unusable — one axis collapsed to a single
 * value, which happens when a mesh is exported without being unwrapped. Such a
 * panel samples one column of the fabric image and renders as vertical streaks.
 *
 * Only the collapsed axis is rebuilt. A panel usually has one good axis and one
 * dead one, and the good axis carries the density the modeller intended — throw
 * it away and the shared weave maps (which tile at a FIXED 4x4 in UV space, so
 * visible detail = 4 x the panel's span) land at the wrong scale. Normalising a
 * panel to a unit square drops it to 4 weave tiles where real panels carry 11-18,
 * which renders the maps as broad light-to-dark blobs instead of cloth.
 *
 * The rebuilt axis is a per-triangle box projection: each face is projected onto
 * the plane it most nearly lies in, using the axis perpendicular to its geometric
 * normal, then scaled to the surviving axis's UV-per-model-unit so both
 * directions carry matching detail. Choosing the plane per FACE rather than per
 * vertex matters — with a per-vertex choice, a triangle whose corners disagree
 * gets stretched across two planes, reproducing the very streaking this removes.
 * That requires non-indexed geometry so each face owns its three UVs.
 *
 * The reference size is the mesh's SECOND-largest bounding-box extent, not the
 * largest — a single mesh often holds two mirrored panels (both cuffs, both
 * sleeves) sitting far apart, so the largest extent measures the gap between
 * them rather than the size of a panel.
 *
 * This keeps fabric readable, but it is an approximation: it leaves visible seams
 * where neighbouring faces project onto different planes, and only a real unwrap
 * makes cm-accurate print scale possible. Returns true when it repaired the
 * geometry (and has stored the resulting span on geometry.userData).
 */
function repairDegenerateUVs(mesh: THREE.Mesh): boolean {
  let geom = mesh.geometry as THREE.BufferGeometry
  const uv = geom.attributes?.uv as THREE.BufferAttribute | undefined
  if (!uv || !geom.attributes?.position || uv.count === 0) return false

  let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i), v = uv.getY(i)
    if (u < uMin) uMin = u
    if (u > uMax) uMax = u
    if (v < vMin) vMin = v
    if (v > vMax) vMax = v
  }
  const uSpan = uMax - uMin
  const vSpan = vMax - vMin
  const deadU = uSpan < DEGENERATE_UV_SPAN
  const deadV = vSpan < DEGENERATE_UV_SPAN
  if (!deadU && !deadV) return false

  // One UV per face corner, so neighbouring faces can project differently.
  if (geom.index) {
    geom = geom.toNonIndexed()
    mesh.geometry = geom
  }
  const pos = geom.attributes.position as THREE.BufferAttribute
  const uv2 = geom.attributes.uv as THREE.BufferAttribute
  if (pos.count % 3 !== 0) return false

  geom.computeBoundingBox()
  const bb = geom.boundingBox
  if (!bb) return false
  const extents = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z]
  const ref = [...extents].sort((a, b) => b - a)[1] || extents[0]
  if (!ref || ref <= 0) return false

  // UV units per model unit. Take it from the surviving axis so the rebuilt one
  // carries the same detail; if both axes are dead there is nothing to copy, so
  // fall back to a unit-square panel.
  const density = deadU && deadV ? 1 / ref : (deadU ? vSpan : uSpan) / ref

  const next = new Float32Array(pos.count * 2)
  const ax = new THREE.Vector3(), bx = new THREE.Vector3(), cx = new THREE.Vector3()
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), n = new THREE.Vector3()
  for (let f = 0; f < pos.count; f += 3) {
    ax.fromBufferAttribute(pos, f)
    bx.fromBufferAttribute(pos, f + 1)
    cx.fromBufferAttribute(pos, f + 2)
    n.copy(e1.subVectors(bx, ax)).cross(e2.subVectors(cx, ax))
    const nx = Math.abs(n.x), ny = Math.abs(n.y), nz = Math.abs(n.z)
    // 0 = project ZY (face points along X), 1 = XZ (along Y), 2 = XY (along Z).
    const plane = nx >= ny && nx >= nz ? 0 : ny >= nz ? 1 : 2
    for (const [slot, p] of [[0, ax], [1, bx], [2, cx]] as const) {
      const i = f + slot
      const projU = (plane === 0 ? p.z : p.x) * density
      const projV = (plane === 1 ? p.z : p.y) * density
      // Keep whichever authored axis still carries usable data.
      next[i * 2] = deadU ? projU : uv2.getX(i)
      next[i * 2 + 1] = deadV ? projV : uv2.getY(i)
    }
  }
  geom.setAttribute('uv', new THREE.BufferAttribute(next, 2))

  // Span reported for the rebuilt axis is ONE panel's worth, not the full range of
  // the projected coordinate. When a mesh holds two mirrored panels the gap between
  // them inflates that range (the two cuffs sit ~65 units apart, giving a span of
  // ~15 for panels only ~2.5 wide), and the fabric-image repeat is normalised by
  // this number — so reporting the raw range would shrink the print several times
  // over. `ref` is already the per-panel reference size, so scale it by the same
  // density. The weave maps are unaffected: they tile against the real UVs, which
  // are correct within each panel.
  const rebuilt = Math.max(1e-6, ref * density)
  geom.userData = geom.userData || {}
  geom.userData._uvSpan = {
    u: deadU ? rebuilt : Math.max(1e-6, uSpan),
    v: deadV ? rebuilt : Math.max(1e-6, vSpan),
  }
  console.warn(
    `🧵 ${mesh.name || 'mesh'}: UV map has no usable ${deadU && deadV ? 'U or V' : deadU ? 'U' : 'V'} axis — ` +
    `rebuilt by box projection (panel span ${geom.userData._uvSpan.u.toFixed(2)}×${geom.userData._uvSpan.v.toFixed(2)}). ` +
    `Unwrap this panel in the source model for accurate print scale.`
  )
  return true
}

/**
 * Returns how far the mesh's UV coordinates span on each axis (uMax-uMin, vMax-vMin).
 *
 * CRITICAL for production-accurate print scale. The cm-based tiling system
 * (`computeCmBasedRepeats`) assumes each fabric panel is UV-unwrapped to the
 * unit square [0,1]. Several garment GLBs are NOT: e.g. the shirt front panel
 * (`Tessuto` in boxplacket.gltf) spans u≈5.8 × v≈28.9, cuffs ≈13×10, pants ≈3.6×10.
 * Because `texture.repeat.set()` multiplies the UVs, a non-unit span silently
 * inflates the visible tile count by that span — making the print render far too
 * small and, when u-span≠v-span, vertically/horizontally stretched (dots not round).
 *
 * Dividing the requested repeat by the real span normalizes any unwrap so the
 * EFFECTIVE number of tiles across the panel equals the cm-intended value. For a
 * panel already unwrapped to [0,1] the span is 1 and this is a no-op.
 *
 * Result is cached on geometry.userData so we scan each geometry's UVs only once.
 */

function getUvSpan(mesh: THREE.Mesh): { u: number; v: number } {
  const geom = mesh.geometry as THREE.BufferGeometry | undefined
  if (!geom) return { u: 1, v: 1 }
  const cached = geom.userData?._uvSpan as { u: number; v: number } | undefined
  if (cached) return cached
  if (repairDegenerateUVs(mesh)) {
    return (mesh.geometry as THREE.BufferGeometry).userData._uvSpan as { u: number; v: number }
  }
  const uv = geom.attributes?.uv as THREE.BufferAttribute | undefined
  let span = { u: 1, v: 1 }
  if (uv && uv.count > 0) {
    let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity
    for (let i = 0; i < uv.count; i++) {
      const u = uv.getX(i), v = uv.getY(i)
      if (u < uMin) uMin = u
      if (u > uMax) uMax = u
      if (v < vMin) vMin = v
      if (v > vMax) vMax = v
    }
    span = { u: Math.max(1e-6, uMax - uMin), v: Math.max(1e-6, vMax - vMin) }
  }
  geom.userData = geom.userData || {}
  geom.userData._uvSpan = span
  return span
}

/**
 * Loads a fabric image (data URL or http URL) and returns a THREE texture that is
 * downscaled to at most MAX_FABRIC_TEXTURE_PX on its longest side. This is the single
 * guard that keeps user-uploaded prints from blowing up GPU memory.
 */
function loadScaledFabricTexture(
  url: string,
  onLoad: (tex: THREE.Texture) => void,
  onError: (err: unknown) => void,
) {
  // SSR / no-DOM fallback: just use the plain loader (no canvas available to downscale).
  if (typeof document === 'undefined') {
    new THREE.TextureLoader().load(url, onLoad, undefined, onError)
    return
  }
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    try {
      const iw = img.naturalWidth || img.width
      const ih = img.naturalHeight || img.height
      const maxSide = Math.max(iw, ih)
      if (maxSide > MAX_FABRIC_TEXTURE_PX && iw > 0 && ih > 0) {
        const scale = MAX_FABRIC_TEXTURE_PX / maxSide
        const w = Math.max(1, Math.round(iw * scale))
        const h = Math.max(1, Math.round(ih * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        onLoad(new THREE.CanvasTexture(canvas))
      } else {
        const tex = new THREE.Texture(img)
        tex.needsUpdate = true
        onLoad(tex)
      }
    } catch (err) {
      onError(err)
    }
  }
  img.onerror = (err) => onError(err)
  img.src = url
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
          resolve(softenTexture(configured, 0.65, 128)) // preserve 65% of normal data — subtle but clearly visible
      }, undefined, () => resolve(null))
    ),
    new Promise<THREE.Texture | null>(resolve =>
      loader.load('/textures/fabric/linen_rough_1k.jpg', t => {
        const configured = configureFabricTex(t, 5, 5, 7)
        resolve(softenTexture(configured, 0.60, 180)) // preserve 60% of roughness variation
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

export type GarmentType = 'jacket' | 'trousers' | 'shirt' | 'lining'

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
  lining: {
    // Jacket inner lining — completely diffuse, zero specular/env reflection.
    // Roughness and sheen are locked at max; pbrOverride cannot override them.
    useNormalMap: false,
    normalScale: 0.0,
    useRoughnessMap: false,
    roughness: 1.0,
    sheen: 0.0,
    sheenRoughness: 1.0,
    envMapIntensity: 0.0,
  },
  jacket: {
    useNormalMap: true,
    normalScale: 0.35,
    useRoughnessMap: true,
    roughness: 0.90,
    sheen: 0.12,
    sheenRoughness: 0.97,
    envMapIntensity: 0.15,
  },
  trousers: {
    // Slightly more relief than jacket — gives the micro-weave read needed on
    // dress trouser fabric without being as bold as a woven jacket.
    useNormalMap: true,
    normalScale: 0.45,
    useRoughnessMap: true,
    roughness: 0.90,
    sheen: 0.18,
    sheenRoughness: 0.97,
    envMapIntensity: 0.18,
  },
  shirt: {
    // Superellipse Cotton Poplin — photogrammetry-scanned PBR set.
    // normalScale 0.75: scanned normal maps need strong scale to be visible.
    // roughness 0.82: TARGET cotton matte value — compensated for the roughness
    // map multiply in createFabricPhysicalMaterial (see SHIRT_ROUGH_MAP_MEAN).
    useNormalMap: true,
    normalScale: 0.75,
    useRoughnessMap: true,
    roughness: 0.82,
    sheen: 0.20,
    sheenRoughness: 0.95,
    envMapIntensity: 0.05,
  },
}

// The scanned shirt roughness map averages ~0.78 and MULTIPLIES the base roughness
// in the shader. Uncompensated, a 0.72 base landed at ~0.56 effective — semi-gloss,
// which read as shiny plastic. Dividing the target by the map mean makes the
// rendered roughness match the intended value (applies to profile AND admin override).
const SHIRT_ROUGH_MAP_MEAN = 0.78

// Optional PBR override — lets callers (admin wizard sliders) override the hard-coded
// GARMENT_PROFILES values with user-configured values from pbr_settings.
export interface PBROverride {
  roughness?: number
  normalScale?: number
  bumpScale?: number
  sheen?: number
  /** -0.5 (lighten) … 0 (no change) … +0.5 (darken). Matches admin Darkness slider range. */
  darkness?: number
  /** Fabric material type — 'cotton' | 'linen' | 'polyester'. Routes correct PBR texture maps. */
  materialType?: string
  /** Visual scale factor: >1 = larger pattern (fewer repeats). Default 2. */
  fineTune?: number
}

/**
 * Creates a MeshPhysicalMaterial tuned for realistic textile rendering.
 * Profile is selected per garment type so each material behaves appropriately.
 * pbrOverride (if provided) takes priority over the hard-coded GARMENT_PROFILES,
 * allowing the admin wizard sliders to actually affect the 3D preview.
 */
/** Returns the correct PBR map set for the given garment type. */
function getPBRForGarment(garmentType: GarmentType, materialType?: string): FabricPBRMaps | null {
  // Cotton fabrics always use the cotton poplin (shirt) maps regardless of garment type
  if (materialType === 'cotton' || garmentType === 'shirt') return _shirtPBR
  return _fabricPBR
}

/** Returns the correct PBR promise for the given garment type (used for deferred patching). */
function getPBRPromiseForGarment(garmentType: GarmentType, materialType?: string): Promise<FabricPBRMaps> | null {
  if (materialType === 'cotton' || garmentType === 'shirt') return _shirtPBRPromise
  return _fabricPBRPromise
}

function createFabricPhysicalMaterial(
  source: THREE.MeshStandardMaterial,
  color: THREE.Color,
  map: THREE.Texture | null,
  garmentType: GarmentType = 'jacket',
  pbrOverride?: PBROverride,
): THREE.MeshPhysicalMaterial {
  const pbr = getPBRForGarment(garmentType, pbrOverride?.materialType) // may be null on very first render; maps applied in callback once ready
  const profile = GARMENT_PROFILES[garmentType]

  // pbrOverride values come from admin wizard sliders — use them when provided.
  // For lining, roughness and sheen are locked to the profile (no override allowed).
  let roughness      = garmentType === 'lining' ? profile.roughness : (pbrOverride?.roughness    ?? profile.roughness)
  if (garmentType === 'shirt' && profile.useRoughnessMap) {
    roughness = Math.min(1, roughness / SHIRT_ROUGH_MAP_MEAN)
  }
  const normalScale  = pbrOverride?.normalScale  ?? profile.normalScale
  const bumpScale    = pbrOverride?.bumpScale    ?? (garmentType === 'shirt' ? 0.20 : 0)
  const sheen        = garmentType === 'lining' ? profile.sheen      : (pbrOverride?.sheen        ?? profile.sheen)

  // Apply darkness: positive darkens (lerp toward black), negative lightens (lerp toward white).
  // darkness = 0 leaves the color unchanged.
  let finalColor = color
  if (pbrOverride?.darkness && pbrOverride.darkness !== 0) {
    finalColor = color.clone()
    if (pbrOverride.darkness > 0) {
      finalColor.lerp(new THREE.Color(0, 0, 0), Math.min(pbrOverride.darkness, 1))
    } else {
      finalColor.lerp(new THREE.Color(1, 1, 1), Math.min(-pbrOverride.darkness, 1))
    }
  }

  const physMat = new THREE.MeshPhysicalMaterial({
    color: finalColor,
    map,                                   // user-supplied fabric image (if any)
    roughness,
    metalness: 0.0,
    // Shirt fabric must render on both sides — collar opening, hem, and sleeve cuffs
    // expose the inside faces. Jacket/trousers use a separate lining mesh so FrontSide is fine.
    side: garmentType === 'shirt' ? THREE.DoubleSide : THREE.FrontSide,
    envMapIntensity: garmentType === 'lining' ? 0.0 : profile.envMapIntensity,
    // Normal map: garment-specific PBR set (linen for jacket/trousers, Fabric019 for shirt)
    normalMap: (profile.useNormalMap && pbr?.normalMap) ? pbr.normalMap : undefined,
    normalScale: new THREE.Vector2(normalScale, normalScale),
    // Roughness map: garment-specific PBR set
    roughnessMap: (profile.useRoughnessMap && pbr?.roughnessMap) ? pbr.roughnessMap : undefined,
    // Height map as bumpMap (shirt: scanned map preferred; others: no bump unless override says so; lining: never)
    bumpMap: garmentType === 'lining' ? undefined : (garmentType === 'shirt' ? (pbr?.bumpMap ?? getShirtSurfaceNoise()) : (bumpScale > 0 ? (pbr?.bumpMap ?? undefined) : undefined)),
    bumpScale: garmentType === 'lining' ? 0 : bumpScale,
    // Specular: textiles are near-matte. Keep this low for ALL fabric garments —
    // a high specular (1.0) made jacket/trouser fabric read as glossy/plastic.
    // Shirt cotton is the most matte of all (0.10). Lining is fully diffuse.
    specularIntensity: garmentType === 'lining' ? 0.0 : garmentType === 'shirt' ? 0.10 : 0.30,
    // Sheen: cross-fibre retro-reflection
    sheen,
    sheenRoughness: profile.sheenRoughness,
    sheenColor: color.clone(),
    flatShading: false,
    // AO: prefer scanned AO map for shirt; fall back to GLTF-baked AO for jacket/trousers; lining: none
    aoMap: garmentType === 'lining' ? null : ((garmentType === 'shirt' && pbr?.aoMap) ? pbr.aoMap : source.aoMap),
    aoMapIntensity: garmentType === 'lining' ? 0 : ((garmentType === 'shirt' && pbr?.aoMap) ? 1.0 : (source.aoMapIntensity ?? 1)),
    emissive: source.emissive ? source.emissive.clone() : new THREE.Color(0),
    emissiveMap: source.emissiveMap,
  })
  // Keep the GLTF material name (e.g. "CollarContrast.007", "Tessuto.018") —
  // contrast/zone detection re-reads material names on every fabric re-apply,
  // so the name must survive material replacement.
  physMat.name = source.name
  return physMat
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
  if (prevMat && prevMat !== physMat) {
    // Dispose the per-fabric color map we created for the previous material so it
    // doesn't leak on the GPU. normalMap/roughnessMap etc. are shared cached PBR
    // maps reused across meshes — never dispose those here.
    if (prevMat.map) prevMat.map.dispose()
    prevMat.dispose()
  }
  mesh.userData._fabricPhysicalMat = physMat
}

function applyMaterialColor(mesh: THREE.Mesh, color: string, baseColor: number = 0xffffff, garmentType: GarmentType = 'jacket', repeatX = 6, repeatY = 6, pbrOverride?: PBROverride) {
  if (!mesh.material) {
    console.warn(`⚠️ No material found on mesh: ${mesh.name}`)
    return
  }

  // Repair unusable UVs BEFORE any material is built. This must not be limited to
  // the fabric-image path: the shared normal / roughness / bump / AO maps are read
  // through the same UVs, so a panel with a collapsed axis renders wrong even on a
  // plain colour — the maps sample one line of the texture and the panel goes flat
  // and dark. Cached per geometry, so this is a no-op after the first call.
  getUvSpan(mesh)

  const isTexture = color.startsWith('/') || color.startsWith('data:') || color.startsWith('https://') || color.startsWith('http://') || /\.(jpg|jpeg|png|webp)$/i.test(color)
  const isMaterialArray = Array.isArray(mesh.material)
  const rawMaterials: THREE.Material[] = isMaterialArray
    ? [...(mesh.material as THREE.Material[])]
    : [mesh.material as THREE.Material]

  rawMaterials.forEach((material, idx) => {
    if (!(material instanceof THREE.MeshStandardMaterial)) return

    try {
      // ── Lining: plain MeshStandardMaterial — zero specular, no PBR maps ─────
      if (garmentType === 'lining') {
        const matteMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseColor),
          roughness: 1.0,
          metalness: 0.0,
          envMapIntensity: 0.0,
          side: THREE.FrontSide,
        })
        matteMat.name = material.name
        replaceMeshMaterial(mesh, idx, isMaterialArray, matteMat as unknown as THREE.MeshPhysicalMaterial)
        if (isTexture) {
          loadScaledFabricTexture(
            color,
            (texture) => {
              texture.wrapS = THREE.RepeatWrapping
              texture.wrapT = THREE.RepeatWrapping
              const span = getUvSpan(mesh)
              texture.repeat.set(repeatX / span.u, repeatY / span.v)
              texture.colorSpace = THREE.SRGBColorSpace
              if (matteMat.map) matteMat.map.dispose()
              matteMat.map = texture
              matteMat.needsUpdate = true
              console.log(`✅ Applied matte lining texture to ${mesh.name} (uvSpan ${span.u.toFixed(2)}×${span.v.toFixed(2)})`)
            },
            (error) => {
              console.error(`❌ Error loading lining texture ${color}:`, error)
              matteMat.color.setHex(0x808080)
              matteMat.needsUpdate = true
            }
          )
        } else {
          matteMat.color.set(color)
          matteMat.needsUpdate = true
        }
        return
      }

      if (isTexture) {
        // ── Texture / fabric-image path ───────────────────────────────────────
        console.log(`🖼️ Loading fabric texture: ${color} for ${mesh.name}`)
        const baseCol = new THREE.Color(baseColor)
        const physMat = createFabricPhysicalMaterial(material, baseCol, null, garmentType, pbrOverride)

        replaceMeshMaterial(mesh, idx, isMaterialArray, physMat)

        // If PBR maps are still loading, patch them in once ready
        const _pbrForGarment = getPBRForGarment(garmentType, pbrOverride?.materialType)
        const _pbrPromiseForGarment = getPBRPromiseForGarment(garmentType, pbrOverride?.materialType)
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

        loadScaledFabricTexture(
          color,
          (texture) => {
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            const span = getUvSpan(mesh)
            texture.repeat.set(repeatX / span.u, repeatY / span.v)
            texture.colorSpace = THREE.SRGBColorSpace
            if (physMat.map) physMat.map.dispose()
            physMat.map = texture
            physMat.needsUpdate = true
            console.log(`✅ Applied fabric texture to ${mesh.name} (uvSpan ${span.u.toFixed(2)}×${span.v.toFixed(2)})`)
          },
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
        const _pbrForGarment2 = getPBRForGarment(garmentType, pbrOverride?.materialType)
        const _pbrPromiseForGarment2 = getPBRPromiseForGarment(garmentType, pbrOverride?.materialType)
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

// ─── Trim materials: buttons, button thread, buttonholes, cufflinks ──────────
// Italian material names from the garment GLTF exports:
//   Bottone/Bottoni = button, Gemelli = cufflinks, FIlobottoni = button thread,
//   Asola/Asole = buttonhole stitching, Ricamo = embroidery.
// Thread names are checked FIRST — "Filobottoni" contains "bottoni", so a plain
// includes() against the button list would misclassify thread as a button.
const TRIM_THREAD_NAMES = ['filobottoni', 'filobottone', 'asola', 'asole', 'ricamo']
const TRIM_BUTTON_NAMES = ['bottone', 'bottoni', 'gemelli']

/** Natural mother-of-pearl — default button shade when no explicit color is chosen. */
export const DEFAULT_BUTTON_COLOR = '#efe8da'

/**
 * Styles non-fabric trim meshes (buttons, thread, buttonholes, cufflinks) and
 * returns true when the mesh was trim (callers then skip fabric application).
 *
 * The shirt/pants GLTF exports carry NO pbrMetallicRoughness block on these
 * materials, so glTF spec defaults apply — metalness 1.0 — which renders as dark
 * shiny plastic that visually blends into the fabric tint. Buttons get a dedicated
 * glossy resin/pearl MeshPhysicalMaterial so they always read as separate objects
 * from the matte fabric; thread and buttonholes go matte, tinted to the button.
 *
 * @param buttonColor    Explicit button color ("standard"/undefined → pearl default,
 *                       never the fabric color — buttons must stay distinct).
 * @param fabricColorHint Solid fabric hex if known — used to tint buttonhole
 *                       stitching like a real shirt. Ignored for texture fabrics.
 */
export function applyTrimMaterial(
  mesh: THREE.Mesh,
  buttonColor?: string,
  fabricColorHint?: string,
): boolean {
  if (!mesh.material) return false
  const meshName = (mesh.name || '').toLowerCase()
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  const matNames = mats.map((m) => (m?.name || '').toLowerCase())
  const nameHits = (frags: string[]) =>
    frags.some((s) => meshName.includes(s) || matNames.some((n) => n.includes(s)))

  const isThread = nameHits(TRIM_THREAD_NAMES)
  const isButton = !isThread && nameHits(TRIM_BUTTON_NAMES)
  if (!isThread && !isButton) return false

  const chosen =
    buttonColor && buttonColor !== 'standard' ? buttonColor : DEFAULT_BUTTON_COLOR

  if (isButton) {
    // Replace once with a pearl/resin material, then only retint on re-apply.
    let btnMat = mesh.userData._trimButtonMat as THREE.MeshPhysicalMaterial | undefined
    if (!btnMat) {
      btnMat = new THREE.MeshPhysicalMaterial({
        metalness: 0.0,
        roughness: 0.32,
        clearcoat: 0.5,          // polished top layer — the classic button glint
        clearcoatRoughness: 0.25,
        envMapIntensity: 0.7,
        specularIntensity: 0.5,
        side: THREE.DoubleSide,
      })
      mesh.userData._trimButtonMat = btnMat
      mesh.material = Array.isArray(mesh.material)
        ? (mesh.material as THREE.Material[]).map(() => btnMat!)
        : btnMat
    }
    btnMat.color.set(chosen)
    btnMat.needsUpdate = true
    return true
  }

  // Thread / buttonhole / embroidery — matte, never metallic.
  const isButtonhole = nameHits(['asola', 'asole', 'ricamo'])
  const fabricIsHex = !!fabricColorHint && /^#[0-9a-fA-F]{3,8}$/.test(fabricColorHint)
  // Buttonholes match the shirt on real garments; button thread matches the button.
  const threadColor = isButtonhole
    ? new THREE.Color(fabricIsHex ? fabricColorHint! : '#d8d4cc')
    : new THREE.Color(chosen).multiplyScalar(0.85)
  mats.forEach((m) => {
    if (!(m instanceof THREE.MeshStandardMaterial)) return
    m.metalness = 0.0
    m.roughness = Math.max(m.roughness, 0.75)
    m.envMapIntensity = 0.12
    m.color.copy(threadColor)
    m.needsUpdate = true
  })
  return true
}
