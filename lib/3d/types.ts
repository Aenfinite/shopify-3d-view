import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import type { Object3D, Material } from 'three'

export interface GLTFResult extends GLTF {
  nodes: { [key: string]: Object3D }
  materials: { [key: string]: Material }
}