"use client"

import React, { Suspense, useEffect, useState, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { applyFabricCustomization } from "@/lib/3d/customization-utils"
import { pantsConfigs, pantsFrontPocketConfigs, pantsBackPocketConfigs, pantsCuffConfigs, pantsWaistbandConfigs } from "@/lib/3d/pants-configs"
import { computeCmBasedRepeats, hasCmScaling } from "@/lib/3d/garment-dimensions"

// Same scale factor as garment-canvas.tsx TEXTURE_REPEAT_SCALE['pants'].
// Keeps the customer page in sync with the admin 3D preview.
const PANTS_TEXTURE_SCALE = 0.22

// Neutral fallback base color when no fabric is selected.
// Keep this aligned with jacket defaults to avoid cross-garment color mismatch.
const PANTS_BASE_COLOR = 0xaaaaaa

// Material names that are NOT fabric — skip fabric color/texture on these
const NON_FABRIC_MATERIALS = ['filobottoni', 'bottone', 'filobottone']

// Helper: Check if a mesh/material is fabric (not a button or thread)
function isFabricMesh(child: THREE.Mesh): boolean {
  const materialName = ((child.material as THREE.MeshStandardMaterial)?.name || '').toLowerCase()
  const meshName = (child.name || '').toLowerCase()
  // Skip button and thread meshes
  return !NON_FABRIC_MATERIALS.some(skip => materialName.includes(skip) || meshName.includes(skip))
}

// Strip plastic-looking properties from any GLTF-imported material so back-area
// meshes (Basemodel.gltf) don't look shiny. Safe on MeshStandard / MeshPhysical.
function tameMaterialShine(material: THREE.Material) {
  const m = material as THREE.MeshStandardMaterial & Partial<THREE.MeshPhysicalMaterial>
  if (typeof (m as any).metalness === 'number') m.metalness = 0.0
  if (typeof (m as any).roughness === 'number') m.roughness = Math.max(m.roughness ?? 0, 0.9)
  if (typeof (m as any).envMapIntensity === 'number') m.envMapIntensity = 0.15
  // Kill MeshPhysicalMaterial plastic effects if present
  if (typeof m.clearcoat === 'number') m.clearcoat = 0
  if (typeof m.clearcoatRoughness === 'number') m.clearcoatRoughness = 1
  if (typeof m.sheen === 'number' && m.sheen > 0.3) m.sheen = 0.18
  if (typeof m.specularIntensity === 'number') m.specularIntensity = Math.min(m.specularIntensity, 0.3)
  if (typeof m.reflectivity === 'number') m.reflectivity = Math.min(m.reflectivity, 0.1)
  m.needsUpdate = true
}

// Force DoubleSide rendering so pants geometry is visible from inside/all angles.
// Many GLTFs export pants as single-sided thin shells which disappear when viewed
// from the inside or extreme angles. DoubleSide fixes that.
function forceDoubleSide(mesh: THREE.Mesh) {
  const apply = (m: THREE.Material) => {
    m.side = THREE.DoubleSide
    m.shadowSide = THREE.DoubleSide
    m.needsUpdate = true
  }
  if (Array.isArray(mesh.material)) mesh.material.forEach(apply)
  else if (mesh.material) apply(mesh.material)
}

// Helper: Apply fabric styling to a loaded GLTF scene
// Material values matched to jacket viewer for consistent appearance
function applyPantsFabric(scene: THREE.Group, fabricColor?: string, fabricPbr?: { roughness?: number; normalScale?: number; bumpScale?: number; sheen?: number }, repeatX = 4, repeatY = 4, repeatWidthCm?: number, repeatHeightCm?: number) {
  // cm-based scaling when both values are provided; otherwise legacy multiplier.
  const useCm = hasCmScaling(repeatWidthCm, repeatHeightCm)
  let rX: number, rY: number
  if (useCm) {
    const userFineTune = Math.max(0.1, (fabricPbr as any)?.fineTune ?? 5)
    const r = computeCmBasedRepeats('pants', repeatWidthCm!, repeatHeightCm!, 1 / userFineTune)
    rX = r.repeatsX
    rY = r.repeatsY
  } else {
    rX = repeatX * PANTS_TEXTURE_SCALE
    rY = repeatY * PANTS_TEXTURE_SCALE
  }

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]

      if (isFabricMesh(child)) {
        if (fabricColor) {
          // Pre-tame the source material BEFORE the physical material is built from it,
          // so any plastic specular/clearcoat baked into the GLTF is wiped out first.
          materials.forEach((material) => tameMaterialShine(material))
          // Use white base color so the texture renders in true colours (not multiplied by grey).
          applyFabricCustomization(child, fabricColor, 0xffffff, 'trousers', rX, rY, fabricPbr)
        } else {
          // Fallback neutral cloth look before a fabric is selected.
          materials.forEach((material) => {
            tameMaterialShine(material)
            if (material instanceof THREE.MeshStandardMaterial) {
              material.color.setHex(PANTS_BASE_COLOR)
              material.flatShading = false
              material.needsUpdate = true
            }
          })
        }
        // Always force DoubleSide on fabric meshes so they render from inside too.
        forceDoubleSide(child)
      } else {
        // Button / thread — keep original material, just ensure quality
        materials.forEach((material) => {
          if (!(material instanceof THREE.MeshStandardMaterial)) return
          material.roughness = Math.max(material.roughness, 0.5)
          material.metalness = Math.min(material.metalness ?? 0, 0.3)
          material.envMapIntensity = 0.1
          material.needsUpdate = true
        })
        // Buttons/thread also DoubleSide for safety on thin geometry.
        forceDoubleSide(child)
      }
    }
  })
}

