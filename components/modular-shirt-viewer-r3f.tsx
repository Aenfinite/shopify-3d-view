"use client"

import React, { Suspense, useEffect, useState, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import {
  shirtCollarConfigs,
  shirtSleeveConfigs,
  shirtCuffConfigs,
  shirtPocketConfigs,
  shirtFrontConfigs,
  defaultShirtConfig,
} from "@/lib/3d/shirt-configs"
import { applyFabricCustomization, preloadFabricPBR, preloadShirtPBR } from "@/lib/3d/customization-utils"

// Kick off shirt PBR texture download as early as possible
if (typeof window !== 'undefined') {
  preloadFabricPBR()
  preloadShirtPBR()
}

// ─── Constants ───────────────────────────────────────────────
const SHIRT_BASE_COLOR = 0xeeeeee

// Material names that are NOT fabric (buttons, threads, cufflinks, eyelets)
const NON_FABRIC_MATERIALS = [
  "filobottoni",
  "bottone",
  "filobottone",
  "asola",
  "gemelli",
  "ricamo",
]

// Any material whose name contains "contrast" (case-insensitive) is a contrast material.

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Apply fabric to every mesh in a shirt GLTF scene using the same
 * PBR material pipeline as the jacket (MeshPhysicalMaterial + linen maps).
 * Detection is done at mesh level: mesh name / material names determine
 * whether a mesh is fabric, contrast, or non-fabric (buttons/thread).
 */
function applyShirtFabric(
  scene: THREE.Group,
  fabricColor?: string,
  contrastEnabled?: boolean,
  contrastCollarTexture?: string,
  contrastCuffTexture?: string,
) {
  const defaultColor = `#${SHIRT_BASE_COLOR.toString(16).padStart(6, '0')}`

  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !child.material) return

    const meshName = (child.name || '').toLowerCase()
    const matNames = (Array.isArray(child.material)
      ? (child.material as THREE.Material[])
      : [child.material as THREE.Material]
    ).map(m => m.name.toLowerCase())

    // Non-fabric: buttons, thread, cufflinks — keep original material, just quality settings
    const isNonFabric = NON_FABRIC_MATERIALS.some(
      s => meshName.includes(s) || matNames.some(n => n.includes(s))
    )
    if (isNonFabric) {
      const mats = Array.isArray(child.material)
        ? (child.material as THREE.Material[])
        : [child.material as THREE.Material]
      mats.forEach(m => {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.roughness = Math.max(m.roughness, 0.5)
          m.envMapIntensity = 0.1
          m.needsUpdate = true
        }
      })
      return
    }

    // Contrast material detection
    const isContrast = matNames.some(n => n.includes('contrast'))
    if (isContrast) {
      const isCollarContrast =
        matNames.some(n => n.includes('collar')) || meshName.includes('collar')
      if (contrastEnabled) {
        const collarTex =
          contrastCollarTexture && contrastCollarTexture !== 'none'
            ? contrastCollarTexture
            : fabricColor
        const cuffTex =
          contrastCuffTexture && contrastCuffTexture !== 'none'
            ? contrastCuffTexture
            : fabricColor
        const texToUse = isCollarContrast ? collarTex : cuffTex
        applyFabricCustomization(child, texToUse ?? defaultColor, undefined, 'shirt')
      } else {
        applyFabricCustomization(child, fabricColor ?? defaultColor, undefined, 'shirt')
      }
      return
    }

    // Main fabric area — use the full PBR pipeline
    applyFabricCustomization(child, fabricColor ?? defaultColor, undefined, 'shirt')
  })
}

// ─── Types ───────────────────────────────────────────────────

