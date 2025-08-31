"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, useGLTF, useTexture, Html, PerspectiveCamera } from "@react-three/drei"
import { useConfigurator } from "@/context/configurator-context"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, RotateCcw } from "lucide-react"

export function ProductViewer() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button variant="outline" size="icon" onClick={toggleFullscreen} className="bg-white/80 backdrop-blur-sm">
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/80 backdrop-blur-sm"
          onClick={() => {
            // Reset camera position
            const controls = document.querySelector(".orbit-controls") as any
            if (controls) {
              controls.reset()
            }
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 2.5]} fov={50} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <GarmentModel />
        <OrbitControls
          className="orbit-controls"
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          minDistance={1.5}
          maxDistance={4}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  )
}

function GarmentModel() {
  const { selectedFabric, selectedStyles, mode } = useConfigurator()

  // This would be replaced with your actual 3D model
  // For now we'll use a placeholder shirt model
  const { scene } = useGLTF("/placeholder.svg?height=500&width=500")

  // Load fabric texture if selected
  const defaultTextureUrl = "/placeholder.svg?height=200&width=200"
  const textureUrl = selectedFabric?.textureUrl || defaultTextureUrl
  const fabricTexture = useTexture(textureUrl)

  // Apply textures and style changes to the model
  useEffect(() => {
    if (!scene) return

    // Apply fabric texture
    if (fabricTexture) {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.material.map = fabricTexture
          child.material.needsUpdate = true
        }
      })
    }

    // Apply style changes
    // This would involve showing/hiding or swapping different parts of the model
    // based on the selected styles
  }, [scene, fabricTexture, selectedStyles])

  // Placeholder for actual 3D model
  return (
    <group position={[0, -1, 0]}>
      {/* This would be your actual 3D model */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[1, 1.5, 0.1]} />
        <meshStandardMaterial color={selectedFabric?.color || "#cccccc"} map={fabricTexture || undefined} />
      </mesh>

      {/* Placeholder for style elements */}
      {selectedStyles.collar && (
        <mesh position={[0, 0.8, 0.06]} receiveShadow castShadow>
          <boxGeometry args={[0.8, 0.1, 0.05]} />
          <meshStandardMaterial color="#aaaaaa" />
        </mesh>
      )}

      {selectedStyles.cuff && (
        <>
          <mesh position={[-0.6, 0, 0.06]} receiveShadow castShadow>
            <boxGeometry args={[0.1, 0.2, 0.05]} />
            <meshStandardMaterial color="#aaaaaa" />
          </mesh>
          <mesh position={[0.6, 0, 0.06]} receiveShadow castShadow>
            <boxGeometry args={[0.1, 0.2, 0.05]} />
            <meshStandardMaterial color="#aaaaaa" />
          </mesh>
        </>
      )}

      {/* Display a label for the mode */}
      <Html position={[0, -1, 0.1]}>
        <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">{mode} Mode</div>
      </Html>
    </group>
  )
}
