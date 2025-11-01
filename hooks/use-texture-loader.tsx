"use client"

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function useTextureLoader(path: string) {
  const { gl } = useThree()
  
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader()
    textureLoader.setPath(path)
  }, [path])

  const loadTexture = async (url: string) => {
    return new Promise<THREE.Texture>((resolve, reject) => {
      const textureLoader = new THREE.TextureLoader()
      textureLoader.setPath(path)
      
      textureLoader.load(
        url,
        (texture) => {
          // Configure texture
          texture.colorSpace = THREE.SRGBColorSpace
          texture.flipY = false 
          texture.generateMipmaps = true
          texture.minFilter = THREE.LinearMipmapLinearFilter
          texture.magFilter = THREE.LinearFilter
          texture.needsUpdate = true
          
          resolve(texture)
        },
        undefined,
        (error) => reject(error)
      )
    })
  }

  return { loadTexture }
}