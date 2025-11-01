"use client"

import * as THREE from 'three'

// Helper function to apply color to a mesh's materials
export function applyColorToMesh(mesh: THREE.Mesh, color: string, options = { metalness: 0.0, roughness: 0.8 }) {
  // Handle both single materials and material arrays
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

  // Apply color to each material
  materials.forEach(material => {
    if (!material) return

    // Standard material (PBR)
    if (material instanceof THREE.MeshStandardMaterial) {
      material.color.setStyle(color)
      material.color.convertSRGBToLinear()
      material.metalness = options.metalness
      material.roughness = options.roughness
    }
    // Phong material
    else if (material instanceof THREE.MeshPhongMaterial) {
      material.color.setStyle(color)
      material.color.convertSRGBToLinear()
      material.shininess = 30
    }
    // Basic material with color
    else if ('color' in material) {
      const basicMaterial = material as THREE.Material & { color: THREE.Color }
      basicMaterial.color.setStyle(color)
      basicMaterial.color.convertSRGBToLinear()
    }

    material.needsUpdate = true
  })
}

// Helper to update mesh visibility
export function setMeshVisibility(mesh: THREE.Mesh | THREE.Group, visible: boolean) {
  if (!mesh) return
  mesh.visible = visible
  mesh.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.visible = visible
    }
  })
}

// Helper to reset material properties
export function resetMaterialProperties(material: THREE.Material) {
  if (material instanceof THREE.MeshStandardMaterial) {
    material.metalness = 0.0
    material.roughness = 0.8
    material.normalScale.set(1, 1)
  }
  else if (material instanceof THREE.MeshPhongMaterial) {
    material.shininess = 30
    material.specular.setRGB(0.1, 0.1, 0.1)
  }

  material.needsUpdate = true
}

// Helper to traverse and update all materials
export function updateAllMaterials(object: THREE.Object3D, callback: (material: THREE.Material) => void) {
  object.traverse(child => {
    if (child instanceof THREE.Mesh) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach(callback)
    }
  })
}