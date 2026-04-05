"use client"

import React, { Suspense, useEffect, useState, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { applyFabricCustomization } from "@/lib/3d/customization-utils"
import { pantsConfigs, pantsFrontPocketConfigs, pantsBackPocketConfigs, pantsCuffConfigs, pantsWaistbandConfigs } from "@/lib/3d/pants-configs"

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

// Helper: Apply fabric styling to a loaded GLTF scene
// Material values matched to jacket viewer for consistent appearance
function applyPantsFabric(scene: THREE.Group, fabricColor?: string, fabricPbr?: { roughness?: number; normalScale?: number; bumpScale?: number; sheen?: number }, repeatX = 4, repeatY = 4) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]

      if (isFabricMesh(child)) {
        if (fabricColor) {
          // Use white base color so the texture renders in true colours (not multiplied by grey).
          // Apply the same PANTS_TEXTURE_SCALE (0.22) as the admin preview so both look identical.
          applyFabricCustomization(child, fabricColor, 0xffffff, 'trousers', repeatX * PANTS_TEXTURE_SCALE, repeatY * PANTS_TEXTURE_SCALE, fabricPbr)
        } else {
          // Fallback neutral cloth look before a fabric is selected.
          materials.forEach((material) => {
            if (!(material instanceof THREE.MeshStandardMaterial)) return
            material.color.setHex(PANTS_BASE_COLOR)
            material.roughness = 0.92
            material.metalness = 0.0
            material.envMapIntensity = 0.15
            material.flatShading = false
            material.needsUpdate = true
          })
        }
      } else {
        // Button / thread — keep original material, just ensure quality
        materials.forEach((material) => {
          if (!(material instanceof THREE.MeshStandardMaterial)) return
          material.roughness = Math.max(material.roughness, 0.5)
          material.envMapIntensity = 0.1
          material.needsUpdate = true
        })
      }
    }
  })
}

export interface BasicPantsCustomization {
  fabricColor?: string
  fabricPbr?: { roughness?: number; normalScale?: number; bumpScale?: number; sheen?: number }
  fabricRepeatX?: number
  fabricRepeatY?: number
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
    parts.forEach((scene) => applyPantsFabric(scene, customizations.fabricColor, customizations.fabricPbr, customizations.fabricRepeatX, customizations.fabricRepeatY))
  }, [pantsStyle, beltLoops, waistband, frontPocket, backPockets, bottomCuff, waistbandExtensions, customizations.fabricColor, customizations.fabricPbr, customizations.fabricRepeatX, customizations.fabricRepeatY])

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
        <ambientLight intensity={0.9} />

        {/* Main key light */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />

        {/* Fill light from the side */}
        <directionalLight position={[-5, 3, -3]} intensity={0.6} />

        {/* Rim light from behind */}
        <directionalLight position={[0, 3, -5]} intensity={0.3} />

        {/* Bottom fill light */}
        <hemisphereLight args={['#ffffff', '#666666', 0.35]} />

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

        {/* Environment for professional look — low intensity to avoid shiny reflections */}
        <Environment preset="studio" environmentIntensity={0.2} />
      </Canvas>
    </div>
  )
}
