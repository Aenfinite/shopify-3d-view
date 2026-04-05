"use client"

import { useState, useEffect, useMemo } from "react"
import { useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { Loader2 } from "lucide-react"
import {
  applyFabricCustomization,
  type PBROverride,
  type GarmentType,
} from "@/lib/3d/customization-utils"

// ─── Constants ────────────────────────────────────────────────

export const DEFAULT_MODEL_PATHS: Record<string, string[]> = {
  shirt: [
    "/models/shirts/Front/boxplacket.gltf",
    "/models/shirts/Collar/kentcollar.gltf",
    "/models/shirts/Cuffs/roundedcuff.gltf",
    "/models/shirts/Pocket/pocket.gltf",
  ],
  jacket: [
    "/models/jackets/Front/Bottom/2Button/Curved.gltf",
    "/models/jackets/Front/Button/2Button/S4.gltf",
    "/models/jackets/Lapel/Regular/Upper/2Button/CL2.gltf",
    "/models/jackets/Lapel/Regular/Lower/2Button/CL2.gltf",
    "/models/jackets/Sleeve/Sleeve.gltf",
    "/models/jackets/Sleeve/Working/4Button/S4.gltf",
    "/models/jackets/Vent/NoVent.gltf",
    "/models/jackets/Pocket/PK-1.gltf",
    "/models/jackets/Pocket/ChestPocket.gltf",
  ],
  pants: [
    "/models/pants/FrontStyle/NoPleats.gltf",
    "/models/pants/BeltLoops/01.gltf",
    "/models/pants/Backandbasebeltarea/Basemodel.gltf",
    "/models/pants/Pockets/Slanted.gltf",
    "/models/pants/BackPockets/Buttonedweltpocket.gltf",
  ],
}

export const CAMERA_PRESETS: Record<
  string,
  { position: [number, number, number]; target: [number, number, number]; fov: number }
> = {
  shirt:  { position: [0, 0.4, 2.9], target: [0, -0.1, 0], fov: 45 },
  jacket: { position: [0, 0.8, 7.0], target: [0, 0.5, 0],  fov: 45 },
  pants:  { position: [0, 0.4, 2.9], target: [0, -0.1, 0], fov: 45 },
}

// Mesh / material names that are NOT fabric — skip applying fabric color to these.
const NON_FABRIC_NAMES = [
  "bottoni", "bottone", "filobottoni", "filobottone",
  "asola", "asole", "gemelli", "ricamo",
]

// Per-product texture repeat scale so patterns look the same visual size regardless
// of camera distance (jacket is the reference at 1.0).
const TEXTURE_REPEAT_SCALE: Record<string, number> = {
  jacket: 1.0,
  shirt:  0.18,
  pants:  0.22,
}

// ─── Helpers ─────────────────────────────────────────────────

export function disposeScene(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose()
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((m) => {
        if (m instanceof THREE.Material) {
          Object.values(m).forEach((val) => {
            if (val instanceof THREE.Texture) val.dispose()
          })
          m.dispose()
        }
      })
    }
  })
}

// ─── R3F sub-components ──────────────────────────────────────

/** Syncs camera to the correct preset whenever productType changes */
export function CameraUpdater({ productType }: { productType: string }) {
  const { camera } = useThree()
  useEffect(() => {
    const preset = CAMERA_PRESETS[productType] ?? CAMERA_PRESETS.shirt
    camera.position.set(...preset.position)
    camera.lookAt(...preset.target)
    camera.updateProjectionMatrix()
  }, [productType, camera])
  return null
}

// ─── Main GarmentModel component ─────────────────────────────

interface GarmentModelProps {
  productType: string
  fabricColor: string | null
  fabricImageUrl: string | null
  repeatX?: number
  repeatY?: number
  zoomMultiplier?: number
  pbrSettings?: {
    roughness: number
    normal_scale: number
    bump_scale: number
    sheen: number
    darkness: number
    fabricMaterialType?: string
  }
}

