import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { jacketPartsMapping, findMeshByMapping, shouldPartBeVisible, PartMapping } from "./jacket-parts-mapping"

export interface JacketParts {
  body?: THREE.Object3D
  sleeves?: {
    left?: THREE.Object3D
    right?: THREE.Object3D
  }
  front?: {
    left?: THREE.Object3D
    right?: THREE.Object3D
  }
  lapels?: {
    left?: THREE.Object3D
    right?: THREE.Object3D
  }
  pockets?: {
    chest?: THREE.Object3D[]
    waist?: THREE.Object3D[]
  }
  buttons?: THREE.Object3D[]
  collar?: THREE.Object3D
  lining?: THREE.Object3D
  cuffs?: {
    left?: THREE.Object3D
    right?: THREE.Object3D
  }
}

export interface JacketCustomization {
  fabricColor?: string
  fabricType?: string
  lapelStyle?: string
  sleeveStyle?: string
  frontStyle?: string
  pocketStyle?: string
  buttonStyle?: string
  collarStyle?: string
  liningColor?: string
  ventStyle?: string
}

export class JacketModelLoader {
  private loader: GLTFLoader
  private loadedModels: Map<string, THREE.Group> = new Map()

  constructor() {
    this.loader = new GLTFLoader()
  }

  async loadJacketModel(modelPath: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      // Check if model is already loaded
      if (this.loadedModels.has(modelPath)) {
        const cachedModel = this.loadedModels.get(modelPath)!
        resolve(cachedModel.clone())
        return
      }

      this.loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene
          this.loadedModels.set(modelPath, model)
          resolve(model.clone())
        },
        (progress) => {
          console.log(`Loading jacket model: ${(progress.loaded / progress.total * 100)}%`)
        },
        (error) => {
          console.error("Error loading jacket model:", error)
          reject(error)
        }
      )
    })
  }

  extractJacketParts(model: THREE.Group): JacketParts {
    const parts: JacketParts = {
      sleeves: {},
      front: {},
      lapels: {},
      pockets: { chest: [], waist: [] },
      buttons: [],
      cuffs: {}
    }

    // Use the mapping system to find parts
    const mapping = jacketPartsMapping

    // Find body
    parts.body = findMeshByMapping(model, mapping.body) || undefined

    // Find sleeves
    parts.sleeves!.left = findMeshByMapping(model, mapping.sleeves.left) || undefined
    parts.sleeves!.right = findMeshByMapping(model, mapping.sleeves.right) || undefined

    // Find front panels
    parts.front!.left = findMeshByMapping(model, mapping.front.left) || undefined
    parts.front!.right = findMeshByMapping(model, mapping.front.right) || undefined

    // Find lapels (all types)
    parts.lapels!.left = 
      findMeshByMapping(model, mapping.lapels.notched.left) ||
      findMeshByMapping(model, mapping.lapels.peak.left) ||
      findMeshByMapping(model, mapping.lapels.shawl.left) || undefined
    
    parts.lapels!.right = 
      findMeshByMapping(model, mapping.lapels.notched.right) ||
      findMeshByMapping(model, mapping.lapels.peak.right) ||
      findMeshByMapping(model, mapping.lapels.shawl.right) || undefined

    // Find pockets
    const chestWelt = findMeshByMapping(model, mapping.pockets.chest.welt)
    const chestFlap = findMeshByMapping(model, mapping.pockets.chest.flap)
    const chestPatch = findMeshByMapping(model, mapping.pockets.chest.patch)
    if (chestWelt) parts.pockets!.chest!.push(chestWelt)
    if (chestFlap) parts.pockets!.chest!.push(chestFlap)
    if (chestPatch) parts.pockets!.chest!.push(chestPatch)

    const waistWelt = findMeshByMapping(model, mapping.pockets.waist.welt)
    const waistFlap = findMeshByMapping(model, mapping.pockets.waist.flap)
    const waistPatch = findMeshByMapping(model, mapping.pockets.waist.patch)
    if (waistWelt) parts.pockets!.waist!.push(waistWelt)
    if (waistFlap) parts.pockets!.waist!.push(waistFlap)
    if (waistPatch) parts.pockets!.waist!.push(waistPatch)

    // Find buttons
    const frontSingleButtons = findMeshByMapping(model, mapping.buttons.front.single)
    const frontDoubleButtons = findMeshByMapping(model, mapping.buttons.front.double)
    const sleeveButtons = findMeshByMapping(model, mapping.buttons.sleeves)
    
    if (frontSingleButtons) parts.buttons!.push(frontSingleButtons)
    if (frontDoubleButtons) parts.buttons!.push(frontDoubleButtons)
    if (sleeveButtons) parts.buttons!.push(sleeveButtons)

    // Find collar
    parts.collar = 
      findMeshByMapping(model, mapping.collar.standard) ||
      findMeshByMapping(model, mapping.collar.mandarin) ||
      findMeshByMapping(model, mapping.collar.wing) || undefined

    // Find cuffs
    parts.cuffs!.left = findMeshByMapping(model, mapping.cuffs.left) || undefined
    parts.cuffs!.right = findMeshByMapping(model, mapping.cuffs.right) || undefined

    // Find lining
    parts.lining = findMeshByMapping(model, mapping.lining) || undefined

    return parts
  }

  applyJacketCustomizations(parts: JacketParts, customizations: JacketCustomization): void {
    // Apply fabric color
    if (customizations.fabricColor) {
      this.applyColorToParts([parts.body, parts.sleeves?.left, parts.sleeves?.right, parts.front?.left, parts.front?.right], customizations.fabricColor)
    }

    // Apply lining color
    if (customizations.liningColor && parts.lining) {
      this.applyColorToParts([parts.lining], customizations.liningColor)
    }

    // Hide/show lapel styles
    if (customizations.lapelStyle) {
      this.handleLapelStyle(parts, customizations.lapelStyle)
    }

    // Handle pocket styles
    if (customizations.pocketStyle) {
      this.handlePocketStyle(parts, customizations.pocketStyle)
    }

    // Handle front styles (single/double breasted)
    if (customizations.frontStyle) {
      this.handleFrontStyle(parts, customizations.frontStyle)
    }

    // Apply fabric texture based on type
    if (customizations.fabricType) {
      this.applyFabricTexture(parts, customizations.fabricType)
    }
  }

  private applyColorToParts(objects: (THREE.Object3D | undefined)[], color: string): void {
    objects.forEach(obj => {
      if (!obj) return
      
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = Array.isArray(child.material) ? child.material[0] : child.material
          if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhongMaterial) {
            material.color.setStyle(color)
          }
        }
      })
    })
  }

  private handleLapelStyle(parts: JacketParts, style: string): void {
    const mapping = jacketPartsMapping
    
    // Handle different lapel types using the mapping system
    const lapelMappings = [
      { type: 'notched', mapping: mapping.lapels.notched },
      { type: 'peak', mapping: mapping.lapels.peak },
      { type: 'shawl', mapping: mapping.lapels.shawl }
    ]
    
    // Find and control visibility of lapel parts
    lapelMappings.forEach(({ type, mapping: lapelMapping }) => {
      const leftLapel = findMeshByMapping(parts.lapels?.left || new THREE.Group(), lapelMapping.left)
      const rightLapel = findMeshByMapping(parts.lapels?.right || new THREE.Group(), lapelMapping.right)
      
      const shouldShow = shouldPartBeVisible(lapelMapping.left, style)
      
      if (leftLapel) leftLapel.visible = shouldShow
      if (rightLapel) rightLapel.visible = shouldShow
    })
  }

  private handlePocketStyle(parts: JacketParts, style: string): void {
    const mapping = jacketPartsMapping
    
    // Handle chest pockets
    const chestPocketTypes = [
      { type: 'welt', mapping: mapping.pockets.chest.welt },
      { type: 'flap', mapping: mapping.pockets.chest.flap },
      { type: 'patch', mapping: mapping.pockets.chest.patch }
    ]
    
    chestPocketTypes.forEach(({ type, mapping: pocketMapping }) => {
      parts.pockets?.chest?.forEach(pocket => {
        const pocketPart = findMeshByMapping(pocket, pocketMapping)
        if (pocketPart) {
          pocketPart.visible = shouldPartBeVisible(pocketMapping, style)
        }
      })
    })
    
    // Handle waist pockets
    const waistPocketTypes = [
      { type: 'welt', mapping: mapping.pockets.waist.welt },
      { type: 'flap', mapping: mapping.pockets.waist.flap },
      { type: 'patch', mapping: mapping.pockets.waist.patch }
    ]
    
    waistPocketTypes.forEach(({ type, mapping: pocketMapping }) => {
      parts.pockets?.waist?.forEach(pocket => {
        const pocketPart = findMeshByMapping(pocket, pocketMapping)
        if (pocketPart) {
          pocketPart.visible = shouldPartBeVisible(pocketMapping, style)
        }
      })
    })
  }

  private handleFrontStyle(parts: JacketParts, style: string): void {
    const mapping = jacketPartsMapping
    
    // Handle single vs double breasted button configuration
    parts.buttons?.forEach(buttonGroup => {
      const singleButtons = findMeshByMapping(buttonGroup, mapping.buttons.front.single)
      const doubleButtons = findMeshByMapping(buttonGroup, mapping.buttons.front.double)
      
      if (singleButtons) {
        singleButtons.visible = shouldPartBeVisible(mapping.buttons.front.single, style)
      }
      if (doubleButtons) {
        doubleButtons.visible = shouldPartBeVisible(mapping.buttons.front.double, style)
      }
    })
  }

  private applyFabricTexture(parts: JacketParts, fabricType: string): void {
    const fabricParts = [parts.body, parts.sleeves?.left, parts.sleeves?.right, parts.front?.left, parts.front?.right]
    
    fabricParts.forEach(part => {
      if (!part) return
      
      part.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = Array.isArray(child.material) ? child.material[0] : child.material
          if (material instanceof THREE.MeshStandardMaterial) {
            // Adjust material properties based on fabric type
            switch (fabricType) {
              case 'wool':
                material.roughness = 0.8
                material.metalness = 0.0
                break
              case 'silk':
                material.roughness = 0.2
                material.metalness = 0.1
                break
              case 'cotton':
                material.roughness = 0.9
                material.metalness = 0.0
                break
              case 'velvet':
                material.roughness = 0.95
                material.metalness = 0.0
                break
              case 'leather':
                material.roughness = 0.3
                material.metalness = 0.0
                break
            }
          }
        }
      })
    })
  }

  // Helper methods to identify parts by name patterns
  private isBodyPart(name: string): boolean {
    return name.includes('body') || name.includes('torso') || name.includes('main') || name === 'jacket'
  }

  private isSleevePart(name: string): boolean {
    return name.includes('sleeve') || name.includes('arm')
  }

  private isFrontPart(name: string): boolean {
    return name.includes('front') || name.includes('panel')
  }

  private isLapelPart(name: string): boolean {
    return name.includes('lapel') || name.includes('collar_lapel')
  }

  private isPocketPart(name: string): boolean {
    return name.includes('pocket')
  }

  private isButtonPart(name: string): boolean {
    return name.includes('button')
  }

  private isCollarPart(name: string): boolean {
    return name.includes('collar') && !name.includes('lapel')
  }

  private isLiningPart(name: string): boolean {
    return name.includes('lining') || name.includes('inner')
  }

  private isCuffPart(name: string): boolean {
    return name.includes('cuff')
  }

  // Get all available jacket models
  static getAvailableJacketModels(): string[] {
    return [
      '/models/jackets/basic-jacket.gltf',
      '/models/jackets/formal-jacket.gltf',
      '/models/jackets/blazer.gltf',
      // Add more jacket model paths as you create them
    ]
  }
}