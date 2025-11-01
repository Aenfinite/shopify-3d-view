"use client"

import { Suspense, useRef, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Html, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { JacketModelLoader, JacketParts, JacketCustomization } from "@/lib/3d/jacket-model-loader"

interface GLTFModelViewerProps {
  modelPath: string
  customizations?: JacketCustomization
  className?: string
  fallbackToGeometry?: boolean
}

// GLTF Jacket Model Component
function GLTFJacketModel({
  modelPath,
  customizations = {},
}: {
  modelPath: string
  customizations: JacketCustomization
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [jacketParts, setJacketParts] = useState<JacketParts | null>(null)
  const [modelLoader] = useState(() => new JacketModelLoader())
  const [loadError, setLoadError] = useState<string | null>(null)

  // Load and setup the GLTF model
  useEffect(() => {
    let mounted = true

    const loadModel = async () => {
      try {
        setLoadError(null)
        const model = await modelLoader.loadJacketModel(modelPath)
        
        if (!mounted) return

        // Clear existing model
        if (groupRef.current) {
          while (groupRef.current.children.length > 0) {
            groupRef.current.remove(groupRef.current.children[0])
          }
        }

        // Extract jacket parts for customization
        const parts = modelLoader.extractJacketParts(model)
        setJacketParts(parts)

        // Add model to scene
        if (groupRef.current) {
          groupRef.current.add(model)
        }

        console.log("Jacket model loaded successfully:", parts)
      } catch (error) {
        console.error("Failed to load jacket model:", error)
        setLoadError(error instanceof Error ? error.message : "Unknown error")
      }
    }

    loadModel()

    return () => {
      mounted = false
    }
  }, [modelPath, modelLoader])

  // Apply customizations when they change
  useEffect(() => {
    if (jacketParts && Object.keys(customizations).length > 0) {
      try {
        modelLoader.applyJacketCustomizations(jacketParts, customizations)
        console.log("Applied customizations:", customizations)
      } catch (error) {
        console.error("Failed to apply customizations:", error)
      }
    }
  }, [jacketParts, customizations, modelLoader])

  // Animation frame for any dynamic updates
  useFrame((state) => {
    if (groupRef.current) {
      // Optional: Add subtle rotation or animation
      // groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  if (loadError) {
    return (
      <Html center>
        <div className="text-red-500 text-center p-4 bg-white rounded shadow">
          <p>Failed to load jacket model</p>
          <p className="text-sm">{loadError}</p>
        </div>
      </Html>
    )
  }

  return <group ref={groupRef} />
}

// Fallback Geometric Jacket (same as before for backup)
function FallbackJacketModel({
  customizations = {},
}: {
  customizations: JacketCustomization
}) {
  const meshRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!meshRef.current) return

    // Clear existing children
    while (meshRef.current.children.length > 0) {
      meshRef.current.remove(meshRef.current.children[0])
    }

    const mainColor = customizations.fabricColor || "#000080"

    // Main body
    const bodyGeometry = new THREE.BoxGeometry(2.2, 2.8, 0.4)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: customizations.fabricType === "velvet" ? 0.9 : 0.6,
      metalness: 0.1,
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    meshRef.current.add(body)

    // Sleeves
    const sleeveGeometry = new THREE.CylinderGeometry(0.35, 0.3, 1.8, 8)
    const sleeveMaterial = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.6,
    })

    const leftSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial)
    leftSleeve.position.set(-1.4, 0.5, 0)
    leftSleeve.rotation.z = Math.PI / 2
    meshRef.current.add(leftSleeve)

    const rightSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial)
    rightSleeve.position.set(1.4, 0.5, 0)
    rightSleeve.rotation.z = -Math.PI / 2
    meshRef.current.add(rightSleeve)

    // Lapels based on style
    const lapelColor = customizations.liningColor || mainColor
    const lapelMaterial = new THREE.MeshStandardMaterial({
      color: lapelColor,
      roughness: 0.5,
    })

    if (customizations.lapelStyle === "notched" || !customizations.lapelStyle) {
      const lapelGeometry = new THREE.BoxGeometry(0.6, 1.0, 0.1)
      
      const leftLapel = new THREE.Mesh(lapelGeometry, lapelMaterial)
      leftLapel.position.set(-0.8, 0.8, 0.25)
      leftLapel.rotation.z = 0.3
      meshRef.current.add(leftLapel)

      const rightLapel = new THREE.Mesh(lapelGeometry, lapelMaterial)
      rightLapel.position.set(0.8, 0.8, 0.25)
      rightLapel.rotation.z = -0.3
      meshRef.current.add(rightLapel)
    }

    // Add buttons based on front style
    const buttonGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8)
    const buttonMaterial = new THREE.MeshStandardMaterial({
      color: "#333333",
      metalness: 0.3,
      roughness: 0.7,
    })

    const buttonCount = customizations.frontStyle === "double-breasted" ? 6 : 3
    for (let i = 0; i < buttonCount; i++) {
      const button = new THREE.Mesh(buttonGeometry, buttonMaterial)
      if (customizations.frontStyle === "double-breasted") {
        button.position.set(i % 2 === 0 ? -0.3 : 0.3, 0.8 - (Math.floor(i / 2) * 0.4), 0.21)
      } else {
        button.position.set(0, 0.8 - (i * 0.4), 0.21)
      }
      meshRef.current.add(button)
    }
  }, [customizations])

  return <group ref={meshRef} />
}

// Loading component
function ModelLoader() {
  return (
    <Html center>
      <div className="flex items-center justify-center p-4 bg-white rounded shadow">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span>Loading jacket model...</span>
      </div>
    </Html>
  )
}

// Main GLTF Model Viewer Component
export function GLTFModelViewer({
  modelPath,
  customizations = {},
  className = "",
  fallbackToGeometry = true,
}: GLTFModelViewerProps) {
  const [useGLTF, setUseGLTF] = useState(true)

  // Function to handle GLTF loading errors and fallback to geometry
  const handleGLTFError = () => {
    if (fallbackToGeometry) {
      console.log("Falling back to geometric model")
      setUseGLTF(false)
    }
  }

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
        <Suspense fallback={<ModelLoader />}>
          {useGLTF ? (
            <GLTFJacketModel
              modelPath={modelPath}
              customizations={customizations}
            />
          ) : (
            <FallbackJacketModel customizations={customizations} />
          )}
          
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

// Export types for other components to use
export type { JacketCustomization, JacketParts }