export interface BasicPantsCustomization {
  fabricColor?: string
  fabricPbr?: { roughness?: number; normalScale?: number; bumpScale?: number; sheen?: number }
  fabricRepeatX?: number
  fabricRepeatY?: number
  /** Real cm repeat width of the fabric print tile (production-accurate scaling). */
  fabricRepeatWidthCm?: number
  /** Real cm repeat height of the fabric print tile. */
  fabricRepeatHeightCm?: number
  fabricType?: string
  frontStyle?: string
  frontPocket?: string
  backPocket?: string
  bottomCuffs?: string
  waistbandExtension?: string
  buttonColor?: string
}

interface ModularPantsViewerProps {
  customizations?: BasicPantsCustomization
  frontStyle?: string
  className?: string
  cameraRotationY?: number
  cameraTargetY?: number // Vertical position of what camera looks at
}

// Loading indicator
function LoadingOverlay({ message = "Loading Pants Model..." }: { message?: string }) {
  return (
    <Html fullscreen>
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl flex flex-col items-center space-y-4 border-2 border-primary/20">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-xl font-semibold text-gray-800">{message}</p>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    </Html>
  )
}

// Pants Model Component
function PantsModel({
  customizations = {},
}: {
  customizations: BasicPantsCustomization
}) {
  const [pantsStyle, setPantsStyle] = useState<THREE.Group | null>(null)
  const [beltLoops, setBeltLoops] = useState<THREE.Group | null>(null)
  const [waistband, setWaistband] = useState<THREE.Group | null>(null)
  const [frontPocket, setFrontPocket] = useState<THREE.Group | null>(null)
  const [backPockets, setBackPockets] = useState<THREE.Group[]>([])
  const [bottomCuff, setBottomCuff] = useState<THREE.Group | null>(null)
  const [waistbandExtensions, setWaistbandExtensions] = useState<THREE.Group[]>([])
  const [modelScale, setModelScale] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const loader = useMemo(() => {
    const gltfLoader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    gltfLoader.setDRACOLoader(dracoLoader)
    return gltfLoader
  }, [])

  // Load main pants components (no fabric applied here — fabric effect below re-runs on its own)
  useEffect(() => {
    setIsLoading(true)

    // Get front style from customizations, default to flat-front
    const frontStyle = customizations.frontStyle || 'flat-front'
    const pantsConfig = pantsConfigs[frontStyle] || pantsConfigs['flat-front']

    const stylePath = pantsConfig.priority.style
    const beltLoopsPath = pantsConfig.priority.beltLoops
    const waistbandPath = pantsConfig.priority.waistband

    Promise.all([
      new Promise<THREE.Group>((resolve, reject) => {
        loader.load(stylePath, (gltf) => resolve(gltf.scene.clone()), undefined, reject)
      }),
      new Promise<THREE.Group>((resolve, reject) => {
        loader.load(beltLoopsPath, (gltf) => resolve(gltf.scene.clone()), undefined, reject)
      }),
      new Promise<THREE.Group>((resolve, reject) => {
        loader.load(waistbandPath, (gltf) => resolve(gltf.scene.clone()), undefined, reject)
      })
    ])
      .then(([style, loops, waist]) => {
        const bbox = new THREE.Box3().setFromObject(style)
        const size = bbox.getSize(new THREE.Vector3())
        const desiredHeight = 2.6
        const computedScale = size.y > 0.0001 ? desiredHeight / size.y : 1

        setPantsStyle(style)
        setBeltLoops(loops)
        setWaistband(waist)
        setModelScale(computedScale)
        setIsLoading(false)
        console.log("✅ Pants models loaded successfully", {
          height: Number(size.y.toFixed(3)),
          scale: Number(computedScale.toFixed(3)),
        })
      })
      .catch((error) => {
        console.error("❌ Error loading pants models:", error)
        setIsLoading(false)
      })
  }, [customizations.frontStyle, loader])

  // Load front pocket
  useEffect(() => {
    const frontPocketStyle = customizations.frontPocket
    
    if (!frontPocketStyle || !pantsFrontPocketConfigs[frontPocketStyle]) {
      setFrontPocket(null)
      return
    }

    const pocketPath = pantsFrontPocketConfigs[frontPocketStyle]
    
    loader.load(
      pocketPath,
      (gltf) => {
        setFrontPocket(gltf.scene.clone())
        console.log(`✅ Front pocket loaded: ${frontPocketStyle}`)
      },
      undefined,
      (error) => {
        console.error(`❌ Error loading front pocket ${frontPocketStyle}:`, error)
        setFrontPocket(null)
      }
    )
  }, [customizations.frontPocket, loader])

  // Load back pocket(s)
  useEffect(() => {
    const backPocketStyle = customizations.backPocket
    
    if (!backPocketStyle || !pantsBackPocketConfigs[backPocketStyle]) {
      setBackPockets([])
      return
    }

    const pocketPaths = pantsBackPocketConfigs[backPocketStyle]
    
    Promise.all(
      pocketPaths.map(pocketPath => 
        new Promise<THREE.Group>((resolve, reject) => {
          loader.load(
            pocketPath,
            (gltf) => resolve(gltf.scene.clone()),
            undefined,
            reject
          )
        })
      )
    )
      .then((scenes) => {
        setBackPockets(scenes)
        console.log(`✅ Back pockets loaded: ${backPocketStyle} (${scenes.length} files)`)
      })
      .catch((error) => {
        console.error(`❌ Error loading back pockets ${backPocketStyle}:`, error)
        setBackPockets([])
      })
  }, [customizations.backPocket, loader])

  // Load bottom cuff
  useEffect(() => {
    const cuffStyle = customizations.bottomCuffs
    
    if (!cuffStyle || !pantsCuffConfigs[cuffStyle]) {
      setBottomCuff(null)
      return
    }

    const cuffPath = pantsCuffConfigs[cuffStyle]
    
    // If cuffPath is null (turn-ups), don't load anything
    if (!cuffPath) {
      setBottomCuff(null)
      return
    }
    
    loader.load(
      cuffPath,
      (gltf) => {
        setBottomCuff(gltf.scene.clone())
        console.log(`✅ Bottom cuff loaded: ${cuffStyle}`)
      },
      undefined,
      (error) => {
        console.error(`❌ Error loading bottom cuff ${cuffStyle}:`, error)
        setBottomCuff(null)
      }
    )
  }, [customizations.bottomCuffs, loader])

  // Load waistband extension
  useEffect(() => {
    const extensionStyle = customizations.waistbandExtension
    
    if (!extensionStyle || !pantsWaistbandConfigs[extensionStyle]) {
      setWaistbandExtensions([])
      return
    }

    const extensionPaths = pantsWaistbandConfigs[extensionStyle]
    
    // Skip loading if it's just the normal waistband (already loaded in main components)
    if (extensionStyle === 'no-extension') {
      setWaistbandExtensions([])
      return
    }
    
    Promise.all(
      extensionPaths.map(extensionPath => 
        new Promise<THREE.Group>((resolve, reject) => {
          loader.load(
            extensionPath,
            (gltf) => resolve(gltf.scene.clone()),
            undefined,
            reject
          )
        })
      )
    )
      .then((scenes) => {
        setWaistbandExtensions(scenes)
        console.log(`✅ Waistband extensions loaded: ${extensionStyle} (${scenes.length} files)`)
      })
      .catch((error) => {
        console.error(`❌ Error loading waistband extensions ${extensionStyle}:`, error)
        setWaistbandExtensions([])
      })
  }, [customizations.waistbandExtension, loader])

  // ── Separate fabric-apply effect ───────────────────────────────────────────
  // Runs whenever any loaded scene changes OR the fabric color changes.
  // This mirrors the working garment-canvas.tsx approach and ensures Supabase
  // image URLs (cross-origin textures) are applied AFTER the scene is mounted.
  useEffect(() => {
    const parts = [
      pantsStyle, beltLoops, waistband, frontPocket,
      ...backPockets, bottomCuff, ...waistbandExtensions,
    ].filter((s): s is THREE.Group => s !== null)
    if (parts.length === 0) return
    parts.forEach((scene) => applyPantsFabric(scene, customizations.fabricColor, customizations.fabricPbr, customizations.fabricRepeatX, customizations.fabricRepeatY, customizations.fabricRepeatWidthCm, customizations.fabricRepeatHeightCm))
  }, [pantsStyle, beltLoops, waistband, frontPocket, backPockets, bottomCuff, waistbandExtensions, customizations.fabricColor, customizations.fabricPbr, customizations.fabricRepeatX, customizations.fabricRepeatY, customizations.fabricRepeatWidthCm, customizations.fabricRepeatHeightCm])

  if (isLoading || !pantsStyle || !beltLoops || !waistband) {
    return <LoadingOverlay />
  }

  return (
    <group position={[0, 0, 0]} scale={[modelScale, modelScale, modelScale]}>
      <primitive object={pantsStyle} position={[0, 0, 0]} />
      <primitive object={beltLoops} position={[0, 0, 0]} />
      <primitive object={waistband} position={[0, 0, 0]} />
      {frontPocket && <primitive object={frontPocket} position={[0, 0, 0]} />}
      {backPockets.map((pocket, index) => (
        <primitive key={`back-pocket-${index}`} object={pocket} position={[0, 0, 0]} />
      ))}
      {bottomCuff && <primitive object={bottomCuff} position={[0, 0, 0]} />}
      {waistbandExtensions.map((extension, index) => (
        <primitive key={`waistband-ext-${index}`} object={extension} position={[0, 0, 0]} />
      ))}
    </group>
  )
}

