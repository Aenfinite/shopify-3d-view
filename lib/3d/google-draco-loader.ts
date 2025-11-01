/**
 * Google DRACO Loader
 * 
 * Custom implementation using Google's official Draco library
 * instead of three.js examples DRACOLoader
 */

import * as THREE from "three"

declare global {
  interface Window {
    DracoDecoderModule: any
  }
}

export class GoogleDRACOLoader {
  private dracoDecoderModule: any = null
  private decoderPath = '/draco/'
  private workerPath = ''
  private workerLimit = 4
  private workerNextTaskID = 1
  private workerSourceURL = ''
  private workers: any[] = []
  private availableWorkers: any[] = []
  private pendingTasks: any = {}

  constructor() {
    console.log("🔧 Initializing Google DRACO Loader")
  }

  setDecoderPath(path: string): GoogleDRACOLoader {
    this.decoderPath = path
    return this
  }

  setWorkerLimit(workerLimit: number): GoogleDRACOLoader {
    this.workerLimit = workerLimit
    return this
  }

  async preload(): Promise<GoogleDRACOLoader> {
    console.log("🔄 Preloading Google DRACO decoder...")
    
    try {
      // Load DRACO decoder script
      await this.loadScript(this.decoderPath + 'draco_decoder.js')
      
      // Initialize DRACO module
      if (typeof window !== 'undefined' && window.DracoDecoderModule) {
        this.dracoDecoderModule = await window.DracoDecoderModule()
        console.log("✅ Google DRACO decoder loaded successfully")
      } else {
        throw new Error("DRACO decoder module not found")
      }
    } catch (error) {
      console.error("❌ Failed to load DRACO decoder:", error)
      throw error
    }

    return this
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        // Server-side - skip loading
        resolve()
        return
      }

      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = url
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`))
      document.head.appendChild(script)
    })
  }

  decode(buffer: ArrayBuffer): Promise<THREE.BufferGeometry> {
    return new Promise((resolve, reject) => {
      if (!this.dracoDecoderModule) {
        reject(new Error("DRACO decoder not initialized. Call preload() first."))
        return
      }

      try {
        const decoder = new this.dracoDecoderModule.Decoder()
        const dracoGeometry = new this.dracoDecoderModule.Mesh()
        
        // Decode the geometry
        const status = decoder.DecodeBufferToMesh(new Uint8Array(buffer), dracoGeometry)
        
        if (!status.ok() || !dracoGeometry.ptr) {
          reject(new Error("Failed to decode DRACO geometry"))
          return
        }

        // Convert to THREE.js BufferGeometry
        const geometry = this.convertDracoGeometryToThree(decoder, dracoGeometry)
        
        // Cleanup
        this.dracoDecoderModule.destroy(dracoGeometry)
        this.dracoDecoderModule.destroy(decoder)
        
        resolve(geometry)
      } catch (error) {
        reject(error)
      }
    })
  }

  private convertDracoGeometryToThree(decoder: any, dracoGeometry: any): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry()
    
    // Get vertex positions
    const positionAttribute = decoder.GetAttributeByUniqueId(dracoGeometry, 0) // POSITION
    if (positionAttribute.ptr) {
      const positions = this.getAttributeArray(decoder, dracoGeometry, positionAttribute)
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    }

    // Get normals if available
    const normalAttribute = decoder.GetAttributeByUniqueId(dracoGeometry, 1) // NORMAL
    if (normalAttribute.ptr) {
      const normals = this.getAttributeArray(decoder, dracoGeometry, normalAttribute)
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    }

    // Get UVs if available
    const uvAttribute = decoder.GetAttributeByUniqueId(dracoGeometry, 2) // UV
    if (uvAttribute.ptr) {
      const uvs = this.getAttributeArray(decoder, dracoGeometry, uvAttribute)
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    }

    // Get indices
    const numFaces = dracoGeometry.num_faces()
    if (numFaces > 0) {
      const indices = new Uint32Array(numFaces * 3)
      const indexArray = new this.dracoDecoderModule.DracoInt32Array()
      
      for (let i = 0; i < numFaces; i++) {
        decoder.GetFaceFromMesh(dracoGeometry, i, indexArray)
        indices[i * 3] = indexArray.GetValue(0)
        indices[i * 3 + 1] = indexArray.GetValue(1)
        indices[i * 3 + 2] = indexArray.GetValue(2)
      }
      
      geometry.setIndex(new THREE.BufferAttribute(indices, 1))
      this.dracoDecoderModule.destroy(indexArray)
    }

    return geometry
  }

  private getAttributeArray(decoder: any, dracoGeometry: any, attribute: any): Float32Array {
    const numPoints = dracoGeometry.num_points()
    const numComponents = attribute.num_components()
    const attributeData = new this.dracoDecoderModule.DracoFloat32Array()
    
    decoder.GetAttributeFloatForAllPoints(dracoGeometry, attribute, attributeData)
    
    const array = new Float32Array(numPoints * numComponents)
    for (let i = 0; i < array.length; i++) {
      array[i] = attributeData.GetValue(i)
    }
    
    this.dracoDecoderModule.destroy(attributeData)
    return array
  }

  dispose(): void {
    if (this.dracoDecoderModule) {
      // Cleanup if needed
      this.dracoDecoderModule = null
    }
    console.log("🗑️ Google DRACO Loader disposed")
  }
}