export interface BasicShirtCustomization {
  fabricColor?: string
  fabricType?: string
  collarStyle?: string          // "kent-collar" | "button-down-collar" | "spread-collar"
  sleeveStyle?: string          // "half-sleeve" | "full-sleeve"
  cuffStyle?: string            // "rounded-cuff" | "french-cuff"
  chestPocket?: string          // "no-pocket" | "chest-pocket"
  frontStyle?: string           // "box-placket" | "french-placket"
  contrastEnabled?: boolean     // collar & cuff contrast yes/no
  contrastCollarTexture?: string // texture path for collar contrast (or "none")
  contrastCuffTexture?: string   // texture path for cuff contrast (or "none")
  buttonColor?: string
  monogramText?: string
  monogramPosition?: string     // "mg-rightcuff" | "mg-leftcuff" | "mg-bottom" | "mg-pocket"
  monogramColor?: string        // thread color hex
}

interface ModularShirtViewerProps {
  customizations?: BasicShirtCustomization
  className?: string
  cameraRotationY?: number
  cameraTargetY?: number
  cameraZoom?: number
}

// ─── Loading overlay ─────────────────────────────────────────

function LoadingOverlay({
  message = "Loading Shirt Model...",
}: {
  message?: string
}) {
  return (
    <Html fullscreen>
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl flex flex-col items-center space-y-4 border-2 border-primary/20">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xl font-semibold text-gray-800">{message}</p>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    </Html>
  )
}

// ─── Shirt Model Component ──────────────────────────────────

function ShirtModel({
  customizations = {},
}: {
  customizations: BasicShirtCustomization
}) {
  const [frontScene, setFrontScene] = useState<THREE.Group | null>(null)
  const [collarScene, setCollarScene] = useState<THREE.Group | null>(null)
  const [sleeveScene, setSleeveScene] = useState<THREE.Group | null>(null)
  const [pocketScene, setPocketScene] = useState<THREE.Group | null>(null)
  const [modelScale, setModelScale] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const loader = useMemo(() => {
    const gltfLoader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("/draco/")
    gltfLoader.setDRACOLoader(dracoLoader)
    return gltfLoader
  }, [])

  // Resolve which GLTF paths to load based on customizations
  const resolvedPaths = useMemo(() => {
    const collarKey = customizations.collarStyle || "kent-collar"
    const frontKey = customizations.frontStyle || "box-placket"

    // Determine sleeve/cuff path
    let sleevePath: string
    if (customizations.sleeveStyle === "half-sleeve") {
      sleevePath = shirtSleeveConfigs["half-sleeve"]
    } else {
      // Full sleeve → use selected cuff, default rounded
      const cuffKey = customizations.cuffStyle || "rounded-cuff"
      sleevePath = shirtCuffConfigs[cuffKey] || shirtCuffConfigs["rounded-cuff"]
    }

    // Chest pocket
    const pocketKey = customizations.chestPocket || "no-pocket"
    const pocketPath = shirtPocketConfigs[pocketKey] ?? null

    return {
      front: shirtFrontConfigs[frontKey] || defaultShirtConfig.priority.front,
      collar: shirtCollarConfigs[collarKey] || defaultShirtConfig.priority.collar,
      sleeve: sleevePath,
      pocket: pocketPath,
    }
  }, [
    customizations.collarStyle,
    customizations.frontStyle,
    customizations.sleeveStyle,
    customizations.cuffStyle,
    customizations.chestPocket,
  ])

  // ─── Load main shirt parts (front, collar, sleeve) ───
  useEffect(() => {
    setIsLoading(true)

    const loadPart = (path: string): Promise<THREE.Group> =>
      new Promise((resolve, reject) => {
        loader.load(
          path,
          (gltf) => {
            const scene = gltf.scene.clone()
            applyShirtFabric(
              scene,
              customizations.fabricColor,
              customizations.contrastEnabled,
              customizations.contrastCollarTexture,
              customizations.contrastCuffTexture,
            )
            resolve(scene)
          },
          undefined,
          reject
        )
      })

    Promise.all([
      loadPart(resolvedPaths.front),
      loadPart(resolvedPaths.collar),
      loadPart(resolvedPaths.sleeve),
    ])
      .then(([front, collar, sleeve]) => {
        // Compute scale from the front piece
        const bbox = new THREE.Box3().setFromObject(front)
        const size = bbox.getSize(new THREE.Vector3())
        const desiredHeight = 2.6
        const computedScale =
          size.y > 0.0001 ? desiredHeight / size.y : 1

        setFrontScene(front)
        setCollarScene(collar)
        setSleeveScene(sleeve)
        setModelScale(computedScale)
        setIsLoading(false)
        console.log("✅ Shirt main parts loaded", {
          front: resolvedPaths.front,
          collar: resolvedPaths.collar,
          sleeve: resolvedPaths.sleeve,
        })
      })
      .catch((error) => {
        console.error("❌ Error loading shirt parts:", error)
        setIsLoading(false)
      })
  }, [
    resolvedPaths.front,
    resolvedPaths.collar,
    resolvedPaths.sleeve,
    customizations.fabricColor,
    customizations.contrastEnabled,
    customizations.contrastCollarTexture,
    customizations.contrastCuffTexture,
    loader,
  ])

  // ─── Load optional chest pocket ───
  useEffect(() => {
    if (!resolvedPaths.pocket) {
      setPocketScene(null)
      return
    }

    loader.load(
      resolvedPaths.pocket,
      (gltf) => {
        const scene = gltf.scene.clone()
        applyShirtFabric(scene, customizations.fabricColor)
        setPocketScene(scene)
        console.log("✅ Shirt chest pocket loaded")
      },
      undefined,
      (error) => {
        console.error("❌ Error loading shirt pocket:", error)
        setPocketScene(null)
      }
    )
  }, [resolvedPaths.pocket, customizations.fabricColor, loader])

  if (isLoading || !frontScene || !collarScene || !sleeveScene) {
    return <LoadingOverlay />
  }

  return (
    <group position={[0, 0, 0]} scale={[modelScale, modelScale, modelScale]}>
      <primitive object={frontScene} position={[0, 0, 0]} />
      <primitive object={collarScene} position={[0, 0, 0]} />
      <primitive object={sleeveScene} position={[0, 0, 0]} />
      {pocketScene && (
        <primitive object={pocketScene} position={[0, 0, 0]} />
      )}
    </group>
  )
}

