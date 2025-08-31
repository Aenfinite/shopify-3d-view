"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Html, PerspectiveCamera, useHelper } from "@react-three/drei"
import { useConfigurator } from "@/context/configurator-context"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, RotateCcw, Pause, Play } from "lucide-react"
import * as THREE from "three"

export function ProductViewer() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentPrice } = useConfigurator()

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
        <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium mr-2">
          €{currentPrice.toFixed(2)}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsPaused(!isPaused)}
          className="bg-white/80 backdrop-blur-sm"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
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

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs">
        Drag to rotate • Scroll to zoom • Double-click to reset view
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 2.5]} fov={50} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <GarmentModel isPaused={isPaused} />
        <OrbitControls
          className="orbit-controls"
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          minDistance={1.5}
          maxDistance={4}
          autoRotate={false}
          enableDamping={true}
          dampingFactor={0.05}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  )
}

interface GarmentModelProps {
  isPaused: boolean
}

function GarmentModel({ isPaused }: GarmentModelProps) {
  const { selectedFabric, selectedStyles, mode } = useConfigurator()
  const [autoRotate, setAutoRotate] = useState(true)
  const groupRef = useRef<THREE.Group>(null)

  // Add lighting for better visualization
  const spotLightRef = useRef<THREE.SpotLight>(null)
  useHelper(spotLightRef, THREE.SpotLightHelper, "white")

  // Auto-rotate the model for a few seconds when it first loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setAutoRotate(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // Handle auto-rotation
  useFrame((_, delta) => {
    if (autoRotate && !isPaused && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Additional lighting for better visualization */}
      <spotLight
        ref={spotLightRef}
        position={[-5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <DetailedShirtModel fabricColor={selectedFabric?.color || "#cccccc"} styles={selectedStyles} />

      {/* Display a label for the mode */}
      <Html position={[0, -1, 0.1]}>
        <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">{mode} Mode</div>
      </Html>

      {/* Display customization indicators */}
      {Object.entries(selectedStyles).length > 0 && (
        <Html position={[0, 1.5, 0]}>
          <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg text-xs max-w-[200px]">
            <div className="font-medium mb-1">Active Customizations:</div>
            <ul className="space-y-1">
              {Object.entries(selectedStyles).map(([key, value]) => (
                <li key={key} className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-1"></span>
                  <span className="capitalize">
                    {key}: {value.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Html>
      )}
    </group>
  )
}

interface DetailedShirtModelProps {
  fabricColor: string
  styles: Record<string, any>
}

function DetailedShirtModel({ fabricColor, styles }: DetailedShirtModelProps) {
  // Create refs for all the parts of the shirt
  const bodyRef = useRef<THREE.Mesh>(null)
  const collarRef = useRef<THREE.Group>(null)
  const leftSleeveRef = useRef<THREE.Mesh>(null)
  const rightSleeveRef = useRef<THREE.Mesh>(null)
  const leftCuffRef = useRef<THREE.Mesh>(null)
  const rightCuffRef = useRef<THREE.Mesh>(null)
  const placketRef = useRef<THREE.Mesh>(null)
  const pocketRef = useRef<THREE.Mesh>(null)
  const backPleatRef = useRef<THREE.Mesh>(null)

  // Create a material for the main fabric with texture
  const [fabricMaterial, setFabricMaterial] = useState(() => {
    const material = new THREE.MeshStandardMaterial({
      color: fabricColor,
      roughness: 0.7,
      metalness: 0.1,
    })

    // Create a canvas texture for fabric pattern
    const canvas = document.createElement("canvas")
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext("2d")

    if (ctx) {
      // Fill with base color
      ctx.fillStyle = fabricColor
      ctx.fillRect(0, 0, 128, 128)

      // Add subtle fabric texture pattern
      ctx.strokeStyle = new THREE.Color(fabricColor).offsetHSL(0, 0, -0.05).getStyle()
      ctx.lineWidth = 0.5

      // Create grid pattern for fabric texture
      for (let i = 0; i < 128; i += 4) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(128, i)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, 128)
        ctx.stroke()
      }

      const texture = new THREE.CanvasTexture(canvas)
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(5, 5)

      material.map = texture
    }

    return material
  })

  // Create a material for the details (collar, cuffs, etc.)
  const [detailMaterial, setDetailMaterial] = useState(() => {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(fabricColor).offsetHSL(0, 0, 0.1),
      roughness: 0.5,
      metalness: 0.2,
    })

    return material
  })

  // Update materials when fabric color changes
  useEffect(() => {
    // Update main fabric material
    const newFabricMaterial = fabricMaterial.clone()
    newFabricMaterial.color.set(fabricColor)

    // Update the canvas texture
    const canvas = document.createElement("canvas")
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext("2d")

    if (ctx) {
      // Fill with base color
      ctx.fillStyle = fabricColor
      ctx.fillRect(0, 0, 128, 128)

      // Add subtle fabric texture pattern
      ctx.strokeStyle = new THREE.Color(fabricColor).offsetHSL(0, 0, -0.05).getStyle()
      ctx.lineWidth = 0.5

      // Create grid pattern for fabric texture
      for (let i = 0; i < 128; i += 4) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(128, i)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, 128)
        ctx.stroke()
      }

      const texture = new THREE.CanvasTexture(canvas)
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(5, 5)

      newFabricMaterial.map = texture
    }

    setFabricMaterial(newFabricMaterial)

    // Update detail material
    const newDetailMaterial = detailMaterial.clone()
    const detailColor = new THREE.Color(fabricColor).offsetHSL(0, 0, 0.1) // Slightly lighter
    newDetailMaterial.color = detailColor
    setDetailMaterial(newDetailMaterial)
  }, [fabricColor])

  // Update visibility and appearance of parts based on selected styles
  useEffect(() => {
    // Collar style
    if (collarRef.current) {
      collarRef.current.visible = !!styles.collar

      // Adjust collar shape based on style
      if (styles.collar) {
        if (styles.collar.id === "collar-spread") {
          collarRef.current.scale.set(1, 1, 1)
          collarRef.current.rotation.set(0, 0, 0)
        } else if (styles.collar.id === "collar-button-down") {
          collarRef.current.scale.set(0.8, 1, 1)
          collarRef.current.rotation.set(0.1, 0, 0)
        } else if (styles.collar.id === "collar-cutaway") {
          collarRef.current.scale.set(1.2, 1, 1)
          collarRef.current.rotation.set(0, 0, 0)
        } else if (styles.collar.id === "collar-band") {
          collarRef.current.scale.set(1, 0.5, 1)
          collarRef.current.rotation.set(0, 0, 0)
        }
      }
    }

    // Cuff style
    if (leftCuffRef.current && rightCuffRef.current) {
      const hasCuffs = !!styles.cuff
      leftCuffRef.current.visible = hasCuffs
      rightCuffRef.current.visible = hasCuffs

      // Adjust cuff shape based on style
      if (hasCuffs) {
        if (styles.cuff.id === "cuff-barrel") {
          leftCuffRef.current.scale.set(1, 1, 1)
          rightCuffRef.current.scale.set(1, 1, 1)
        } else if (styles.cuff.id === "cuff-french") {
          leftCuffRef.current.scale.set(1.2, 1.2, 1)
          rightCuffRef.current.scale.set(1.2, 1.2, 1)
        } else if (styles.cuff.id === "cuff-convertible") {
          leftCuffRef.current.scale.set(1.1, 1.1, 1)
          rightCuffRef.current.scale.set(1.1, 1.1, 1)
        }
      }
    }

    // Placket style
    if (placketRef.current) {
      placketRef.current.visible = !!styles.placket

      // Adjust placket shape based on style
      if (styles.placket) {
        if (styles.placket.id === "placket-standard") {
          placketRef.current.scale.set(1, 1, 1)
        } else if (styles.placket.id === "placket-hidden") {
          placketRef.current.scale.set(0.8, 1, 0.5)
        } else if (styles.placket.id === "placket-tuxedo") {
          placketRef.current.scale.set(1.2, 1, 1)
        }
      }
    }

    // Pocket style
    if (pocketRef.current) {
      pocketRef.current.visible = styles.pocket && styles.pocket.id !== "pocket-none"

      // Adjust pocket based on style
      if (styles.pocket) {
        if (styles.pocket.id === "pocket-single") {
          pocketRef.current.position.set(0.3, 0.4, 0.06)
          pocketRef.current.scale.set(1, 1, 1)
        } else if (styles.pocket.id === "pocket-dual") {
          // For dual pockets, we'll just move the single pocket to the center
          // In a real implementation, you'd have two separate pocket meshes
          pocketRef.current.position.set(0, 0.4, 0.06)
          pocketRef.current.scale.set(1.5, 1, 1)
        }
      }
    }

    // Back style
    if (backPleatRef.current) {
      backPleatRef.current.visible = styles.back && styles.back.id !== "back-plain"

      // Adjust back pleat based on style
      if (styles.back) {
        if (styles.back.id === "back-center-pleat") {
          backPleatRef.current.position.set(0, 0, -0.06)
          backPleatRef.current.scale.set(0.2, 1, 1)
        } else if (styles.back.id === "back-side-pleats") {
          backPleatRef.current.position.set(0, 0, -0.06)
          backPleatRef.current.scale.set(0.6, 1, 1)
        }
      }
    }
  }, [styles])

  return (
    <group>
      {/* Shirt body */}
      <mesh ref={bodyRef} receiveShadow castShadow>
        <boxGeometry args={[1, 1.5, 0.1]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>

      {/* Collar */}
      <group ref={collarRef} position={[0, 0.8, 0]}>
        <mesh position={[0, 0, 0.06]} receiveShadow castShadow>
          <boxGeometry args={[0.8, 0.1, 0.05]} />
          <primitive object={detailMaterial} attach="material" />
        </mesh>

        {/* Left collar point */}
        <mesh position={[-0.35, -0.05, 0.06]} rotation={[0, 0, Math.PI / 6]} receiveShadow castShadow>
          <boxGeometry args={[0.3, 0.08, 0.05]} />
          <primitive object={detailMaterial} attach="material" />
        </mesh>

        {/* Right collar point */}
        <mesh position={[0.35, -0.05, 0.06]} rotation={[0, 0, -Math.PI / 6]} receiveShadow castShadow>
          <boxGeometry args={[0.3, 0.08, 0.05]} />
          <primitive object={detailMaterial} attach="material" />
        </mesh>
      </group>

      {/* Sleeves */}
      <mesh ref={leftSleeveRef} position={[-0.6, 0.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 0.8, 0.1]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>
      <mesh ref={rightSleeveRef} position={[0.6, 0.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 0.8, 0.1]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>

      {/* Cuffs */}
      <mesh ref={leftCuffRef} position={[-0.6, -0.2, 0.06]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 0.1, 0.05]} />
        <primitive object={detailMaterial} attach="material" />
      </mesh>
      <mesh ref={rightCuffRef} position={[0.6, -0.2, 0.06]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 0.1, 0.05]} />
        <primitive object={detailMaterial} attach="material" />
      </mesh>

      {/* Placket */}
      <mesh ref={placketRef} position={[0, 0.3, 0.06]} receiveShadow castShadow>
        <boxGeometry args={[0.1, 1, 0.05]} />
        <primitive object={detailMaterial} attach="material" />
      </mesh>

      {/* Pocket */}
      <mesh ref={pocketRef} position={[0.3, 0.4, 0.06]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 0.2, 0.05]} />
        <primitive object={detailMaterial} attach="material" />
      </mesh>

      {/* Back pleat */}
      <mesh ref={backPleatRef} position={[0, 0, -0.06]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 1, 0.05]} />
        <primitive object={detailMaterial} attach="material" />
      </mesh>

      {/* Buttons (always visible) */}
      <ButtonRow position={[0, 0.3, 0.06]} count={5} spacing={0.2} />

      {/* Cuff buttons */}
      {styles.cuff && (
        <>
          <ButtonRow position={[-0.6, -0.2, 0.11]} count={1} spacing={0} />
          <ButtonRow position={[0.6, -0.2, 0.11]} count={1} spacing={0} />
        </>
      )}

      {/* Monogram */}
      {styles.monogram && styles.monogram.id !== "monogram-none" && (
        <Monogram position={getMonogramPosition(styles.monogram.id)} text="ABC" />
      )}
    </group>
  )
}

function getMonogramPosition(monogramId: string): [number, number, number] {
  switch (monogramId) {
    case "monogram-cuff":
      return [-0.6, -0.2, 0.11]
    case "monogram-chest":
      return [0.3, 0.4, 0.11]
    case "monogram-tail":
      return [0, -0.7, 0.06]
    default:
      return [0, 0, 0]
  }
}

interface ButtonRowProps {
  position: [number, number, number]
  count: number
  spacing: number
}

function ButtonRow({ position, count, spacing }: ButtonRowProps) {
  const buttons = []
  const [x, y, z] = position
  const startY = y + (spacing * (count - 1)) / 2

  for (let i = 0; i < count; i++) {
    buttons.push(
      <mesh key={i} position={[x, startY - i * spacing, z + 0.01]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 12]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} metalness={0.2} />
      </mesh>,
    )
  }

  return <>{buttons}</>
}

interface MonogramProps {
  position: [number, number, number]
  text: string
}

function Monogram({ position, text }: MonogramProps) {
  return (
    <Html position={position} transform occlude>
      <div className="text-[8px] font-serif italic text-gray-700">{text}</div>
    </Html>
  )
}
