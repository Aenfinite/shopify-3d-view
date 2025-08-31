import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

export interface DetectedLayer {
  name: string
  type: "Mesh" | "Group" | "Object3D"
  visible: boolean
  hasGeometry: boolean
  hasMaterial: boolean
  materialInfo?: {
    type: string
    color?: string
    map?: boolean
  }
}

export interface ModelAnalysis {
  layers: DetectedLayer[]
  totalObjects: number
  meshCount: number
  materialCount: number
  textureCount: number
}

export class ModelAnalyzer {
  private loader: GLTFLoader

  constructor() {
    this.loader = new GLTFLoader()
  }

  async analyzeModel(modelUrl: string): Promise<ModelAnalysis> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        modelUrl,
        (gltf) => {
          const analysis = this.extractLayers(gltf.scene)
          resolve(analysis)
        },
        (progress) => {
          console.log("Loading progress:", progress)
        },
        (error) => {
          console.error("Error loading model:", error)
          reject(error)
        },
      )
    })
  }

  private extractLayers(scene: THREE.Object3D): ModelAnalysis {
    const layers: DetectedLayer[] = []
    let meshCount = 0
    let materialCount = 0
    let textureCount = 0

    const traverse = (object: THREE.Object3D) => {
      // Skip objects without names or with generic names
      if (object.name && object.name !== "" && !object.name.startsWith("Scene")) {
        const layer: DetectedLayer = {
          name: object.name,
          type: object.type as "Mesh" | "Group" | "Object3D",
          visible: object.visible,
          hasGeometry: false,
          hasMaterial: false,
        }

        // Check if it's a mesh with geometry and material
        if (object instanceof THREE.Mesh) {
          meshCount++
          layer.hasGeometry = !!object.geometry
          layer.hasMaterial = !!object.material

          if (object.material) {
            materialCount++
            const material = Array.isArray(object.material) ? object.material[0] : object.material

            layer.materialInfo = {
              type: material.type,
            }

            // Extract color information
            if ("color" in material && material.color instanceof THREE.Color) {
              layer.materialInfo.color = `#€{material.color.getHexString()}`
            }

            // Check for textures
            if ("map" in material && material.map) {
              layer.materialInfo.map = true
              textureCount++
            }
          }
        }

        layers.push(layer)
      }

      // Recursively traverse children
      object.children.forEach(traverse)
    }

    traverse(scene)

    return {
      layers,
      totalObjects: layers.length,
      meshCount,
      materialCount,
      textureCount,
    }
  }

  // Helper method to suggest layer categories based on naming patterns
  static suggestCategory(layerName: string): string {
    const name = layerName.toLowerCase()

    if (name.includes("collar")) return "collar"
    if (name.includes("button") || name.includes("placket")) return "buttons"
    if (name.includes("cuff") || name.includes("sleeve")) return "cuffs"
    if (name.includes("back") || name.includes("yoke") || name.includes("pleat")) return "back"
    if (name.includes("pocket")) return "pockets"
    if (name.includes("lapel")) return "lapels"
    if (name.includes("lining")) return "lining"
    if (name.includes("body") || name.includes("main")) return "base"

    return "style"
  }
}