// Smooth camera orbit rotation using OrbitControls
function OrbitCameraController({ 
  targetAzimuth = 0, 
  targetY = 0,
  controlsRef 
}: { 
  targetAzimuth: number
  targetY: number
  controlsRef: React.MutableRefObject<any>
}) {
  const { camera } = useThree()
  const isUserInteracting = React.useRef(false)
  const prevAzimuth = React.useRef(targetAzimuth)
  const prevY = React.useRef(targetY)

  // Re-enable animation only when a step navigation drives a real prop change
  React.useEffect(() => {
    const azimuthChanged = Math.abs(prevAzimuth.current - targetAzimuth) > 0.01
    const yChanged = Math.abs(prevY.current - targetY) > 0.001
    if (azimuthChanged || yChanged) {
      isUserInteracting.current = false
      prevAzimuth.current = targetAzimuth
      prevY.current = targetY
    }
  }, [targetAzimuth, targetY])

  // Mark as user-interacting on drag start; leave position sticky on drag end
  React.useEffect(() => {
    if (!controlsRef.current) return
    const controls = controlsRef.current
    const onStart = () => { isUserInteracting.current = true }
    controls.addEventListener('start', onStart)
    return () => { controls.removeEventListener('start', onStart) }
  }, [controlsRef])
  
  useFrame(() => {
    if (!controlsRef.current) return
    
    // Don't auto-animate if user is interacting
    if (isUserInteracting.current) return
    
    const controls = controlsRef.current
    
    // Smoothly interpolate azimuthal angle (horizontal rotation)
    const currentAzimuth = controls.getAzimuthalAngle()
    const azimuthDiff = targetAzimuth - currentAzimuth
    
    // Normalize angle difference to [-PI, PI]
    let normalizedDiff = azimuthDiff
    if (normalizedDiff > Math.PI) normalizedDiff -= 2 * Math.PI
    if (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI
    
    // Apply rotation
    if (Math.abs(normalizedDiff) > 0.01) {
      controls.setAzimuthalAngle(currentAzimuth + normalizedDiff * 0.4)
    }
    
    // Smoothly interpolate target Y position (vertical look-at)
    const currentTargetY = controls.target.y
    const targetYDiff = targetY - currentTargetY
    
    if (Math.abs(targetYDiff) > 0.001) {
      controls.target.y += targetYDiff * 0.4
    }
    
    controls.update()
  })
  
  return null
}

export default function ModularPantsViewerR3F({
  customizations = {},
  frontStyle = "flat-front",
  className = "",
  cameraRotationY = 0,
  cameraTargetY = 0,
}: ModularPantsViewerProps) {
  const controlsRef = React.useRef<any>(null)
  
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        camera={{ position: [0, 0.4, 2.9], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={["#f5f5f5"]} />
        <fog attach="fog" args={["#f5f5f5", 15, 40]} />
        
        {/* Brighter lighting for fully-matte fabric */}
        <ambientLight intensity={1.0} />

        {/* Main key light — front-top-right */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />

        {/* Front fill light — softens shadows on the front */}
        <directionalLight position={[-5, 3, 3]} intensity={0.5} />

        {/* Back-fill: two soft, wide-angled diffuse lights instead of one
            harsh rim light. This evenly illuminates the back without
            creating specular highlights that read as plastic shine. */}
        <directionalLight position={[-4, 4, -4]} intensity={0.35} />
        <directionalLight position={[4, 4, -4]} intensity={0.35} />

        {/* Bottom + sky hemisphere for soft global wrap */}
        <hemisphereLight args={['#ffffff', '#888888', 0.45]} />

        <Suspense fallback={<LoadingOverlay />}>
          <PantsModel customizations={customizations} />
          <OrbitCameraController 
            targetAzimuth={cameraRotationY} 
            targetY={cameraTargetY}
            controlsRef={controlsRef}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={1.8}
          maxDistance={8}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 6}
          target={[0, -0.1, 0]}
        />

        {/* Environment for soft global illumination — kept very low so HDRI
            reflections don't create specular highlights on the back fabric.
            "apartment" preset is more uniform than "studio" (no harsh studio
            softboxes baked into the HDRI). */}
        <Environment preset="apartment" environmentIntensity={0.08} />
      </Canvas>
    </div>
  )
}