// ─── Shirt Monogram Overlay ─────────────────────────────────────

const MONOGRAM_POSITIONS: Record<string, { pos: [number,number,number]; rot: [number,number,number]; w: number; h: number }> = {
  "mg-rightcuff": { pos: [0.55, -0.50, 0.09], rot: [0, -0.3, 0],   w: 0.11, h: 0.038 },
  "mg-leftcuff":  { pos: [-0.55, -0.50, 0.09], rot: [0,  0.3, 0],   w: 0.11, h: 0.038 },
  "mg-bottom":    { pos: [-0.16, -0.88, 0.14], rot: [0,  0,   0.05], w: 0.10, h: 0.036 },
  "mg-pocket":    { pos: [ 0.18,  0.28, 0.16], rot: [0,  0,   0],   w: 0.10, h: 0.036 },
}

function MonogramMesh({
  text,
  placement,
  color = "#1e3a8a",
  modelScale = 1,
}: {
  text: string
  placement: string
  color?: string
  modelScale?: number
}) {
  const p = MONOGRAM_POSITIONS[placement]
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.clearRect(0, 0, 512, 128)
    ctx.fillStyle = color
    ctx.font = "italic bold 56px 'Georgia', serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, 256, 64)
    const t = new THREE.CanvasTexture(canvas)
    t.needsUpdate = true
    return t
  }, [text, color])

  if (!p || !texture) return null

  return (
    <mesh
      position={[p.pos[0] * modelScale, p.pos[1] * modelScale, p.pos[2] * modelScale]}
      rotation={p.rot}
      renderOrder={1}
    >
      <planeGeometry args={[p.w * modelScale, p.h * modelScale]} />
      <meshBasicMaterial map={texture} transparent depthTest={false} side={THREE.FrontSide} />
    </mesh>
  )
}

