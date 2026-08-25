"use client"

import React, { Suspense, useEffect, useState, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import * as THREE from "three"
import { GarmentLights } from "@/components/garment-lights"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import {
  shirtCollarConfigs,
  shirtSleeveConfigs,
  shirtCuffConfigs,
  shirtPocketConfigs,
  shirtFrontConfigs,
  shirtBackConfig,
  defaultShirtConfig,
  DEFAULT_SHIRT_CUFF,
} from "@/lib/3d/shirt-configs"
import { applyFabricCustomization, applyTrimMaterial, preloadFabricPBR, preloadShirtPBR } from "@/lib/3d/customization-utils"
import type { PBROverride } from "@/lib/3d/customization-utils"
import { computeCmBasedRepeats, hasCmScaling } from "@/lib/3d/garment-dimensions"

// Kick off shirt PBR texture download as early as possible
if (typeof window !== 'undefined') {
  preloadFabricPBR()
  preloadShirtPBR()
}

// ─── Constants ───────────────────────────────────────────────
const SHIRT_BASE_COLOR = 0xeeeeee
// Matches TEXTURE_REPEAT_SCALE['shirt'] in garment-canvas.tsx — keeps customer page in sync with admin preview
const SHIRT_TEXTURE_SCALE = 0.18

// Non-fabric trim (buttons, threads, cufflinks, buttonholes) is detected and
// styled by applyTrimMaterial in customization-utils — shared with the pants
// viewer and admin fabric preview so buttons look identical everywhere.

// Any material whose name contains "contrast" (case-insensitive) is a contrast material.

// ─── Helpers ─────────────────────────────────────────────────

/** Pin a mesh's material(s) to one face side, overriding the shared fabric default. */
function forceMaterialSide(mesh: THREE.Mesh, side: THREE.Side) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  for (const m of mats) {
    if (!m) continue
    m.side = side
    m.needsUpdate = true
  }
}

/**
 * The back-facing twin of a cuff surface — the inside of the cuff, visible at the
 * opening. Shares the outside mesh's geometry (no duplicated vertex data) and is
 * parented to it with an identity transform so it tracks the cuff exactly.
 * Created once and cached; later fabric changes re-use the same mesh.
 */
