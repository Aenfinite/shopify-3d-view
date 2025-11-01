"use client"

import { Suspense, useRef, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { 
  findStandardJacketParts, 
  applyStandardCustomizations,
  StandardJacketParts,
  BasicJacketCustomization 
} from "@/lib/3d/standard-jacket-loader"

interface StandardJacketViewerProps {
  modelPath: string
  customizations?: BasicJacketCustomization
  className?: string
}

// Standard Jacket Model Component
function StandardJacketModel({
  modelPath,
  customizations = {},
}: {
  modelPath: string
  customizations: BasicJacketCustomization
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [jacketParts, setJacketParts] = useState<StandardJacketParts | null>(null)
  const [loader] = useState(() => new GLTFLoader())
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load the GLTF model
  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    setLoadError(null)

    const loadModel = async () => {
      try {
        console.log("Loading standard jacket model:", modelPath)
        
        loader.load(
          modelPath,
          (gltf) => {
            if (!mounted) return

            console.log("Model loaded successfully:", gltf)
            
            // Clear existing model
            if (groupRef.current) {
              while (groupRef.current.children.length > 0) {
                groupRef.current.remove(groupRef.current.children[0])
              }
            }

            // Find jacket parts
            const parts = findStandardJacketParts(gltf.scene)
            setJacketParts(parts)

            // Add model to scene
            if (groupRef.current) {
              groupRef.current.add(gltf.scene)
            }

            setIsLoading(false)
            console.log("Standard jacket model ready for customization")
          },
          (progress) => {
            console.log(`Loading progress: ${(progress.loaded / progress.total * 100)}%`)
          },
          (error) => {
            console.error("Failed to load jacket model:", error)
            setLoadError(error instanceof Error ? error.message : "Unknown error")
            setIsLoading(false)
          }
        )
      } catch (error) {
        console.error("Error in loadModel:", error)
        setLoadError(error instanceof Error ? error.message : "Unknown error")
        setIsLoading(false)
      }
    }

    loadModel()

    return () => {
      mounted = false
    }
  }, [modelPath, loader])

  // Apply customizations when they change
  useEffect(() => {
    if (jacketParts && Object.keys(customizations).length > 0) {
      try {
        console.log("Applying customizations to standard jacket:", customizations)
        applyStandardCustomizations(jacketParts, customizations)
      } catch (error) {
        console.error("Failed to apply customizations:", error)
      }
    }
  }, [jacketParts, customizations])

  // Loading indicator
  if (isLoading) {
    return (
      <Html center>
        <div className="flex items-center justify-center p-4 bg-white rounded shadow">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span>Loading jacket model...</span>
        </div>
      </Html>
    )
  }

  // Error display
  if (loadError) {
    return (
      <Html center>
        <div className="text-red-500 text-center p-4 bg-white rounded shadow max-w-md">
          <p className="font-semibold">Failed to load jacket model</p>
          <p className="text-sm mt-2">{loadError}</p>
          <p className="text-xs mt-2 text-gray-500">
            Make sure your GLTF file is placed at: {modelPath}
          </p>
        </div>
      </Html>
    )
  }

  return <group ref={groupRef} />
}

// Main Standard Jacket Viewer Component
export function StandardJacketViewer({
  modelPath,
  customizations = {},
  className = "",
}: StandardJacketViewerProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <Suspense fallback={
          <Html center>
            <div className="text-white">Loading...</div>
          </Html>
        }>
          <StandardJacketModel
            modelPath={modelPath}
            customizations={customizations}
          />
          
          {/* Lighting setup */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          
          {/* Environment and controls */}
          <Environment preset="studio" />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Export types
export type { BasicJacketCustomization }