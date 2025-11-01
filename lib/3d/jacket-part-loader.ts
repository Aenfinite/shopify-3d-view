/**
 * Jacket Part Loader
 * 
 * This module handles loading and customizing individual jacket parts.
 * It provides hooks and utilities for managing part loading states,
 * applying customizations, and handling errors.
 */

import { useLoader } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import { Material, Object3D } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import type { BasicJacketCustomization } from "@/types/configurator"
import { applyCustomizations } from "./customization-utils"

// Type for the returned jacket part data
export interface JacketPartData {
  scene?: Object3D | null
  materials?: { [key: string]: Material }
  nodes?: { [key: string]: Object3D }
  isLoading: boolean
  error?: Error
}

/**
 * Hook for loading and customizing a jacket part
 */
// Parts cache for loading status tracking
const partLoadingStatus: Record<string, boolean> = {}

/**
 * Preload all jacket parts for faster initial rendering
 */
export function preloadAllParts() {
  // For now, we'll just initialize the loading status
  // In the future, we can add specific paths to preload
  console.log('📦 Initializing parts preloader...')
}

// Generate a stable ID for a part based on its properties
function generateStablePartId(partName: string, modelPath: string, style: string): string {
  return `${partName}-${style}-${modelPath.split('/').pop()?.replace('.gltf', '')}`
}

export function useJacketPart(
  partName: string,
  modelPath: string,
  customizations: BasicJacketCustomization = {}
): JacketPartData {
  // Create a stable ID that won't change unless the part actually changes
  const stablePartId = useMemo(() => 
    generateStablePartId(partName, modelPath, customizations.frontStyle || '2button'),
    [partName, modelPath, customizations.frontStyle]
  )

  console.log(`📥 useJacketPart hook called:`, {
    partName,
    modelPath,
    stablePartId,
    customizations
  })

  // Use useLoader with GLTFLoader for proper binary file resolution
  const gltf = useLoader(GLTFLoader, modelPath, (loader) => {
    // Set up DRACO decoder
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    loader.setDRACOLoader(dracoLoader)
    
    console.log(`🔧 GLTFLoader configured for: ${modelPath}`)
  })
  
  const scene = gltf.scene
  const materials = (gltf as any).materials || {}
  const nodes = (gltf as any).nodes || {}

  // Log loading state
  if (!scene) {
    console.log(`⏳ Loading GLTF for ${partName}...`, {
      modelPath,
      hasMaterials: !!materials,
      hasNodes: !!nodes
    })
  }

  // Clone the scene to avoid shared state issues
  const clonedScene = useMemo(() => {
    if (scene) {
      console.log(`🔄 Cloning scene for ${partName}:`, {
        originalChildCount: scene.children.length,
        materials: Object.keys(materials || {})
      })
      return scene.clone()
    }
    return null
  }, [scene, partName, materials])

  // Apply customizations to the cloned scene
  useEffect(() => {
    if (clonedScene && customizations) {
      console.log(`🎨 Applying customizations to ${partName}:`, {
        customizations,
        meshCount: clonedScene.children.filter((child: any) => child.type === 'Mesh').length,
        materials: clonedScene.children
          .filter((child: any) => child.material)
          .map((child: any) => ({
            name: child.name,
            materialType: child.material.type
          }))
      })
      applyCustomizations(clonedScene, customizations)
    }
  }, [clonedScene, customizations, partName])

  const isLoading = !scene
  console.log(`📤 useJacketPart returning for ${partName}:`, {
    hasScene: !!clonedScene,
    hasMaterials: !!materials,
    hasNodes: !!nodes,
    isLoading
  })

  return {
    scene: clonedScene,
    materials,
    nodes,
    isLoading
  }
}