function ensureCuffInsideMesh(outside: THREE.Mesh): THREE.Mesh {
  const cached = outside.userData._cuffInsideMesh as THREE.Mesh | undefined
  if (cached) return cached

  const sourceMat = (Array.isArray(outside.material) ? outside.material[0] : outside.material) as THREE.Material
  const inside = new THREE.Mesh(outside.geometry, sourceMat.clone())
  inside.name = `${outside.name || 'cuff'}__inside`
  inside.userData._isCuffInside = true
  // Drawn after the outside surface so the opening reads cleanly.
  inside.renderOrder = (outside.renderOrder || 0) + 1
  outside.add(inside)
  outside.userData._cuffInsideMesh = inside
  return inside
}

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
  fabricRepeatX = 4,
  fabricRepeatY = 4,
  fabricPbr?: PBROverride,
  fabricRepeatWidthCm?: number,
  fabricRepeatHeightCm?: number,
  buttonColor?: string,
) {
  const defaultColor = `#${SHIRT_BASE_COLOR.toString(16).padStart(6, '0')}`

  // ALWAYS use cm-based scaling. Legacy multiplier is deprecated — it produced
  // unpredictable results because it ignored real fabric dimensions.
  // If the fabric record lacks cm values (old fabrics), fall back to standard
  // shirting defaults: 60in × 23.5in (152.4 × 59.7 cm). This renders any fabric
  // at the correct production scale even without admin-entered dimensions.
  const DEFAULT_FABRIC_W_CM = 152.4  // 60 inches — standard shirting roll width
  const DEFAULT_FABRIC_H_CM = 59.7   // ~23.5 inches — typical repeat height
  const effW = (fabricRepeatWidthCm && fabricRepeatWidthCm > 0) ? fabricRepeatWidthCm : DEFAULT_FABRIC_W_CM
  const effH = (fabricRepeatHeightCm && fabricRepeatHeightCm > 0) ? fabricRepeatHeightCm : DEFAULT_FABRIC_H_CM
  // fineTune is an enlargement knob centered at 1.0 (= exact cm scale): 2 = pattern 2× larger.
  // Pass 1/fineTune to computeCmBasedRepeats which uses a multiplier internally.
  // UV spans are normalized per-mesh in applyMaterialColor, so no global fudge is needed.
  const userFineTune = Math.max(0.1, fabricPbr?.fineTune ?? 1)
  const r = computeCmBasedRepeats('shirt', effW, effH, 1 / userFineTune)
  const rX = r.repeatsX
  const rY = r.repeatsY
  const usingDefaults = !hasCmScaling(fabricRepeatWidthCm, fabricRepeatHeightCm)
  console.log(
    `👔 [applyShirtFabric] ${usingDefaults ? 'CM-DEFAULT 🟡' : 'CM-MODE ✅'}  ` +
    `fabricW=${effW.toFixed(1)}cm fabricH=${effH.toFixed(1)}cm scale=${userFineTune}× → rX=${rX.toFixed(3)} rY=${rY.toFixed(3)}` +
    (usingDefaults ? ` (fabric record has no cm values — using 60in defaults)` : '')
  )

  // Collect first, then process. The cuff branch below adds an inside-surface mesh
  // to the scene, and mutating the graph during traverse() would revisit it.
  const meshes: THREE.Mesh[] = []
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) meshes.push(child)
  })

  meshes.forEach((child) => {
    // The generated cuff-inside surface is driven by its outside mesh, not on its own.
    if (child.userData._isCuffInside) return

    const meshName = (child.name || '').toLowerCase()
    const matNames = (Array.isArray(child.material)
      ? (child.material as THREE.Material[])
      : [child.material as THREE.Material]
    ).map(m => m.name.toLowerCase())

    // Non-fabric trim: buttons, thread, buttonholes, cufflinks.
    // Buttons get their own pearl/resin material (or the chosen buttonColor) —
    // never the shirt fabric color — so they read as separate objects.
    if (applyTrimMaterial(child, buttonColor, fabricColor)) return

    const cuffTex =
      contrastEnabled && contrastCuffTexture && contrastCuffTexture !== 'none'
        ? contrastCuffTexture
        : fabricColor
    const collarTex =
      contrastEnabled && contrastCollarTexture && contrastCollarTexture !== 'none'
        ? contrastCollarTexture
        : fabricColor

    // ── Cuff ────────────────────────────────────────────────────────────────
    // The collar model carries a dedicated inner panel ("CollarContrast.00x") so
    // its contrast surface is real geometry. The cuff is a single-walled tube —
    // one mesh, no inner panel — so its "inside" is the back of the same surface.
    // Rendering it once double-sided means outside and inside can never differ.
    // Instead the outside is drawn front-facing, and a second mesh sharing the
    // same geometry is drawn back-facing for the inside, which is what shows at
    // the cuff opening. That gives the cuff the same inside-contrast behaviour
    // the collar already has.
    const isCuffSurface = matNames.some(n => n.includes('cuff')) || meshName.includes('cuff')
    if (isCuffSurface) {
      applyFabricCustomization(child, fabricColor ?? defaultColor, 0xffffff, 'shirt', rX, rY, fabricPbr)
      forceMaterialSide(child, THREE.FrontSide)

      const inside = ensureCuffInsideMesh(child)
      applyFabricCustomization(inside, cuffTex ?? defaultColor, 0xffffff, 'shirt', rX, rY, fabricPbr)
      forceMaterialSide(inside, THREE.BackSide)
      return
    }

    // ── Collar contrast (dedicated panel in the model) ──────────────────────
    if (matNames.some(n => n.includes('contrast'))) {
      applyFabricCustomization(child, collarTex ?? defaultColor, 0xffffff, 'shirt', rX, rY, fabricPbr)
      return
    }

    // Main fabric area — use the full PBR pipeline
    applyFabricCustomization(child, fabricColor ?? defaultColor, 0xffffff, 'shirt', rX, rY, fabricPbr)
  })
}

// ─── Types ───────────────────────────────────────────────────

export interface BasicShirtCustomization {
  fabricColor?: string
  fabricType?: string
  fabricRepeatX?: number
  fabricRepeatY?: number
  /** Real cm repeat width of the fabric print tile (production-accurate scaling). */
  fabricRepeatWidthCm?: number
  /** Real cm repeat height of the fabric print tile. */
  fabricRepeatHeightCm?: number
  fabricPbr?: PBROverride
  collarStyle?: string          // "kent-collar" | "button-down-collar" | "spread-collar"
  sleeveStyle?: string          // "half-sleeve" | "full-sleeve"
  cuffStyle?: string            // "rounded-cuff-2-buttons" | "square-cuff-2-buttons" (legacy ids fall back to rounded)
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
  const [backScene, setBackScene] = useState<THREE.Group | null>(null)
  const [collarScene, setCollarScene] = useState<THREE.Group | null>(null)
  const [sleeveScene, setSleeveScene] = useState<THREE.Group | null>(null)
  const [cuffScene, setCuffScene] = useState<THREE.Group | null>(null)
  const [pocketScene, setPocketScene] = useState<THREE.Group | null>(null)
  const [modelScale, setModelScale] = useState(1)
  const [modelYOffset, setModelYOffset] = useState(0)
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
    const isHalfSleeve = customizations.sleeveStyle === "half-sleeve"

