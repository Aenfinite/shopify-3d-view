"use client"

import React, { Suspense, useEffect, useState, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { applyFabricCustomization } from "@/lib/3d/customization-utils"
import { pantsConfigs, pantsFrontPocketConfigs, pantsBackPocketConfigs, pantsCuffConfigs, pantsWaistbandConfigs } from "@/lib/3d/pants-configs"

// ⚙️ PANTS BASE COLOR CONTROL
// Change this hex value to adjust the darkness/grayness of pants fabric
// Examples: 0x4a4a4a (lighter), 0x3a3a3a (medium), 0x2a2a2a (darker), 0x1a1a1a (very dark)
const PANTS_BASE_COLOR = 0x6a6a6a

export interface BasicPantsCustomization {
  fabricColor?: string
  fabricType?: string
  frontStyle?: string
  frontPocket?: string
  backPocket?: string
  bottomCuffs?: string
  waistbandExtension?: string
  buttonColor?: string
}

interface ModularPantsViewerProps {
  customizations?: BasicPantsCustomization
  frontStyle?: string
  className?: string
  cameraRotationY?: number
  cameraTargetY?: number // Vertical position of what camera looks at
}

// Loading indicator
function LoadingOverlay({ message = "Loading Pants Model..." }: { message?: string }) {
  return (
    <Html fullscreen>
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl flex flex-col items-center space-y-4 border-2 border-primary/20">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-xl font-semibold text-gray-800">{message}</p>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    </Html>
  )
}

// Pants Model Component
function PantsModel({
  customizations = {},
}: {
  customizations: BasicPantsCustomization
}) {
  const [pantsStyle, setPantsStyle] = useState<THREE.Group | null>(null)
  const [beltLoops, setBeltLoops] = useState<THREE.Group | null>(null)
  const [waistband, setWaistband] = useState<THREE.Group | null>(null)
  const [frontPocket, setFrontPocket] = useState<THREE.Group | null>(null)
  const [backPockets, setBackPockets] = useState<THREE.Group[]>([])
  const [bottomCuff, setBottomCuff] = useState<THREE.Group | null>(null)
  const [waistbandExtensions, setWaistbandExtensions] = useState<THREE.Group[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loader = useMemo(() => {
    const gltfLoader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    gltfLoader.setDRACOLoader(dracoLoader)
    return gltfLoader
  }, [])

  // Load main pants components
  useEffect(() => {
    setIsLoading(true)

    // Get front style from customizations, default to flat-front
    const frontStyle = customizations.frontStyle || 'flat-front'
    const pantsConfig = pantsConfigs[frontStyle] || pantsConfigs['flat-front']

    const stylePath = pantsConfig.priority.style
    const beltLoopsPath = pantsConfig.priority.beltLoops
    const waistbandPath = pantsConfig.priority.waistband

    Promise.all([
      new Promise<THREE.Group>((resolve, reject) => {
        loader.load(stylePath, (gltf) => {
          const scene = gltf.scene.clone()
          // Apply fabric color with jacket-like material properties
          scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              // First ensure proper material setup
              const material = child.material as THREE.MeshStandardMaterial
              if (material.isMeshStandardMaterial) {
                // Set base color to darker gray like jackets
                material.color.setHex(PANTS_BASE_COLOR)
                material.roughness = 0.85
                material.metalness = 0.0
                material.envMapIntensity = 0.2
                material.needsUpdate = true
              }
              
              // Then apply custom fabric color/texture
              if (customizations.fabricColor) {
                applyFabricCustomization(child, customizations.fabricColor!, PANTS_BASE_COLOR)
              }
            }
          })
          resolve(scene)
        }, undefined, reject)
      }),
      new Promise<THREE.Group>((resolve, reject) => {
        loader.load(beltLoopsPath, (gltf) => {
          const scene = gltf.scene.clone()
          // Apply fabric color to belt loops with jacket-like material properties
          scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              // First ensure proper material setup
              const material = child.material as THREE.MeshStandardMaterial
              if (material.isMeshStandardMaterial) {
                // Set base color to darker gray like jackets
                material.color.setHex(PANTS_BASE_COLOR)
                material.roughness = 0.85
                material.metalness = 0.0
                material.envMapIntensity = 0.2
                material.needsUpdate = true
              }
              
              // Then apply custom fabric color/texture
              if (customizations.fabricColor) {
                applyFabricCustomization(child, customizations.fabricColor!, PANTS_BASE_COLOR)
              }
            }
          })
          resolve(scene)
        }, undefined, reject)
      }),
      new Promise<THREE.Group>((resolve, reject) => {
        loader.load(waistbandPath, (gltf) => {
          const scene = gltf.scene.clone()
          // Apply fabric color to waistband with jacket-like material properties
          scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              // First ensure proper material setup
              const material = child.material as THREE.MeshStandardMaterial
              if (material.isMeshStandardMaterial) {
                // Set base color to darker gray like jackets
                material.color.setHex(PANTS_BASE_COLOR)
                material.roughness = 0.85
                material.metalness = 0.0
                material.envMapIntensity = 0.2
                material.needsUpdate = true
              }
              
              // Then apply custom fabric color/texture
              if (customizations.fabricColor) {
                applyFabricCustomization(child, customizations.fabricColor!, PANTS_BASE_COLOR)
              }
            }
          })
          resolve(scene)
        }, undefined, reject)
      })
    ])
      .then(([style, loops, waist]) => {
        setPantsStyle(style)
        setBeltLoops(loops)
        setWaistband(waist)
        setIsLoading(false)
        console.log("✅ Pants models loaded successfully")
      })
      .catch((error) => {
        console.error("❌ Error loading pants models:", error)
        setIsLoading(false)
      })
  }, [customizations.fabricColor, customizations.frontStyle, loader])

  // Load front pocket
  useEffect(() => {
    const frontPocketStyle = customizations.frontPocket
    
    if (!frontPocketStyle || !pantsFrontPocketConfigs[frontPocketStyle]) {
      setFrontPocket(null)
      return
    }

    const pocketPath = pantsFrontPocketConfigs[frontPocketStyle]
    
    loader.load(
      pocketPath,
      (gltf) => {
        const scene = gltf.scene.clone()
        // Apply fabric color to front pocket
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const material = child.material as THREE.MeshStandardMaterial
            if (material.isMeshStandardMaterial) {
              material.color.setHex(PANTS_BASE_COLOR)
              material.roughness = 0.85
              material.metalness = 0.0
              material.envMapIntensity = 0.2
              material.needsUpdate = true
            }
            
            if (customizations.fabricColor) {
              applyFabricCustomization(child, customizations.fabricColor!, PANTS_BASE_COLOR)
            }
          }
        })
        setFrontPocket(scene)
        console.log(`✅ Front pocket loaded: ${frontPocketStyle}`)
      },
      undefined,
      (error) => {
        console.error(`❌ Error loading front pocket ${frontPocketStyle}:`, error)
        setFrontPocket(null)
      }
    )
  }, [customizations.frontPocket, customizations.fabricColor, loader])

  // Load back pocket(s)
  useEffect(() => {
    const backPocketStyle = customizations.backPocket
    
    if (!backPocketStyle || !pantsBackPocketConfigs[backPocketStyle]) {
      setBackPockets([])
      return
    }

    const pocketPaths = pantsBackPocketConfigs[backPocketStyle]
    
    Promise.all(
      pocketPaths.map(pocketPath => 
        new Promise<THREE.Group>((resolve, reject) => {
          loader.load(
            pocketPath,
            (gltf) => {
              const scene = gltf.scene.clone()
              // Apply fabric color to back pocket
              scene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                  const material = child.material as THREE.MeshStandardMaterial
                  if (material.isMeshStandardMaterial) {
                    material.color.setHex(PANTS_BASE_COLOR)
                    material.roughness = 0.85
                    material.metalness = 0.0
                    material.envMapIntensity = 0.2
                    material.needsUpdate = true
                  }
                  
                  if (customizations.fabricColor) {
                    applyFabricCustomization(child, customizations.fabricColor!, PANTS_BASE_COLOR)
                  }
                }
              })
              resolve(scene)
            },
            undefined,
            reject
          )
        })
      )
    )
      .then((scenes) => {
        setBackPockets(scenes)
        console.log(`✅ Back pockets loaded: ${backPocketStyle} (${scenes.length} files)`)
      })
      .catch((error) => {
        console.error(`❌ Error loading back pockets ${backPocketStyle}:`, error)
        setBackPockets([])
      })
  }, [customizations.backPocket, customizations.fabricColor, loader])

  // Load bottom cuff
  useEffect(() => {
    const cuffStyle = customizations.bottomCuffs
    
    if (!cuffStyle || !pantsCuffConfigs[cuffStyle]) {
      setBottomCuff(null)
      return
    }

    const cuffPath = pantsCuffConfigs[cuffStyle]
    
    // If cuffPath is null (turn-ups), don't load anything
    if (!cuffPath) {
      setBottomCuff(null)
      return
    }
    
    loader.load(
      cuffPath,
      (gltf) => {
        const scene = gltf.scene.clone()
        // Apply fabric color to bottom cuff
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const material = child.material as THREE.MeshStandardMaterial
            if (material.isMeshStandardMaterial) {
              material.color.setHex(PANTS_BASE_COLOR)
              material.roughness = 0.85
              material.metalness = 0.0
              material.envMapIntensity = 0.2
              material.needsUpdate = true
            }
            
            if (customizations.fabricColor) {
              applyFabricCustomization(child, customizations.fabricColor!, PANTS_BASE_COLOR)
            }
          }
        })
        setBottomCuff(scene)
        console.log(`✅ Bottom cuff loaded: ${cuffStyle}`)
      },
      undefined,
      (error) => {
        console.error(`❌ Error loading bottom cuff ${cuffStyle}:`, error)
        setBottomCuff(null)
      }
    )
  }, [customizations.bottomCuffs, customizations.fabricColor, loader])

  // Load waistband extension
  useEffect(() => {
    const extensionStyle = customizations.waistbandExtension
    
    if (!extensionStyle || !pantsWaistbandConfigs[extensionStyle]) {
      setWaistbandExtensions([])
      return
    }

    const extensionPaths = pantsWaistbandConfigs[extensionStyle]
    
    // Skip loading if it's just the normal waistband (already loaded in main components)
    if (extensionStyle === 'no-extension') {
      setWaistbandExtensions([])
      return
    }
    
    Promise.all(
      extensionPaths.map(extensionPath => 
        new Promise<THREE.Group>((resolve, reject) => {
          loader.load(
            extensionPath,
            (gltf) => {
              const scene = gltf.scene.clone()
              // Apply fabric color to waistband extension
              scene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                  const material = child.material as THREE.MeshStandardMaterial
                  if (material.isMeshStandardMaterial) {
                    material.color.setHex(PANTS_BASE_COLOR)
                    material.roughness = 0.85
                    material.metalness = 0.0
                    material.envMapIntensity = 0.2
                    material.needsUpdate = true
                  }
                  
                  if (customizations.fabricColor) {
                    applyFabricCustomization(child, customizations.fabricColor!, PANTS_BASE_COLOR)
                  }
                }
              })
              resolve(scene)
            },
            undefined,
            reject
          )
        })
      )
    )
      .then((scenes) => {
        setWaistbandExtensions(scenes)
        console.log(`✅ Waistband extensions loaded: ${extensionStyle} (${scenes.length} files)`)
      })
      .catch((error) => {
        console.error(`❌ Error loading waistband extensions ${extensionStyle}:`, error)
        setWaistbandExtensions([])
      })
  }, [customizations.waistbandExtension, customizations.fabricColor, loader])

  if (isLoading || !pantsStyle || !beltLoops || !waistband) {
    return <LoadingOverlay />
  }

  return (
    <group position={[0, 0, 0]}>
      <primitive object={pantsStyle} position={[0, 0, 0]} />
      <primitive object={beltLoops} position={[0, 0, 0]} />
      <primitive object={waistband} position={[0, 0, 0]} />
      {frontPocket && <primitive object={frontPocket} position={[0, 0, 0]} />}
      {backPockets.map((pocket, index) => (
        <primitive key={`back-pocket-${index}`} object={pocket} position={[0, 0, 0]} />
      ))}
      {bottomCuff && <primitive object={bottomCuff} position={[0, 0, 0]} />}
      {waistbandExtensions.map((extension, index) => (
        <primitive key={`waistband-ext-${index}`} object={extension} position={[0, 0, 0]} />
      ))}
    </group>
  )
}

