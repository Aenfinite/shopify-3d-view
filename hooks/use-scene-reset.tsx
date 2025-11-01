"use client"

import { useEffect } from "react"
import * as THREE from "three"
import { useThree } from "@react-three/fiber"

export function useSceneReset() {
  const { scene, gl } = useThree()
  
  const resetScene = () => {
    // Reset all materials
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const materials = Array.isArray(node.material) ? node.material : [node.material]
        
        materials.forEach(material => {
          if (material) {
            // Force material to update
            material.needsUpdate = true
            
            // Reset color management
            if ('color' in material) {
              const mat = material as THREE.MeshStandardMaterial
              mat.color.convertSRGBToLinear()
            }
          }
        })
        
        // Force geometry to update
        node.geometry.attributes.position.needsUpdate = true
        node.geometry.computeBoundingSphere()
      }
    })

    // Force renderer to update
    gl.state.reset()
    gl.clear()
    
    console.log('🔄 Scene fully reset')
  }

  // Reset on mount
  useEffect(() => {
    resetScene()
  }, [])

  return resetScene
}

// Usage:
// const resetScene = useSceneReset()
// Call resetScene() after major material changes