    // Sleeve geometry (full or half). Full sleeves also load a cuff below;
    // half sleeves have no cuff.
    const sleevePath = isHalfSleeve
      ? shirtSleeveConfigs["half-sleeve"]
      : shirtSleeveConfigs["full-sleeve"]

    // Cuff — only for full sleeves; default rounded 2-button.
    const cuffKey = customizations.cuffStyle || DEFAULT_SHIRT_CUFF
    const cuffPath = isHalfSleeve
      ? null
      : (shirtCuffConfigs[cuffKey] || shirtCuffConfigs[DEFAULT_SHIRT_CUFF])

    // Chest pocket
    const pocketKey = customizations.chestPocket || "no-pocket"
    const pocketPath = shirtPocketConfigs[pocketKey] ?? null

    return {
      front: shirtFrontConfigs[frontKey] || defaultShirtConfig.priority.front,
      back: shirtBackConfig,
      collar: shirtCollarConfigs[collarKey] || defaultShirtConfig.priority.collar,
      sleeve: sleevePath,
      cuff: cuffPath,
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
  // Fabric props are intentionally NOT in this effect's dependencies.
  // Changing fabric must never trigger a GLTF reload — see fabric-apply
  // effect below which re-applies materials to already-loaded scenes.
  useEffect(() => {
    setIsLoading(true)

    const loadPart = (path: string): Promise<THREE.Group> =>
      new Promise((resolve, reject) => {
        loader.load(
          path,
          (gltf) => resolve(gltf.scene.clone()),
          undefined,
          reject
        )
      })

    Promise.all([
      loadPart(resolvedPaths.front),
      loadPart(resolvedPaths.back),
      loadPart(resolvedPaths.collar),
      loadPart(resolvedPaths.sleeve),
    ])
      .then(([front, back, collar, sleeve]) => {
        // Compute scale from the front piece and center model at y=0
        const bbox = new THREE.Box3().setFromObject(front)
        const size = bbox.getSize(new THREE.Vector3())
        const center = bbox.getCenter(new THREE.Vector3())
        const desiredHeight = 2.0
        const computedScale =
          size.y > 0.0001 ? desiredHeight / size.y : 1
        // Offset so the front-piece centre sits at world y=0
        const yOffset = -center.y * computedScale

        setFrontScene(front)
        setBackScene(back)
        setCollarScene(collar)
        setSleeveScene(sleeve)
        setModelScale(computedScale)
        setModelYOffset(yOffset)
        setIsLoading(false)
        console.log("✅ Shirt main parts loaded", {
          front: resolvedPaths.front,
          back: resolvedPaths.back,
          collar: resolvedPaths.collar,
          sleeve: resolvedPaths.sleeve,
        })
      })
      .catch((error) => {
        console.error("❌ Error loading shirt parts:", error)
        setIsLoading(false)
      })
  }, [resolvedPaths.front, resolvedPaths.back, resolvedPaths.collar, resolvedPaths.sleeve, loader])

  // ─── Separate fabric-apply effect ────────────────────────────────────────
  // Runs whenever any loaded scene OR fabric props change.
  // Never reloads GLTFs — just re-applies materials to existing scenes.
  useEffect(() => {
    const parts = [frontScene, backScene, collarScene, sleeveScene, cuffScene, pocketScene].filter(
      (s): s is THREE.Group => s !== null
    )
    if (parts.length === 0) return
    parts.forEach((scene) =>
      applyShirtFabric(
        scene,
        customizations.fabricColor,
        customizations.contrastEnabled,
        customizations.contrastCollarTexture,
        customizations.contrastCuffTexture,
        customizations.fabricRepeatX,
        customizations.fabricRepeatY,
        customizations.fabricPbr,
        customizations.fabricRepeatWidthCm,
        customizations.fabricRepeatHeightCm,
        customizations.buttonColor,
      )
    )
  }, [
    frontScene, backScene, collarScene, sleeveScene, cuffScene, pocketScene,
    customizations.fabricColor,
    customizations.contrastEnabled,
    customizations.contrastCollarTexture,
    customizations.contrastCuffTexture,
    customizations.fabricRepeatX,
    customizations.fabricRepeatY,
    customizations.fabricRepeatWidthCm,
    customizations.fabricRepeatHeightCm,
    customizations.fabricPbr,
    customizations.buttonColor,
  ])

  // ─── Load optional chest pocket ───
  // Fabric is applied by the shared fabric-apply effect above once pocketScene is set.
  useEffect(() => {
    if (!resolvedPaths.pocket) {
      setPocketScene(null)
      return
    }

    loader.load(
      resolvedPaths.pocket,
      (gltf) => {
        setPocketScene(gltf.scene.clone())
        console.log("✅ Shirt chest pocket loaded")
      },
      undefined,
      (error) => {
        console.error("❌ Error loading shirt pocket:", error)
        setPocketScene(null)
      }
    )
  }, [resolvedPaths.pocket, loader])

  // ─── Load cuff (full sleeve only) ───
  // Fabric is applied by the shared fabric-apply effect above once cuffScene is set.
  useEffect(() => {
    if (!resolvedPaths.cuff) {
      setCuffScene(null)
      return
    }

    loader.load(
      resolvedPaths.cuff,
      (gltf) => {
        setCuffScene(gltf.scene.clone())
        console.log("✅ Shirt cuff loaded", resolvedPaths.cuff)
      },
      undefined,
      (error) => {
        console.error("❌ Error loading shirt cuff:", error)
        setCuffScene(null)
      }
    )
  }, [resolvedPaths.cuff, loader])

  if (isLoading || !frontScene || !backScene || !collarScene || !sleeveScene) {
    return <LoadingOverlay />
  }

  // All parts share one origin and assemble at [0,0,0].
  return (
    <group position={[0, modelYOffset, 0]} scale={[modelScale, modelScale, modelScale]}>
      <primitive object={frontScene} position={[0, 0, 0]} />
      <primitive object={backScene} position={[0, 0, 0]} />
      <primitive object={collarScene} position={[0, 0, 0]} />
      <primitive object={sleeveScene} position={[0, 0, 0]} />
      {cuffScene && (
        <primitive object={cuffScene} position={[0, 0, 0]} />
      )}
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
  targetDistance = 3.2,
  controlsRef,
}: {
  targetAzimuth: number
  targetY: number
  targetDistance: number
  controlsRef: React.MutableRefObject<any>
}) {
  const { camera } = useThree()
  const isUserInteracting = React.useRef(false)
  const prevAzimuth = React.useRef(targetAzimuth)
  const prevY = React.useRef(targetY)
  const prevDist = React.useRef(targetDistance)

  // Re-enable animation only when a step navigation drives a real prop change
  React.useEffect(() => {
    const azimuthChanged = Math.abs(prevAzimuth.current - targetAzimuth) > 0.01
    const yChanged = Math.abs(prevY.current - targetY) > 0.001
    const distChanged = Math.abs(prevDist.current - targetDistance) > 0.001
    if (azimuthChanged || yChanged || distChanged) {
      isUserInteracting.current = false
      prevAzimuth.current = targetAzimuth
      prevY.current = targetY
      prevDist.current = targetDistance
    }
  }, [targetAzimuth, targetY, targetDistance])

  // Mark as user-interacting on drag start; leave position sticky on drag end
  React.useEffect(() => {
    if (!controlsRef.current) return
    const controls = controlsRef.current
    const onStart = () => { isUserInteracting.current = true }
    controls.addEventListener("start", onStart)
    return () => { controls.removeEventListener("start", onStart) }
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
  cameraZoom = 3.2,
}: ModularShirtViewerProps) {
  const controlsRef = React.useRef<any>(null)

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 3.2], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={["#f5f5f5"]} />
        <fog attach="fog" args={["#f5f5f5", 15, 40]} />

        {/* Lighting — soft studio setup for premium cotton look.
             40% ambient reduction vs before creates real shadow depth.
             Key from top-right, warm hemisphere, studio env = no harsh reflections. */}
        {/* Lighting — shared single-source rig (components/garment-lights.tsx)
            so the admin fabric preview and this customer view match exactly. */}
        <GarmentLights productType="shirt" />

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
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  )
}