// Smooth camera orbit rotation using OrbitControls
function OrbitCameraController({ 
  targetAzimuth = 0, 
  targetY = 0,
  controlsRef 
}: { 
  targetAzimuth: number
  targetY: number
  controlsRef: React.MutableRefObject<any>
}) {
  const { camera } = useThree()
  const isUserInteracting = React.useRef(false)
  const userInteractionTimeout = React.useRef<NodeJS.Timeout | null>(null)
  
  // Detect user interaction with controls
  React.useEffect(() => {
    if (!controlsRef.current) return
    
    const controls = controlsRef.current
    
    const onStart = () => {
      isUserInteracting.current = true
      if (userInteractionTimeout.current) {
        clearTimeout(userInteractionTimeout.current)
      }
    }
    
    const onEnd = () => {
      // Keep user interaction flag for a short time after they stop
      if (userInteractionTimeout.current) {
        clearTimeout(userInteractionTimeout.current)
      }
      userInteractionTimeout.current = setTimeout(() => {
        isUserInteracting.current = false
      }, 500)
    }
    
    controls.addEventListener('start', onStart)
    controls.addEventListener('end', onEnd)
    
    return () => {
      controls.removeEventListener('start', onStart)
      controls.removeEventListener('end', onEnd)
      if (userInteractionTimeout.current) {
        clearTimeout(userInteractionTimeout.current)
      }
    }
  }, [controlsRef])
  
  useFrame(() => {
    if (!controlsRef.current) return
    
    // Don't auto-animate if user is interacting
    if (isUserInteracting.current) return
    
    const controls = controlsRef.current
    
    // Smoothly interpolate azimuthal angle (horizontal rotation)
    const currentAzimuth = controls.getAzimuthalAngle()
    const azimuthDiff = targetAzimuth - currentAzimuth
    
    // Normalize angle difference to [-PI, PI]
    let normalizedDiff = azimuthDiff
    if (normalizedDiff > Math.PI) normalizedDiff -= 2 * Math.PI
    if (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI
    
    // Apply rotation
    if (Math.abs(normalizedDiff) > 0.01) {
      controls.setAzimuthalAngle(currentAzimuth + normalizedDiff * 0.4)
    }
    
    // Smoothly interpolate target Y position (vertical look-at)
    const currentTargetY = controls.target.y
    const targetYDiff = targetY - currentTargetY
    
    if (Math.abs(targetYDiff) > 0.001) {
      controls.target.y += targetYDiff * 0.4
    }
    
    controls.update()
  })
  
  return null
}

export default function ModularPantsViewerR3F({
  customizations = {},
  frontStyle = "flat-front",
  className = "",
  cameraRotationY = 0,
  cameraTargetY = 0,
}: ModularPantsViewerProps) {
  const controlsRef = React.useRef<any>(null)
  
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        camera={{ position: [0, 0.5, 4], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={["#f5f5f5"]} />
        <fog attach="fog" args={["#f5f5f5", 5, 20]} />
        
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-5, 3, -5]} intensity={0.2} />
        <spotLight position={[0, 10, 0]} angle={0.3} intensity={0.15} />

        <Suspense fallback={<LoadingOverlay />}>
          <PantsModel customizations={customizations} />
          <OrbitCameraController 
            targetAzimuth={cameraRotationY} 
            targetY={cameraTargetY}
            controlsRef={controlsRef}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={8}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 6}
          target={[0, 0, 0]}
        />

        <Environment preset="studio" />
      </Canvas>
    </div>
  )
}