// ─── Camera Controller ──────────────────────────────────────

function OrbitCameraController({
  targetAzimuth = 0,
  targetY = 0,
  targetDistance = 2.9,
  controlsRef,
}: {
  targetAzimuth: number
  targetY: number
  targetDistance: number
  controlsRef: React.MutableRefObject<any>
}) {
  const { camera } = useThree()
  const isUserInteracting = React.useRef(false)
  const userInteractionTimeout = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    if (!controlsRef.current) return
    const controls = controlsRef.current

    const onStart = () => {
      isUserInteracting.current = true
      if (userInteractionTimeout.current)
        clearTimeout(userInteractionTimeout.current)
    }
    const onEnd = () => {
      if (userInteractionTimeout.current)
        clearTimeout(userInteractionTimeout.current)
      userInteractionTimeout.current = setTimeout(() => {
        isUserInteracting.current = false
      }, 500)
    }

    controls.addEventListener("start", onStart)
    controls.addEventListener("end", onEnd)
    return () => {
      controls.removeEventListener("start", onStart)
      controls.removeEventListener("end", onEnd)
      if (userInteractionTimeout.current)
        clearTimeout(userInteractionTimeout.current)
    }
  }, [controlsRef])

  useFrame(() => {
    if (!controlsRef.current || isUserInteracting.current) return
    const controls = controlsRef.current

    // Smooth azimuthal interpolation
    const currentAzimuth = controls.getAzimuthalAngle()
    let diff = targetAzimuth - currentAzimuth
    if (diff > Math.PI) diff -= 2 * Math.PI
    if (diff < -Math.PI) diff += 2 * Math.PI
    if (Math.abs(diff) > 0.01) {
      controls.setAzimuthalAngle(currentAzimuth + diff * 0.4)
    }

    // Smooth vertical target interpolation
    const yDiff = targetY - controls.target.y
    if (Math.abs(yDiff) > 0.001) {
      controls.target.y += yDiff * 0.4
    }

    // Smooth zoom (distance) interpolation
    if (camera instanceof THREE.PerspectiveCamera) {
      const camPos = camera.position
      const target = controls.target
      const dir = camPos.clone().sub(target)
      const currentDist = dir.length()
      const distDiff = targetDistance - currentDist
      if (Math.abs(distDiff) > 0.005) {
        dir.setLength(currentDist + distDiff * 0.1)
        camera.position.copy(target).add(dir)
      }
    }

    controls.update()
  })

  return null
}

// ─── Main Exported Viewer ───────────────────────────────────

export default function ModularShirtViewerR3F({
  customizations = {},
  className = "",
  cameraRotationY = 0,
  cameraTargetY = 0,
  cameraZoom = 2.9,
}: ModularShirtViewerProps) {
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

        {/* Lighting — matched to pants viewer for consistency */}
        <ambientLight intensity={0.9} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-5, 3, -3]} intensity={0.6} />
        <directionalLight position={[0, 3, -5]} intensity={0.3} />
        <hemisphereLight args={["#ffffff", "#666666", 0.35]} />

        <Suspense fallback={<LoadingOverlay />}>
          <ShirtModel customizations={customizations} />
          {customizations.monogramText && customizations.monogramPosition && customizations.monogramPosition !== "no-monogram" && (
            <MonogramMesh
              text={customizations.monogramText}
              placement={customizations.monogramPosition}
              color={customizations.monogramColor || "#1e3a8a"}
            />
          )}
          <OrbitCameraController
            targetAzimuth={cameraRotationY}
            targetY={cameraTargetY}
            targetDistance={cameraZoom}
            controlsRef={controlsRef}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={0.8}
          maxDistance={8}
          maxPolarAngle={Math.PI / 1.4}
          minPolarAngle={Math.PI / 8}
          target={[0, -0.1, 0]}
        />

        <Environment preset="studio" environmentIntensity={0.2} />
      </Canvas>
    </div>
  )
}
