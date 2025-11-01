"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, RotateCcw } from "lucide-react"
import { JacketModel } from "./configurator/jacket-model"

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
        <JacketModel />
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
