"use client"

import { Suspense, useRef, useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import * as THREE from "three"
import { ModularJacketLoader, BasicJacketCustomization } from "@/lib/3d/modular-jacket-loader"

interface ModularJacketViewerProps {
  customizations?: BasicJacketCustomization
  className?: string
}

// Modular Jacket Model Component
function ModularJacketModel({
  customizations = {},
}: {
  customizations: BasicJacketCustomization
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [jacketModel, setJacketModel] = useState<THREE.Group | null>(null)
  const [loader] = useState(() => new ModularJacketLoader())
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState<string>("Starting...")

  // Load all jacket parts
  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    setLoadError(null)
    setLoadingProgress("Loading jacket parts...")

    const loadCompleteJacket = async () => {
      try {
        console.log("🚀 Starting modular jacket assembly...")
        
        const completeJacket = await loader.loadCompleteStandardJacket()
        
        if (!mounted) return

        // Clear existing model
        if (groupRef.current) {
          while (groupRef.current.children.length > 0) {
            groupRef.current.remove(groupRef.current.children[0])
          }
        }

        // Add complete jacket to scene
        if (groupRef.current) {
          groupRef.current.add(completeJacket)
        }

        setJacketModel(completeJacket)
        setIsLoading(false)
        setLoadingProgress("Complete!")
        
        console.log("🎯 Modular jacket loaded successfully!")
        
      } catch (error) {
        console.error("❌ Failed to load modular jacket:", error)
        setLoadError(error instanceof Error ? error.message : "Unknown error")
        setIsLoading(false)
      }
    }

    loadCompleteJacket()

    return () => {
      mounted = false
      // Cleanup loader resources when component unmounts
      loader.dispose()
    }
  }, [loader])

  // Apply customizations when they change
  useEffect(() => {
    if (jacketModel && Object.keys(customizations).length > 0) {
      try {
        console.log("🎨 Applying customizations to modular jacket:", customizations)
        loader.applyCustomizations(jacketModel, customizations)
      } catch (error) {
        console.error("Failed to apply customizations:", error)
      }
    }
  }, [jacketModel, customizations, loader])

  // Loading indicator
  if (isLoading) {
    return (
      <Html center>
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h3 className="font-semibold text-gray-800 mb-2">Building Your Jacket</h3>
          <p className="text-sm text-gray-600 text-center">{loadingProgress}</p>
          <div className="mt-3 text-xs text-gray-500 text-center">
            Loading 11 individual parts to create your complete jacket...
          </div>
        </div>
      </Html>
    )
  }

  // Error display
  if (loadError) {
    return (
      <Html center>
        <div className="text-red-500 text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="font-semibold mb-2">Failed to load jacket</p>
          <p className="text-sm text-gray-600 mb-4">{loadError}</p>
          <div className="text-xs text-gray-500">
            <p>Make sure all jacket parts are available:</p>
            <ul className="mt-2 text-left">
              <li>• Front parts (bottom, buttons, thread)</li>
              <li>• Lapel parts (upper, lower)</li>
              <li>• Sleeve parts (sleeve, buttons, thread)</li>
              <li>• Back vent</li>
            </ul>
          </div>
        </div>
      </Html>
    )
  }

  return <group ref={groupRef} />
}

// Main Modular Jacket Viewer Component
export function ModularJacketViewer({
  customizations = {},
  className = "",
}: ModularJacketViewerProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl, camera, scene }) => {
          gl.setClearColor(0x000000, 0)
          console.log("📷 Camera positioned at:", camera.position)
          console.log("🎬 Scene children count:", scene.children.length)
        }}
      >
        <Suspense fallback={
          <Html center>
            <div className="text-white">Preparing jacket assembly...</div>
          </Html>
        }>
          <ModularJacketModel customizations={customizations} />
          
          {/* Enhanced lighting for better jacket visualization */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-10, 5, -5]} intensity={0.6} />
          <directionalLight position={[0, -10, 0]} intensity={0.3} />
          
          {/* Environment and controls */}
          <Environment preset="studio" />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={0.5}
            maxDistance={50}
            target={[0, 0, 0]}
            autoRotate={false}
            onEnd={() => {
              console.log("🎮 Camera controls updated")
            }}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Export types
export type { BasicJacketCustomization }