export function GarmentModel({
  productType,
  fabricColor,
  fabricImageUrl,
  repeatX = 6,
  repeatY = 6,
  zoomMultiplier = 1,
  pbrSettings,
}: GarmentModelProps) {
  const [loadedScenes, setLoadedScenes] = useState<THREE.Group[]>([])
  const [modelScale, setModelScale] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const garmentType: GarmentType =
    productType === "pants" ? "trousers" : (productType as GarmentType)

  const loader = useMemo(() => {
    const gltfLoader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("/draco/")
    gltfLoader.setDRACOLoader(dracoLoader)
    return gltfLoader
  }, [])

  // Load model parts whenever productType changes
  useEffect(() => {
    const paths = DEFAULT_MODEL_PATHS[productType] ?? DEFAULT_MODEL_PATHS.shirt
    setIsLoading(true)
    let cancelled = false

    const loadPromises = paths.map(
      (path) =>
        new Promise<THREE.Group>((resolve) => {
          loader.load(
            path,
            (gltf) => resolve(gltf.scene.clone()),
            undefined,
            (err) => {
              console.error("GLTF load error:", path, err)
              resolve(new THREE.Group())
            }
          )
        })
    )

    Promise.all(loadPromises).then((loaded) => {
      if (cancelled) {
        loaded.forEach(disposeScene)
        return
      }

      // Scale so the garment fills ~2.6 height units regardless of product type
      const tempGroup = new THREE.Group()
      loaded.forEach((s) => tempGroup.add(s.clone()))
      const bbox = new THREE.Box3().setFromObject(tempGroup)
      const size = bbox.getSize(new THREE.Vector3())
      const computedScale = size.y > 0.001 ? 2.6 / size.y : 1
      tempGroup.children.forEach((c) => disposeScene(c))

      setModelScale(computedScale)
      setLoadedScenes((prev) => {
        prev.forEach(disposeScene)
        return loaded
      })
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [productType, loader])

  // Dispose on unmount
  useEffect(() => {
    return () => {
      setLoadedScenes((prev) => {
        prev.forEach(disposeScene)
        return []
      })
    }
  }, [])

  // Apply fabric colour / texture to all fabric meshes
  useEffect(() => {
    if (loadedScenes.length === 0) return

    const pbrOverride: PBROverride | undefined = pbrSettings
      ? {
          roughness:   pbrSettings.roughness,
          normalScale: pbrSettings.normal_scale,
          bumpScale:   pbrSettings.bump_scale,
          sheen:       pbrSettings.sheen,
          darkness:    pbrSettings.darkness,
          materialType: pbrSettings.fabricMaterialType,
        }
      : undefined

    // Apply the per-product scale so patterns appear at the correct visual size.
    const scale = TEXTURE_REPEAT_SCALE[productType] ?? 1.0

    loadedScenes.forEach((scene) => {
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh) || !child.material) return

        const meshName = (child.name || "").toLowerCase()
        const mats = Array.isArray(child.material)
          ? (child.material as THREE.Material[])
          : [child.material as THREE.Material]
        const matNames = mats.map((m) => m.name.toLowerCase())

        const isNonFabric = NON_FABRIC_NAMES.some(
          (s) => meshName.includes(s) || matNames.some((n) => n.includes(s))
        )
        if (isNonFabric) return

        if (fabricImageUrl) {
          applyFabricCustomization(
            child, fabricImageUrl, 0xffffff, garmentType,
            repeatX * scale, repeatY * scale, pbrOverride
          )
        } else {
          applyFabricCustomization(
            child, fabricColor || "#eeeeee", undefined, garmentType,
            repeatX * scale, repeatY * scale, pbrOverride
          )
        }
      })
    })
  }, [loadedScenes, fabricColor, fabricImageUrl, garmentType, repeatX, repeatY, pbrSettings, productType])

  if (isLoading) {
    return (
      <Html center>
        <div className="flex flex-col items-center gap-3 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-gray-700">Loading model…</p>
        </div>
      </Html>
    )
  }

  if (loadedScenes.length === 0) return null

  const finalScale = modelScale * zoomMultiplier
  return (
    <group scale={[finalScale, finalScale, finalScale]}>
      {loadedScenes.map((scene, i) => (
        <primitive key={`part-${i}`} object={scene} />
      ))}
    </group>
  )
}
