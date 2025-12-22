"use client"

import { Suspense, useEffect, useState, useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import * as THREE from "three"
import { useJacketPart, preloadAllParts } from "@/lib/3d/jacket-part-loader"
import { useJacketPerformance } from "@/lib/3d/hooks/use-jacket-performance"
import { jacketConfigs } from "@/lib/3d/configs"
import type { BasicJacketCustomization } from "@/types/configurator"

interface ModularJacketViewerProps {
  customizations?: BasicJacketCustomization
  frontStyle?: "2button" | "3button" | "6d2"
  className?: string
  cameraRotationY?: number
}

// Loading indicator component with progress
function LoadingOverlay({ message = "Loading Model..." }: { message?: string }) {
  return (
    <Html fullscreen>
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl flex flex-col items-center space-y-4 border-2 border-primary/20">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-xl font-semibold text-gray-800">{message}</p>
          <p className="text-gray-500">Please wait while we update the model...</p>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse"></div>
          </div>
        </div>
      </div>
    </Html>
  )
}

// Individual Jacket Part Component with optimized rendering
function JacketPart({ 
  partName, 
  path, 
  customizations = {},
  priority = false
}: { 
  partName: string
  path: string
  customizations: BasicJacketCustomization
  priority?: boolean
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadAttempts, setLoadAttempts] = useState(0)
  
  // Reset loading state when path changes
  useEffect(() => {
    setIsLoading(true)
    setLoadAttempts(0)
  }, [path])

  // Generate a stable ID for the part that won't change unless necessary
  const stableId = useMemo(() => {
    const styleId = customizations.frontStyle || '2button'
    const colorId = customizations.fabricColor || 'default'
    return `${partName}-${styleId}-${path.split('/').pop()?.replace('.gltf', '')}-${colorId}`
  }, [partName, path, customizations.frontStyle, customizations.fabricColor])

  console.log(`🔍 Loading jacket part:`, {
    partName,
    path,
    priority,
    stableId,
    customizations,
    hasLiningColor: !!customizations.liningColor,
    liningMeshType: customizations.liningMeshType
  })

  // Use the enhanced hook with stable ID
  const { scene } = useJacketPart(partName, path, customizations)

  // Memoize the scene to prevent unnecessary re-renders
  const memoizedScene = useMemo(() => {
    if (!scene) return null
    
    console.log(`🎨 Applying customizations to ${partName}:`, {
      stableId,
      customizations,
      meshCount: scene.children.filter(child => child.type === 'Mesh').length
    })

    return scene
  }, [scene, stableId, customizations])

  // Create a wrapper group to handle loading state
  const [isPartLoaded, setIsPartLoaded] = useState(false)

  useEffect(() => {
    if (memoizedScene) {
      setIsPartLoaded(true)
    }
  }, [memoizedScene])

  if (!memoizedScene) {
    console.log(`⏳ Part ${partName} waiting for scene:`, {
      stableId,
      priority,
      path
    })
    return null
  }

  return (
    <group name={`${partName}-wrapper`}>
      <primitive 
        object={memoizedScene} 
        key={stableId}
        name={`${partName}-${customizations.frontStyle}`}
      />
      {/* Hidden marker mesh for loading state detection */}
      <mesh visible={false} name={`${partName}-loading-marker`}>
        <boxGeometry args={[0.001, 0.001, 0.001]} />
        <meshBasicMaterial>
          <color attach="color" args={[0, 0, 0]} />
        </meshBasicMaterial>
      </mesh>
    </group>
  )
}

// Complete Modular Jacket Model Component with priority loading
function ModularJacketModel({
  customizations = {},
  frontStyle = "2button",
}: {
  customizations: BasicJacketCustomization
  frontStyle: "2button" | "3button" | "6d2"
}) {
  const [activeConfig, setActiveConfig] = useState(jacketConfigs[frontStyle])
  const [isModelChanging, setIsModelChanging] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Loading Model...")

  // Update configuration when style or pocket selections change
  useEffect(() => {
    const previousPockets = {
      front: activeConfig?.secondary?.frontPocket,
      chest: activeConfig?.secondary?.chestPocket
    }
    
    console.log("🔄 Configuration change detected:", {
      frontStyle: frontStyle,
      previousFrontPocket: previousPockets.front,
      newFrontPocket: customizations.frontPocket,
      previousChestPocket: previousPockets.chest,
      newChestPocket: customizations.chestPocket,
      allCustomizations: customizations
    })
    
    // Determine what's changing for loading message
    let changeMessage = "Loading Model..."
    if (customizations.frontPocket && previousPockets.front !== customizations.frontPocket) {
      const pocketName = customizations.frontPocket.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
      changeMessage = `Loading ${pocketName}...`
    } else if (customizations.chestPocket && previousPockets.chest !== customizations.chestPocket) {
      const pocketName = customizations.chestPocket.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
      changeMessage = `Loading ${pocketName}...`
    }
    
    setLoadingMessage(changeMessage)
    setIsModelChanging(true)
    const baseConfig = jacketConfigs[frontStyle]
    
    // Clone the config and override pockets if selected
    const updatedConfig = {
      ...baseConfig,
      secondary: {
        ...baseConfig.secondary
      }
    }
    
    // Apply pocket customizations if provided
    if (customizations.frontPocket) {
      const { pocketConfigs } = require('@/lib/3d/configs')
      const pocketConfig = pocketConfigs[customizations.frontPocket]
      if (pocketConfig && pocketConfig.frontPocket) {
        updatedConfig.secondary.frontPocket = pocketConfig.frontPocket
        console.log("🎒 Loading front pocket:", {
          selection: customizations.frontPocket,
          file: pocketConfig.frontPocket,
          availableConfigs: Object.keys(pocketConfigs)
        })
      } else {
        console.warn("⚠️ No pocket config found for:", customizations.frontPocket, "Available:", Object.keys(pocketConfigs))
      }
    }
    
    if (customizations.chestPocket) {
      const { chestPocketConfigs } = require('@/lib/3d/configs')
      const chestPocketPath = chestPocketConfigs[customizations.chestPocket]
      if (chestPocketPath) {
        updatedConfig.secondary.chestPocket = chestPocketPath
        console.log("🎒 Loading chest pocket:", {
          selection: customizations.chestPocket,
          file: chestPocketPath
        })
      }
    }
    
    setActiveConfig(updatedConfig)
    
    // Show loading indicator for longer to make it visible
    const timer = setTimeout(() => setIsModelChanging(false), 800)
    return () => clearTimeout(timer)
  }, [frontStyle, customizations.frontPocket, customizations.chestPocket])

  console.log("🚀 Rendering modular jacket:", {
    style: frontStyle,
    isChanging: isModelChanging,
    config: {
      priority: Object.keys(activeConfig.priority),
      secondary: Object.keys(activeConfig.secondary)
    },
    modelPaths: {
      front: activeConfig.priority.frontBottom,
      buttons: activeConfig.priority.frontButtons,
      thread: activeConfig.priority.frontThread
    }
  })

  return (
    <group name="complete_jacket">
      {!isModelChanging && (
        <>
          {/* Priority parts load first for faster initial render */}
          {activeConfig && Object.entries(activeConfig.priority).map(([partName, path]) => (
            <JacketPart
              key={`${frontStyle}-${partName}`}
              partName={partName}
              path={path as string}
              customizations={customizations}
              priority={true}
            />
          ))}
          
          {/* Secondary parts load after priority parts - filter out undefined optional parts */}
          {activeConfig && Object.entries(activeConfig.secondary)
            .filter(([partName, path]) => path !== undefined && path !== null)
            .map(([partName, path]) => (
              <JacketPart
                key={`${frontStyle}-${partName}`}
                partName={partName}
                path={path as string}
                customizations={customizations}
                priority={false}
              />
            ))}
        </>
      )}
      {isModelChanging && <LoadingOverlay message={loadingMessage} />}
    </group>
  )
}

// Loading fallback component with progress indicator
function JacketLoadingFallback() {
  const [loadingStage, setLoadingStage] = useState("Initializing...")
  
  useEffect(() => {
    const stages = [
      "Initializing DRACO compression...",
      "Loading priority jacket parts...",
      "Processing fabric materials...",
      "Assembling complete jacket...",
      "Almost ready!"
    ]
    
    let currentStage = 0
    const interval = setInterval(() => {
      if (currentStage < stages.length - 1) {
        currentStage++
        setLoadingStage(stages[currentStage])
      }
    }, 800)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg max-w-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h3 className="font-semibold text-gray-800 mb-2">Building Your Jacket</h3>
        <p className="text-sm text-gray-600 text-center mb-3">
          {loadingStage}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
        </div>
        <div className="text-xs text-gray-500 text-center">
          Using DRACO compression for optimal performance
        </div>
      </div>
    </Html>
  )
}

// Camera controller with smooth rotation animation
function CameraController({ rotationY = 0 }: { rotationY?: number }) {
  const { camera } = useThree()
  const targetRotation = useRef(0)
  const currentRotation = useRef(0)

  useEffect(() => {
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useEffect(() => {
    targetRotation.current = rotationY
    console.log(`📷 Camera target rotation: ${(rotationY * 180 / Math.PI).toFixed(0)}°`)
  }, [rotationY])

  useFrame(() => {
    const diff = targetRotation.current - currentRotation.current
    
    if (Math.abs(diff) > 0.01) {
      currentRotation.current += diff * 0.15
      
      const radius = 5
      const y = 0
      const x = radius * Math.sin(currentRotation.current)
      const z = radius * Math.cos(currentRotation.current)
      
      camera.position.set(x, y, z)
      camera.lookAt(0, 0, 0)
    }
  })

  return null
}

// Main Modular Jacket Viewer Component with performance optimizations
export default function ModularJacketViewer({ 
  customizations = {}, 
  frontStyle = "2button",
  className = "",
  cameraRotationY = 0
}: ModularJacketViewerProps) {
  console.log("🎬 Initializing Optimized Modular Jacket Viewer:", {
    initialStyle: frontStyle,
    frontStyleType: typeof frontStyle,
    frontStyleValue: frontStyle,
    hasConfig: !!jacketConfigs[frontStyle],
    customizations,
    customizationsFrontStyle: customizations.frontStyle,
    liningColor: customizations.liningColor,
    liningMeshType: customizations.liningMeshType
  })
  
  const [isChangingStyle, setIsChangingStyle] = useState(false)
  const [activeStyle, setActiveStyle] = useState(frontStyle)
  const [activeConfig, setActiveConfig] = useState(jacketConfigs[frontStyle])
  
  const config = activeConfig // Use activeConfig instead of jacketConfigs[activeStyle]

  console.log("🔍 Active Config Check:", {
    activeStyle,
    hasFullyLined: !!config.secondary.fullyLined,
    fullyLinedPath: config.secondary.fullyLined,
    allSecondaryParts: Object.keys(config.secondary),
    secondaryPartPaths: config.secondary
  })
  
  // Log specifically when rendering secondary parts
  console.log("🎨 Secondary parts to render:", 
    Object.entries(config.secondary)
      .filter(([partName, path]) => path && path !== "")
      .map(([partName, path]) => ({ partName, path }))
  )

  // Monitor performance
  useJacketPerformance()

  // Handle pocket customizations - UPDATE CONFIG WHEN POCKETS CHANGE
  useEffect(() => {
    console.log("🔄 Pocket, Sleeve, Vent & Lining configuration change detected:", {
      frontPocket: customizations?.frontPocket,
      chestPocket: customizations?.chestPocket,
      sleeveButtons: customizations?.sleeveButtons,
      ventStyle: customizations?.ventStyle,
      liningMeshType: customizations?.liningMeshType,
      activeStyle: activeStyle
    })

    const baseConfig = jacketConfigs[activeStyle]
    const updatedConfig = {
      ...baseConfig,
      secondary: {
        ...baseConfig.secondary
      }
    }

    // Handle lining selection based on liningMeshType
    if (customizations?.liningMeshType) {
      if (customizations.liningMeshType === "custom-coloured") {
        // Half Lined - load Halfed-lining.gltf, remove fullyLined
        updatedConfig.secondary.fullyLined = ""
        updatedConfig.secondary.halfLining = baseConfig.secondary.halfLining || "/models/jackets/lining/Halfed-lining.gltf"
        console.log("🎨 Loading Half Lining model:", updatedConfig.secondary.halfLining)
      } else if (customizations.liningMeshType === "quilted") {
        // Full Lined - load FullyLined model, remove halfLining
        updatedConfig.secondary.halfLining = ""
        updatedConfig.secondary.fullyLined = baseConfig.secondary.fullyLined
        console.log("🎨 Loading Full Lining model:", updatedConfig.secondary.fullyLined)
      } else if (customizations.liningMeshType === "unlined") {
        // Unlined - remove both lining models
        updatedConfig.secondary.fullyLined = ""
        updatedConfig.secondary.halfLining = ""
        console.log("🎨 No lining models loaded (unlined)")
      }
    }

    // Apply front pocket customization
    if (customizations?.frontPocket) {
      const { pocketConfigs } = require('@/lib/3d/configs')
      const pocketConfig = pocketConfigs[customizations.frontPocket]
      if (pocketConfig) {
        // Apply front pocket
        if (pocketConfig.frontPocket) {
          updatedConfig.secondary.frontPocket = pocketConfig.frontPocket
          console.log("🎒 Loading front pocket:", {
            selection: customizations.frontPocket,
            file: pocketConfig.frontPocket
          })
        }
        // Apply chest pocket from pocketConfig (can be empty string to hide)
        if (pocketConfig.chestPocket !== undefined) {
          updatedConfig.secondary.chestPocket = pocketConfig.chestPocket
          console.log("👔 Chest pocket from front pocket config:", {
            selection: customizations.frontPocket,
            chestPocket: pocketConfig.chestPocket || "(none)"
          })
        }
      } else {
        console.warn("⚠️ No pocket config found for:", customizations.frontPocket)
      }
    }

    // Apply chest pocket customization
    if (customizations?.chestPocket) {
      const { chestPocketConfigs } = require('@/lib/3d/configs')
      const chestPocketPath = chestPocketConfigs[customizations.chestPocket]
      if (chestPocketPath) {
        updatedConfig.secondary.chestPocket = chestPocketPath
        console.log("👔 Loading chest pocket:", {
          selection: customizations.chestPocket,
          file: chestPocketPath,
          availableConfigs: Object.keys(chestPocketConfigs)
        })
      } else {
        console.warn("⚠️ No chest pocket config found for:", customizations.chestPocket, "Available:", Object.keys(chestPocketConfigs))
      }
    }

    // Apply sleeve button customization with special thread logic
    if (customizations?.sleeveButtons) {
      const { sleeveButtonConfigs } = require('@/lib/3d/configs')
      const sleeveConfig = sleeveButtonConfigs[customizations.sleeveButtons]
      if (sleeveConfig) {
        // Always set the button models
        if (sleeveConfig.sleeveWorkingButtons) {
          updatedConfig.secondary.sleeveWorkingButtons = sleeveConfig.sleeveWorkingButtons
        }
        if (sleeveConfig.sleeveLastButton) {
          updatedConfig.secondary.sleeveLastButton = sleeveConfig.sleeveLastButton
        }
        
        // Conditionally show/hide threads based on showThreads flag
        if (sleeveConfig.showThreads) {
          // Show threads for "4 buttons with holes"
          updatedConfig.secondary.sleeveButtonThread = "/models/jackets/Sleeve/Working/Thread/LastThread.gltf"
          updatedConfig.secondary.sleeve4ButtonThread = "/models/jackets/Sleeve/Working/Thread/4Button.gltf"
          console.log("🧵 Loading sleeve button threads:", {
            selection: customizations.sleeveButtons,
            showThreads: true,
            threadFiles: ['LastThread.gltf', '4Button.gltf']
          })
        } else {
          // Remove threads for "4 buttons no holes" by setting to empty string
          updatedConfig.secondary.sleeveButtonThread = ""
          updatedConfig.secondary.sleeve4ButtonThread = ""
          console.log("🔘 Loading sleeve buttons WITHOUT threads:", {
            selection: customizations.sleeveButtons,
            showThreads: false
          })
        }
        
        console.log("👔 Loading sleeve buttons:", {
          selection: customizations.sleeveButtons,
          showThreads: sleeveConfig.showThreads,
          availableConfigs: Object.keys(sleeveButtonConfigs)
        })
      } else {
        console.warn("⚠️ No sleeve button config found for:", customizations.sleeveButtons)
      }
    }

    // Apply vent style customization
    if (customizations?.ventStyle) {
      const { ventStyleConfigs } = require('@/lib/3d/configs')
      const ventPath = ventStyleConfigs[customizations.ventStyle]
      if (ventPath) {
        updatedConfig.secondary.centerVent = ventPath
        console.log("🎽 Loading vent style:", {
          selection: customizations.ventStyle,
          file: ventPath,
          availableConfigs: Object.keys(ventStyleConfigs)
        })
      } else {
        console.warn("⚠️ No vent style config found for:", customizations.ventStyle, "Available:", Object.keys(ventStyleConfigs))
      }
    }

    setActiveConfig(updatedConfig)
  }, [activeStyle, customizations?.frontPocket, customizations?.chestPocket, customizations?.sleeveButtons, customizations?.ventStyle, customizations?.liningMeshType])

  // Initialize with 2-button style and preload parts
  useEffect(() => {
    console.log("� Initial setup:", {
      defaultStyle: "2button",
      activeStyle,
      modelPaths: jacketConfigs["2button"].priority
    })

    // Ensure we start with 2-button style
    if (activeStyle !== "2button") {
      setActiveStyle("2button")
    }

    // Preload all jacket parts for faster switching
    console.log("📦 Preloading jacket parts...")
    preloadAllParts()
  }, [])

  // Handle front style changes
  useEffect(() => {
    console.log(`🔍 Front style effect triggered:`, {
      frontStyleProp: frontStyle,
      activeStyle: activeStyle,
      areEqual: frontStyle === activeStyle,
      hasFrontStyleConfig: !!jacketConfigs[frontStyle]
    })

    if (frontStyle !== activeStyle) {
      console.log(`🔄 Model viewer detected style change:`, {
        from: activeStyle,
        to: frontStyle,
        config: jacketConfigs[frontStyle],
        customizations
      })

      // Verify we have the config for the new style
      if (!jacketConfigs[frontStyle]) {
        console.error(`❌ Missing config for style:`, {
          style: frontStyle,
          availableConfigs: Object.keys(jacketConfigs)
        })
        return
      }

      setIsChangingStyle(true)
      console.log(`🎬 Starting model update process...`)
      
      // Update active style immediately to trigger model change
      setActiveStyle(frontStyle)
      console.log(`📦 Active style updated, new config:`, jacketConfigs[frontStyle])
      
      // Use a small delay to ensure the loading animation is visible
      // and allow time for the model to load
      setTimeout(() => {
        setIsChangingStyle(false)
        console.log(`✅ Model update complete:`, {
          style: frontStyle,
          activeConfig: jacketConfigs[frontStyle],
          appliedCustomizations: customizations
        })
      }, 1500)
    }
  }, [frontStyle, activeStyle])

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance" // Better performance on capable devices
        }}
        onCreated={({ gl, camera, scene }) => {
          gl.setClearColor(0x000000, 0)
          console.log("📷 Camera positioned at:", camera.position)
          console.log("🎬 Scene initialized with", scene.children.length, "children")
        }}
      >
        <CameraController rotationY={cameraRotationY} />
        <Suspense fallback={<JacketLoadingFallback />}>
          {isChangingStyle ? (
            <LoadingOverlay />
          ) : (
            <>
              {/* Priority Parts */}
              {Object.entries(config.priority).map(([partName, path]) => (
                <JacketPart
                  key={`${activeStyle}-${partName}`}
                  partName={partName}
                  path={path as string}
                  customizations={customizations}
                  priority
                />
              ))}
              
              {/* Secondary Parts */}
              {Object.entries(config.secondary)
                .filter(([partName, path]) => path && path !== "") // Skip empty paths
                .map(([partName, path]) => (
                  <JacketPart
                    key={`${activeStyle}-${partName}`}
                    partName={partName}
                    path={path as string}
                    customizations={customizations}
                  />
                ))}
            </>
          )}
          
          {/* Professional lighting setup for high-quality suit fabric */}
          {/* Soft ambient light for base illumination - matched to pants viewer */}
          <ambientLight intensity={0.6} />
          
          {/* Main key light - from top-front for realistic fabric shading */}
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.0}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
          />
          
          {/* Fill light from the side to reduce harsh shadows */}
          <directionalLight position={[-5, 3, -3]} intensity={0.4} />
          
          {/* Rim light from behind for depth and professional highlight */}
          <directionalLight position={[0, 3, -5]} intensity={0.2} />
          
          {/* Bottom fill light to prevent completely dark areas */}
          <hemisphereLight args={['#ffffff', '#444444', 0.25]} />
          
          {/* Environment for professional sheen - "studio" preset for suit-like appearance */}
          <Environment preset="studio" environmentIntensity={0.2} />
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