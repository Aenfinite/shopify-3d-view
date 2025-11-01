"use client"

import { useThree } from "@react-three/fiber"
import * as THREE from "three"

export function useTextureUtils() {
  const { gl } = useThree()
  
  const updateMaterialTextures = (material: THREE.Material) => {
    if (material instanceof THREE.MeshStandardMaterial || 
        material instanceof THREE.MeshPhysicalMaterial) {
          
      // Update PBR maps if they exist
      if (material.map) {
        material.map.colorSpace = THREE.SRGBColorSpace
        material.map.needsUpdate = true
      }
      
      if (material.normalMap) {
        material.normalMap.colorSpace = THREE.NoColorSpace
        material.normalMap.needsUpdate = true
      }
      
      if (material.roughnessMap) {
        material.roughnessMap.colorSpace = THREE.NoColorSpace
        material.roughnessMap.needsUpdate = true
      }
      
      if (material.metalnessMap) {
        material.metalnessMap.colorSpace = THREE.NoColorSpace
        material.metalnessMap.needsUpdate = true 
      }
      
      if (material.aoMap) {
        material.aoMap.colorSpace = THREE.NoColorSpace
        material.aoMap.needsUpdate = true
      }
    }
    
    // Always update material
    material.needsUpdate = true
  }

  const updateMeshTextures = (mesh: THREE.Mesh) => {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(updateMaterialTextures)
    } else if (mesh.material) {
      updateMaterialTextures(mesh.material)
    }
  }

  const updateSceneTextures = (scene: THREE.Scene) => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        updateMeshTextures(object)
      }
    })
  }

  return {
    updateMaterialTextures,
    updateMeshTextures, 
    updateSceneTextures
  }
}