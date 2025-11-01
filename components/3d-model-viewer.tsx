"use client"

import { Suspense, useRef, useEffect, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import * as THREE from "three"
import { GLTFModelViewer, JacketCustomization } from "./gltf-model-viewer"
import { StandardJacketViewer } from "./standard-jacket-viewer"
import { ModularJacketViewer, BasicJacketCustomization } from "./modular-jacket-viewer"
import ModularJacketViewerR3F from "./modular-jacket-viewer-r3f"

interface ModelViewerProps {
  modelUrl: string
  customizations?: Record<string, any>
  layerControls?: Record<string, string[]>
  className?: string
  useGLTF?: boolean  // New flag to enable GLTF models
  gltfModelPath?: string  // Path to GLTF model
  useStandardJacket?: boolean  // Flag for standard jacket model (for testing)
  useModularJacket?: boolean  // Flag for modular jacket system (NEW)
}

// Enhanced 3D Model Component with ALL customization support
function CustomizableModel({
  modelType,
  customizations = {},
  layerControls = {},
}: {
  modelType: string
  customizations: Record<string, any>
  layerControls: Record<string, string[]>
}) {
  const meshRef = useRef<THREE.Group>(null)
  const [modelParts, setModelParts] = useState<Record<string, THREE.Mesh>>({})

  // Create model based on type with ALL components
  useEffect(() => {
    if (!meshRef.current) return

    // Clear existing children
    while (meshRef.current.children.length > 0) {
      meshRef.current.remove(meshRef.current.children[0])
    }

    const parts: Record<string, THREE.Mesh> = {}

    // Get the main color - prioritize fabricColor, then color, then default
    const mainColor = customizations.fabricColor || customizations.color || customizations.mainColor || "#FFFFFF"
    console.log("Using main color for 3D model:", mainColor)

    if (modelType === "sample-shirt") {
      // Main body - affected by fit style and color
      const bodyGeometry = new THREE.BoxGeometry(
        customizations.fitstyle === "slim" ? 1.8 : customizations.fitstyle === "tailored" ? 1.9 : 2.0,
        2.5,
        customizations.fitstyle === "slim" ? 0.25 : customizations.fitstyle === "tailored" ? 0.28 : 0.3,
      )
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: mainColor,
        roughness: customizations.fabrictype === "silk" ? 0.2 : customizations.fabrictype === "linen" ? 0.9 : 0.7,
        metalness: customizations.fabrictype === "silk" ? 0.3 : 0.1,
      })
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
      body.name = "shirt_body"
      parts["shirt_body"] = body
      meshRef.current.add(body)

      // COLLAR VARIATIONS - All different styles with color support
      const collarColor = customizations.collarColor || mainColor
      const collarMaterial = new THREE.MeshStandardMaterial({
        color: collarColor,
        roughness: 0.6,
      })

      // Spread Collar
      const spreadCollarGeometry = new THREE.BoxGeometry(2.2, 0.3, 0.1)
      const spreadCollar = new THREE.Mesh(spreadCollarGeometry, collarMaterial)
      spreadCollar.position.set(0, 1.4, 0.2)
      spreadCollar.name = "collar_spread"
      parts["collar_spread"] = spreadCollar
      meshRef.current.add(spreadCollar)

      // Button Down Collar - smaller and angled
      const buttonDownCollarGeometry = new THREE.BoxGeometry(2.0, 0.25, 0.08)
      const buttonDownCollar = new THREE.Mesh(buttonDownCollarGeometry, collarMaterial)
      buttonDownCollar.position.set(0, 1.4, 0.2)
      buttonDownCollar.rotation.z = 0.1
      buttonDownCollar.name = "collar_button_down"
      parts["collar_button_down"] = buttonDownCollar
      meshRef.current.add(buttonDownCollar)

      // Cutaway Collar - wider
      const cutawayCollarGeometry = new THREE.BoxGeometry(2.5, 0.35, 0.1)
      const cutawayCollar = new THREE.Mesh(cutawayCollarGeometry, collarMaterial)
      cutawayCollar.position.set(0, 1.4, 0.2)
      cutawayCollar.name = "collar_cutaway"
      parts["collar_cutaway"] = cutawayCollar
      meshRef.current.add(cutawayCollar)

      // Band Collar - no traditional collar
      const bandCollarGeometry = new THREE.BoxGeometry(2.1, 0.15, 0.05)
      const bandCollar = new THREE.Mesh(bandCollarGeometry, collarMaterial)
      bandCollar.position.set(0, 1.3, 0.18)
      bandCollar.name = "collar_band"
      parts["collar_band"] = bandCollar
      meshRef.current.add(bandCollar)

      // Wing Collar - formal style
      const wingCollarGeometry = new THREE.BoxGeometry(1.8, 0.4, 0.12)
      const wingCollar = new THREE.Mesh(wingCollarGeometry, collarMaterial)
      wingCollar.position.set(0, 1.45, 0.22)
      wingCollar.rotation.x = 0.2
      wingCollar.name = "collar_wing"
      parts["collar_wing"] = wingCollar
      meshRef.current.add(wingCollar)

      // CUFF VARIATIONS with color support
      const cuffColor = customizations.cuffColor || mainColor
      const cuffMaterial = new THREE.MeshStandardMaterial({
        color: cuffColor,
        roughness: 0.6,
      })

      // Barrel Cuffs - standard
      const barrelCuffGeometry = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 8)
      const leftBarrelCuff = new THREE.Mesh(barrelCuffGeometry, cuffMaterial)
      leftBarrelCuff.position.set(-2.0, 0.5, 0)
      leftBarrelCuff.rotation.z = Math.PI / 2
      leftBarrelCuff.name = "cuff_barrel_left"
      parts["cuff_barrel_left"] = leftBarrelCuff
      meshRef.current.add(leftBarrelCuff)

      const rightBarrelCuff = new THREE.Mesh(barrelCuffGeometry, cuffMaterial)
      rightBarrelCuff.position.set(2.0, 0.5, 0)
      rightBarrelCuff.rotation.z = -Math.PI / 2
      rightBarrelCuff.name = "cuff_barrel_right"
      parts["cuff_barrel_right"] = rightBarrelCuff
      meshRef.current.add(rightBarrelCuff)

      // French Cuffs - larger and folded
      const frenchCuffGeometry = new THREE.CylinderGeometry(0.32, 0.32, 0.35, 8)
      const leftFrenchCuff = new THREE.Mesh(frenchCuffGeometry, cuffMaterial)
      leftFrenchCuff.position.set(-2.0, 0.5, 0)
      leftFrenchCuff.rotation.z = Math.PI / 2
      leftFrenchCuff.name = "cuff_french_left"
      parts["cuff_french_left"] = leftFrenchCuff
      meshRef.current.add(leftFrenchCuff)

      const rightFrenchCuff = new THREE.Mesh(frenchCuffGeometry, cuffMaterial)
      rightFrenchCuff.position.set(2.0, 0.5, 0)
      rightFrenchCuff.rotation.z = -Math.PI / 2
      rightFrenchCuff.name = "cuff_french_right"
      parts["cuff_french_right"] = rightFrenchCuff
      meshRef.current.add(rightFrenchCuff)

      // Convertible Cuffs - medium size
      const convertibleCuffGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 8)
      const leftConvertibleCuff = new THREE.Mesh(convertibleCuffGeometry, cuffMaterial)
      leftConvertibleCuff.position.set(-2.0, 0.5, 0)
      leftConvertibleCuff.rotation.z = Math.PI / 2
      leftConvertibleCuff.name = "cuff_convertible_left"
      parts["cuff_convertible_left"] = leftConvertibleCuff
      meshRef.current.add(leftConvertibleCuff)

      const rightConvertibleCuff = new THREE.Mesh(convertibleCuffGeometry, cuffMaterial)
      rightConvertibleCuff.position.set(2.0, 0.5, 0)
      rightConvertibleCuff.rotation.z = -Math.PI / 2
      rightConvertibleCuff.name = "cuff_convertible_right"
      parts["cuff_convertible_right"] = rightConvertibleCuff
      meshRef.current.add(rightConvertibleCuff)

      // SLEEVES - affected by fit and color
      const sleeveColor = customizations.sleeveColor || mainColor
      const sleeveGeometry = new THREE.CylinderGeometry(
        customizations.fitstyle === "slim" ? 0.28 : 0.3,
        customizations.fitstyle === "slim" ? 0.23 : 0.25,
        1.5,
        8,
      )
      const sleeveMaterial = new THREE.MeshStandardMaterial({
        color: sleeveColor,
        roughness: 0.7,
      })

      const leftSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial)
      leftSleeve.position.set(
        customizations.fitstyle === "slim" ? -1.2 : customizations.fitstyle === "tailored" ? -1.25 : -1.3,
        0.5,
        0,
      )
      leftSleeve.rotation.z = Math.PI / 2
      parts["sleeve_left"] = leftSleeve
      meshRef.current.add(leftSleeve)

      const rightSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial)
      rightSleeve.position.set(
        customizations.fitstyle === "slim" ? 1.2 : customizations.fitstyle === "tailored" ? 1.25 : 1.3,
        0.5,
        0,
      )
      rightSleeve.rotation.z = -Math.PI / 2
      parts["sleeve_right"] = rightSleeve
      meshRef.current.add(rightSleeve)

      // POCKET VARIATIONS with color support
      const pocketColor = customizations.pocketColor || mainColor
      const pocketMaterial = new THREE.MeshStandardMaterial({
        color: pocketColor,
        roughness: 0.8,
      })

      // Standard Pocket
      const standardPocketGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.05)
      const standardPocket = new THREE.Mesh(standardPocketGeometry, pocketMaterial)
      standardPocket.position.set(-0.6, 0.3, 0.16)
      standardPocket.name = "pocket_standard"
      parts["pocket_standard"] = standardPocket
      meshRef.current.add(standardPocket)

      // Flap Pocket - with flap
      const flapPocketGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.05)
      const flapPocket = new THREE.Mesh(flapPocketGeometry, pocketMaterial)
      flapPocket.position.set(-0.6, 0.3, 0.16)
      flapPocket.name = "pocket_flap"
      parts["pocket_flap"] = flapPocket
      meshRef.current.add(flapPocket)

      const flapGeometry = new THREE.BoxGeometry(0.45, 0.15, 0.02)
      const flap = new THREE.Mesh(flapGeometry, pocketMaterial)
      flap.position.set(-0.6, 0.45, 0.18)
      flap.name = "pocket_flap_cover"
      parts["pocket_flap_cover"] = flap
      meshRef.current.add(flap)

      // Double Pocket
      const doublePocket1 = new THREE.Mesh(standardPocketGeometry, pocketMaterial)
      doublePocket1.position.set(-0.8, 0.3, 0.16)
      doublePocket1.name = "pocket_double_left"
      parts["pocket_double_left"] = doublePocket1
      meshRef.current.add(doublePocket1)

      const doublePocket2 = new THREE.Mesh(standardPocketGeometry, pocketMaterial)
      doublePocket2.position.set(-0.4, 0.3, 0.16)
      doublePocket2.name = "pocket_double_right"
      parts["pocket_double_right"] = doublePocket2
      meshRef.current.add(doublePocket2)

      // ENHANCED FRONT STYLE SYSTEM for jacket buttons
      const frontStyle = customizations.frontStyle || customizations.front_style || customizations["jacket-front-style"] || "two-buttons"
      const buttonColor = customizations.buttonColor || customizations.button_color || "#F5E6D3"
      const buttonStyle = customizations.buttonStyle || customizations.buttonstyle || customizations.button_style || "classic-round"
      const buttonMaterial = customizations.buttonMaterial || customizations.buttonmaterial || customizations.button_material || "horn"
      const buttonSize = customizations.buttonSize || customizations.buttonsize || customizations.button_size || "standard"
      
      console.log("Front style customizations:", {
        frontStyle: frontStyle,
        color: buttonColor,
        style: buttonStyle,
        material: buttonMaterial,
        size: buttonSize,
        allCustomizations: customizations
      })
      
      // Remove existing buttons first to prevent duplicates
      const existingButtons = Object.keys(parts).filter(key => key.startsWith('jacket_button_'))
      existingButtons.forEach(buttonKey => {
        if (parts[buttonKey] && meshRef.current) {
          meshRef.current.remove(parts[buttonKey])
          delete parts[buttonKey]
        }
      })
      
      // Create material based on button material and color
      const createButtonMaterial = (materialType: string, color: string) => {
        switch (materialType.toLowerCase()) {
          case "mother-of-pearl":
          case "mother_of_pearl":
          case "pearl":
            return new THREE.MeshStandardMaterial({
              color: color,
              roughness: 0.1,
              metalness: 0.8,
              transparent: true,
              opacity: 0.9,
            })
          case "metal":
          case "brass":
          case "silver":
          case "gold":
            return new THREE.MeshStandardMaterial({
              color: color,
              roughness: 0.2,
              metalness: 0.9,
            })
          case "horn":
          case "natural":
            return new THREE.MeshStandardMaterial({
              color: color,
              roughness: 0.4,
              metalness: 0.1,
            })
          case "corozo":
          case "tagua":
            return new THREE.MeshStandardMaterial({
              color: color,
              roughness: 0.6,
              metalness: 0.2,
            })
          case "plastic":
          case "resin":
            return new THREE.MeshStandardMaterial({
              color: color,
              roughness: 0.3,
              metalness: 0.0,
            })
          case "wood":
          case "wooden":
            return new THREE.MeshStandardMaterial({
              color: color,
              roughness: 0.8,
              metalness: 0.0,
            })
          default:
            return new THREE.MeshStandardMaterial({
              color: color,
              roughness: 0.3,
              metalness: 0.2,
            })
        }
      }

      // Create button geometry based on style and size
      const createButtonGeometry = (style: string, size: string) => {
        // Base sizes
        let baseRadius = 0.05
        let baseHeight = 0.02
        
        // Adjust for size
        switch (size.toLowerCase()) {
          case "small":
            baseRadius = 0.04
            baseHeight = 0.018
            break
          case "large":
            baseRadius = 0.06
            baseHeight = 0.025
            break
          case "extra-large":
          case "xl":
            baseRadius = 0.07
            baseHeight = 0.028
            break
          default: // standard
            baseRadius = 0.05
            baseHeight = 0.02
        }
        
        switch (style.toLowerCase()) {
          case "classic-round":
          case "classic":
          case "round":
            return new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 16)
          case "beveled-edge":
          case "beveled":
            return new THREE.CylinderGeometry(baseRadius * 0.96, baseRadius, baseHeight * 1.25, 16)
          case "flat-modern":
          case "flat":
          case "modern":
            return new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight * 0.75, 16)
          case "domed":
          case "dome":
            return new THREE.SphereGeometry(baseRadius, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2)
          case "vintage-shank":
          case "vintage":
          case "shank":
            return new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight * 1.5, 16)
          case "square-modern":
          case "square":
            return new THREE.BoxGeometry(baseRadius * 2, baseRadius * 2, baseHeight)
          case "rectangle":
          case "rectangular":
            return new THREE.BoxGeometry(baseRadius * 2.4, baseRadius * 1.6, baseHeight)
          case "oval":
            const ovalGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 16)
            ovalGeometry.scale(1.2, 1, 0.8)
            return ovalGeometry
          case "toggle":
            return new THREE.BoxGeometry(baseRadius * 3, baseRadius * 0.8, baseHeight * 2)
          default:
            return new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 16)
        }
      }

      // Create buttons with the selected style
      const selectedButtonMaterial = createButtonMaterial(buttonMaterial, buttonColor)
      const selectedButtonGeometry = createButtonGeometry(buttonStyle, buttonSize)
      
      // Add special effects for certain button styles
      const addButtonDetails = (button: THREE.Mesh, style: string) => {
        if (style.includes("vintage") || style.includes("shank")) {
          // Add center hole for shank buttons
          const holeGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.035, 8)
          const holeMaterial = new THREE.MeshStandardMaterial({ color: "#000000" })
          const hole = new THREE.Mesh(holeGeometry, holeMaterial)
          hole.position.set(0, 0, 0)
          button.add(hole)
        } else if (style.includes("beveled")) {
          // Add rim highlight for beveled buttons
          const rimGeometry = new THREE.TorusGeometry(0.045, 0.005, 8, 16)
          const rimMaterial = new THREE.MeshStandardMaterial({ 
            color: "#FFFFFF", 
            transparent: true, 
            opacity: 0.3 
          })
          const rim = new THREE.Mesh(rimGeometry, rimMaterial)
          rim.rotation.x = Math.PI / 2
          rim.position.set(0, 0.015, 0)
          button.add(rim)
        } else if (style.includes("domed") || style.includes("dome")) {
          // Add highlight for domed buttons
          const highlightGeometry = new THREE.SphereGeometry(0.02, 8, 4, 0, Math.PI * 2, 0, Math.PI / 3)
          const highlightMaterial = new THREE.MeshStandardMaterial({ 
            color: "#FFFFFF", 
            transparent: true, 
            opacity: 0.4 
          })
          const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial)
          highlight.position.set(-0.015, 0.02, 0.015)
          button.add(highlight)
        }
      }

      // Determine button count based on front style
      const getButtonCount = (style: string) => {
        const styleLower = style.toLowerCase()
        if (styleLower.includes("two-buttons") || styleLower === "two-buttons") return 2
        if (styleLower.includes("three-buttons") || styleLower === "three-buttons") return 3
        if (styleLower.includes("2x3-buttons") || styleLower === "2x3-buttons") return 6 // Double-breasted
        
        return 2 // Default two-button
      }

      // Create jacket buttons based on front style
      const buttonCount = getButtonCount(frontStyle)
      console.log(`Creating €{buttonCount} buttons for front style: €{frontStyle}`)
      
      // Enhanced button positioning system
      const getButtonPositions = (count: number, style: string) => {
        const positions: Array<{x: number, y: number, z: number}> = []
        const styleLower = style.toLowerCase()
        
        if (count === 2) {
          // Two button - classic spacing
          positions.push({x: 0, y: 0.4, z: 0.16})
          positions.push({x: 0, y: 0, z: 0.16})
        } else if (count === 3) {
          // Three button - traditional spacing
          positions.push({x: 0, y: 0.6, z: 0.16})
          positions.push({x: 0, y: 0.3, z: 0.16})
          positions.push({x: 0, y: 0, z: 0.16})
        } else if (count === 6 && styleLower.includes("2x3")) {
          // Double-breasted - two columns
          positions.push({x: -0.15, y: 0.8, z: 0.16})
          positions.push({x: 0.15, y: 0.8, z: 0.16})
          positions.push({x: -0.15, y: 0.5, z: 0.16})
          positions.push({x: 0.15, y: 0.5, z: 0.16})
          positions.push({x: -0.15, y: 0.2, z: 0.16})
          positions.push({x: 0.15, y: 0.2, z: 0.16})
        }
        
        return positions
      }
      
      const buttonPositions = getButtonPositions(buttonCount, frontStyle)
      
      for (let i = 0; i < buttonCount; i++) {
        const button = new THREE.Mesh(selectedButtonGeometry.clone(), selectedButtonMaterial.clone())
        
        // Set position from calculated positions
        if (buttonPositions[i]) {
          button.position.set(buttonPositions[i].x, buttonPositions[i].y, buttonPositions[i].z)
        }
        
        addButtonDetails(button, buttonStyle)
        button.name = `jacket_button_€{i}`
        parts[`jacket_button_€{i}`] = button
        meshRef.current.add(button)
      }

      // ENHANCED MONOGRAM SYSTEM
      const monogramData = customizations.monogramData ? JSON.parse(customizations.monogramData) : null
      const monogramText = monogramData?.text || customizations.monogramText || ""
      const monogramPosition = monogramData?.position || customizations.monogramPosition || "no-monogram"
      
      // Use thread color specifically for monogram - prioritize threadColor over general color
      const monogramColor = customizations.monogramThreadColor || 
                           monogramData?.threadColor || 
                           monogramData?.color || 
                           customizations.monogramColor || 
                           "#1565C0"
      
      console.log("Displaying monogram:", {
        text: monogramText,
        position: monogramPosition,
        color: monogramColor,
        visible: !!(monogramText && monogramPosition !== "no-monogram")
      })
      
      if (monogramText && monogramPosition !== "no-monogram") {
        const monogramMaterial = new THREE.MeshStandardMaterial({
          color: monogramColor,
          roughness: 0.8,
          metalness: 0.1,
        })

        // Create text geometry (simplified representation)
        const createMonogramGeometry = (text: string, size: number) => {
          // Create a simple plane for now - in a real implementation, you'd use TextGeometry
          const geometry = new THREE.PlaneGeometry(size * text.length * 0.6, size)
          return geometry
        }

        // Position monogram based on selected position
        switch (monogramPosition) {
          case "chest":
            const chestMonogramGeometry = createMonogramGeometry(monogramText, 0.15)
            const chestMonogram = new THREE.Mesh(chestMonogramGeometry, monogramMaterial)
            chestMonogram.position.set(0.6, 0.5, 0.16)
            chestMonogram.name = "monogram_chest"
            parts["monogram_chest"] = chestMonogram
            meshRef.current.add(chestMonogram)
            break
            
          case "cuff":
            const cuffMonogramGeometry = createMonogramGeometry(monogramText, 0.08)
            const cuffMonogram = new THREE.Mesh(cuffMonogramGeometry, monogramMaterial)
            cuffMonogram.position.set(-1.6, 0.5, 0.1)
            cuffMonogram.rotation.y = Math.PI / 6
            cuffMonogram.name = "monogram_cuff"
            parts["monogram_cuff"] = cuffMonogram
            meshRef.current.add(cuffMonogram)
            break
            
          case "inside-pocket":
            // Inside pocket monogram (partially visible when jacket is open)
            const pocketMonogramGeometry = createMonogramGeometry(monogramText, 0.1)
            const pocketMonogram = new THREE.Mesh(pocketMonogramGeometry, monogramMaterial)
            pocketMonogram.position.set(-0.5, 0.2, -0.14)
            pocketMonogram.rotation.y = Math.PI
            pocketMonogram.name = "monogram_inside_pocket"
            parts["monogram_inside_pocket"] = pocketMonogram
            meshRef.current.add(pocketMonogram)
            break
            
          case "lining":
            // Lining monogram (visible on the inside)
            const liningMonogramGeometry = createMonogramGeometry(monogramText, 0.12)
            const liningMonogram = new THREE.Mesh(liningMonogramGeometry, monogramMaterial)
            liningMonogram.position.set(0, 0.8, -0.14)
            liningMonogram.rotation.y = Math.PI
            liningMonogram.name = "monogram_lining"
            parts["monogram_lining"] = liningMonogram
            meshRef.current.add(liningMonogram)
            break
        }
      }

      // SLEEVE BUTTONS CUSTOMIZATION
      const sleeveButtonType = customizations.sleeveButtons || customizations.sleeve_buttons || customizations["jacket-sleeve-buttons"] || "4-buttons-no-holes"
      console.log("Adding sleeve buttons:", sleeveButtonType)
      
      // Remove existing sleeve buttons
      const existingSleeveButtons = Object.keys(parts).filter(key => key.startsWith('sleeve_button_'))
      existingSleeveButtons.forEach(buttonKey => {
        if (parts[buttonKey] && meshRef.current) {
          meshRef.current.remove(parts[buttonKey])
          delete parts[buttonKey]
        }
      })
      
      // Create sleeve buttons
      const sleeveButtonGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.015, 8)
      const sleeveButtonMaterial = new THREE.MeshStandardMaterial({
        color: buttonColor,
        roughness: 0.3,
        metalness: 0.2,
      })
      
      // Add 4 buttons to each sleeve
      const sleeveButtonPositions = [
        { x: -1.4, y: -0.8, z: 0 },  // Left sleeve buttons
        { x: -1.4, y: -0.9, z: 0 },
        { x: -1.4, y: -1.0, z: 0 },
        { x: -1.4, y: -1.1, z: 0 },
        { x: 1.4, y: -0.8, z: 0 },   // Right sleeve buttons
        { x: 1.4, y: -0.9, z: 0 },
        { x: 1.4, y: -1.0, z: 0 },
        { x: 1.4, y: -1.1, z: 0 }
      ]
      
      sleeveButtonPositions.forEach((pos, index) => {
        const sleeveButton = new THREE.Mesh(sleeveButtonGeometry, sleeveButtonMaterial.clone())
        sleeveButton.position.set(pos.x, pos.y, pos.z)
        
        // Add holes for functional buttons
        if (sleeveButtonType === "4-buttons-with-holes") {
          const holeGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8)
          const holeMaterial = new THREE.MeshStandardMaterial({
            color: "#000000",
            transparent: true,
            opacity: 0.8
          })
          const hole = new THREE.Mesh(holeGeometry, holeMaterial)
          hole.position.set(0, 0, 0.01)
          sleeveButton.add(hole)
        }
        
        sleeveButton.name = `sleeve_button_€{index}`
        parts[`sleeve_button_€{index}`] = sleeveButton
        if (meshRef.current) {
          meshRef.current.add(sleeveButton)
        }
      })

      // FRONT POCKET CUSTOMIZATION
      const frontPocketType = customizations.frontPocket || customizations.front_pocket || customizations["front-pocket"] || "flap-pocket"
      console.log("Adding front pocket:", frontPocketType)
      
      // Remove existing front pockets
      const existingFrontPockets = Object.keys(parts).filter(key => key.startsWith('front_pocket_'))
      existingFrontPockets.forEach(pocketKey => {
        if (parts[pocketKey] && meshRef.current) {
          meshRef.current.remove(parts[pocketKey])
          delete parts[pocketKey]
        }
      })
      
      const frontPocketMaterial = new THREE.MeshStandardMaterial({
        color: mainColor,
        roughness: 0.6,
      })
      
      if (frontPocketType === "flap-pocket") {
        // Flap pockets with flaps
        const pocketGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.05)
        const flapGeometry = new THREE.BoxGeometry(0.42, 0.12, 0.02)
        
        // Left pocket
        const leftPocket = new THREE.Mesh(pocketGeometry, frontPocketMaterial)
        leftPocket.position.set(-0.6, -0.3, 0.16)
        leftPocket.name = "front_pocket_left"
        parts["front_pocket_left"] = leftPocket
        if (meshRef.current) {
          meshRef.current.add(leftPocket)
        }
        
        const leftFlap = new THREE.Mesh(flapGeometry, frontPocketMaterial)
        leftFlap.position.set(-0.6, -0.1, 0.18)
        leftFlap.name = "front_pocket_left_flap"
        parts["front_pocket_left_flap"] = leftFlap
        if (meshRef.current) {
          meshRef.current.add(leftFlap)
        }
        
        // Right pocket
        const rightPocket = new THREE.Mesh(pocketGeometry, frontPocketMaterial)
        rightPocket.position.set(0.6, -0.3, 0.16)
        rightPocket.name = "front_pocket_right"
        parts["front_pocket_right"] = rightPocket
        if (meshRef.current) {
          meshRef.current.add(rightPocket)
        }
        
        const rightFlap = new THREE.Mesh(flapGeometry, frontPocketMaterial)
        rightFlap.position.set(0.6, -0.1, 0.18)
        rightFlap.name = "front_pocket_right_flap"
        parts["front_pocket_right_flap"] = rightFlap
        if (meshRef.current) {
          meshRef.current.add(rightFlap)
        }
      } else if (frontPocketType === "patch-pocket") {
        // Patch pockets - raised from the surface
        const patchPocketGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.08)
        
        const leftPatchPocket = new THREE.Mesh(patchPocketGeometry, frontPocketMaterial)
        leftPatchPocket.position.set(-0.6, -0.3, 0.18)
        leftPatchPocket.name = "front_pocket_left_patch"
        parts["front_pocket_left_patch"] = leftPatchPocket
        if (meshRef.current) {
          meshRef.current.add(leftPatchPocket)
        }
        
        const rightPatchPocket = new THREE.Mesh(patchPocketGeometry, frontPocketMaterial)
        rightPatchPocket.position.set(0.6, -0.3, 0.18)
        rightPatchPocket.name = "front_pocket_right_patch"
        parts["front_pocket_right_patch"] = rightPatchPocket
        if (meshRef.current) {
          meshRef.current.add(rightPatchPocket)
        }
      }

      // CHEST POCKET CUSTOMIZATION
      const chestPocketType = customizations.chestPocket || customizations.chest_pocket || customizations["chest-pocket"] || "piping-pocket"
      console.log("Adding chest pocket:", chestPocketType)
      
      // Remove existing chest pockets
      const existingChestPockets = Object.keys(parts).filter(key => key.startsWith('chest_pocket_'))
      existingChestPockets.forEach(pocketKey => {
        if (parts[pocketKey] && meshRef.current) {
          meshRef.current.remove(parts[pocketKey])
          delete parts[pocketKey]
        }
      })
      
      if (chestPocketType === "piping-pocket") {
        // Piping pocket - subtle, with piped edges
        const pipingPocketGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.02)
        const pipingGeometry = new THREE.BoxGeometry(0.32, 0.02, 0.03)
        
        const chestPocket = new THREE.Mesh(pipingPocketGeometry, frontPocketMaterial)
        chestPocket.position.set(-0.4, 0.8, 0.16)
        chestPocket.name = "chest_pocket_piping"
        parts["chest_pocket_piping"] = chestPocket
        if (meshRef.current) {
          meshRef.current.add(chestPocket)
        }
        
        // Top piping
        const topPiping = new THREE.Mesh(pipingGeometry, frontPocketMaterial)
        topPiping.position.set(-0.4, 0.88, 0.17)
        topPiping.name = "chest_pocket_piping_top"
        parts["chest_pocket_piping_top"] = topPiping
        if (meshRef.current) {
          meshRef.current.add(topPiping)
        }
      } else if (chestPocketType === "patch-pocket-chest") {
        // Patch pocket on chest - raised
        const chestPatchGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.06)
        
        const chestPatchPocket = new THREE.Mesh(chestPatchGeometry, frontPocketMaterial)
        chestPatchPocket.position.set(-0.4, 0.8, 0.18)
        chestPatchPocket.name = "chest_pocket_patch"
        parts["chest_pocket_patch"] = chestPatchPocket
        if (meshRef.current) {
          meshRef.current.add(chestPatchPocket)
        }
      }

      // VENT STYLE CUSTOMIZATION
      const ventStyle = customizations.ventStyle || customizations.vent_style || customizations["jacket-vent-style"] || "one-back-vent"
      console.log("Adding vent style:", ventStyle)
      
      // Remove existing vents
      const existingVents = Object.keys(parts).filter(key => key.startsWith('vent_'))
      existingVents.forEach(ventKey => {
        if (parts[ventKey] && meshRef.current) {
          meshRef.current.remove(parts[ventKey])
          delete parts[ventKey]
        }
      })
      
      const ventMaterial = new THREE.MeshStandardMaterial({
        color: mainColor,
        roughness: 0.6,
      })
      
      if (ventStyle === "one-back-vent") {
        // Single center vent
        const ventGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.03)
        const centerVent = new THREE.Mesh(ventGeometry, ventMaterial)
        centerVent.position.set(0, -1.2, -0.18) // Back of jacket
        centerVent.name = "vent_center"
        parts["vent_center"] = centerVent
        if (meshRef.current) {
          meshRef.current.add(centerVent)
        }
      } else if (ventStyle === "two-back-vent") {
        // Two side vents
        const ventGeometry = new THREE.BoxGeometry(0.12, 0.35, 0.03)
        
        const leftVent = new THREE.Mesh(ventGeometry, ventMaterial)
        leftVent.position.set(-0.4, -1.2, -0.18)
        leftVent.name = "vent_left"
        parts["vent_left"] = leftVent
        if (meshRef.current) {
          meshRef.current.add(leftVent)
        }
        
        const rightVent = new THREE.Mesh(ventGeometry, ventMaterial)
        rightVent.position.set(0.4, -1.2, -0.18)
        rightVent.name = "vent_right"
        parts["vent_right"] = rightVent
        if (meshRef.current) {
          meshRef.current.add(rightVent)
        }
      }

    } else if (modelType === "sample-pants") {
      // PANTS WITH ALL CUSTOMIZATIONS AND COLORS
      const baseColor = mainColor

      // Waist - affected by waistband style
      const waistHeight =
        customizations.waistbandstyle === "extended" ? 0.3 : customizations.waistbandstyle === "comfort" ? 0.25 : 0.2
      const waistGeometry = new THREE.CylinderGeometry(0.8, 0.8, waistHeight, 16)
      const waistMaterial = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: customizations.fabrictype === "linen-blend" ? 0.9 : 0.8,
      })
      const waist = new THREE.Mesh(waistGeometry, waistMaterial)
      waist.position.set(0, 1, 0)
      waist.name = "pants_waist"
      parts["pants_waist"] = waist
      meshRef.current.add(waist)

      // Legs - affected by fit style
      const legWidth =
        customizations.fitstyle === "slim"
          ? 0.3
          : customizations.fitstyle === "tapered"
            ? 0.35
            : customizations.fitstyle === "straight"
              ? 0.35
              : 0.4
      const legBottomWidth =
        customizations.fitstyle === "tapered" ? 0.25 : customizations.fitstyle === "slim" ? 0.28 : legWidth

      const legGeometry = new THREE.CylinderGeometry(legBottomWidth, legWidth, 2, 12)
      const legMaterial = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.8,
      })

      const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
      leftLeg.position.set(-0.3, 0, 0)
      parts["leg_left"] = leftLeg
      meshRef.current.add(leftLeg)

      const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
      rightLeg.position.set(0.3, 0, 0)
      parts["leg_right"] = rightLeg
      meshRef.current.add(rightLeg)

      // POCKET VARIATIONS with color support
      const pocketColor = customizations.pocketColor || baseColor
      const pocketMaterial = new THREE.MeshStandardMaterial({
        color: pocketColor,
        roughness: 0.9,
      })

      // Standard pockets
      const standardPocketGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.05)
      const leftStandardPocket = new THREE.Mesh(standardPocketGeometry, pocketMaterial)
      leftStandardPocket.position.set(-0.5, 0.8, 0.4)
      leftStandardPocket.name = "pockets_standard_left"
      parts["pockets_standard_left"] = leftStandardPocket
      meshRef.current.add(leftStandardPocket)

      const rightStandardPocket = new THREE.Mesh(standardPocketGeometry, pocketMaterial)
      rightStandardPocket.position.set(0.5, 0.8, 0.4)
      rightStandardPocket.name = "pockets_standard_right"
      parts["pockets_standard_right"] = rightStandardPocket
      meshRef.current.add(rightStandardPocket)

      // Slanted pockets
      const slantedPocketGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.05)
      const leftSlantedPocket = new THREE.Mesh(slantedPocketGeometry, pocketMaterial)
      leftSlantedPocket.position.set(-0.5, 0.8, 0.4)
      leftSlantedPocket.rotation.z = 0.3
      leftSlantedPocket.name = "pockets_slanted_left"
      parts["pockets_slanted_left"] = leftSlantedPocket
      meshRef.current.add(leftSlantedPocket)

      const rightSlantedPocket = new THREE.Mesh(slantedPocketGeometry, pocketMaterial)
      rightSlantedPocket.position.set(0.5, 0.8, 0.4)
      rightSlantedPocket.rotation.z = -0.3
      rightSlantedPocket.name = "pockets_slanted_right"
      parts["pockets_slanted_right"] = rightSlantedPocket
      meshRef.current.add(rightSlantedPocket)

      // Cargo pockets
      const cargoPocketGeometry = new THREE.BoxGeometry(0.25, 0.35, 0.08)
      const leftCargoPocket = new THREE.Mesh(cargoPocketGeometry, pocketMaterial)
      leftCargoPocket.position.set(-0.6, 0.2, 0.35)
      leftCargoPocket.name = "pockets_cargo_left"
      parts["pockets_cargo_left"] = leftCargoPocket
      meshRef.current.add(leftCargoPocket)

      const rightCargoPocket = new THREE.Mesh(cargoPocketGeometry, pocketMaterial)
      rightCargoPocket.position.set(0.6, 0.2, 0.35)
      rightCargoPocket.name = "pockets_cargo_right"
      parts["pockets_cargo_right"] = rightCargoPocket
      meshRef.current.add(rightCargoPocket)

      // HEM VARIATIONS
      const hemColor = customizations.trimColor || baseColor
      const hemMaterial = new THREE.MeshStandardMaterial({
        color: hemColor,
        roughness: 0.7,
      })

      // Plain hem
      const plainHemGeometry = new THREE.CylinderGeometry(legBottomWidth + 0.02, legBottomWidth + 0.02, 0.05, 12)
      const leftPlainHem = new THREE.Mesh(plainHemGeometry, hemMaterial)
      leftPlainHem.position.set(-0.3, -1.0, 0)
      leftPlainHem.name = "hem_plain_left"
      parts["hem_plain_left"] = leftPlainHem
      meshRef.current.add(leftPlainHem)

      const rightPlainHem = new THREE.Mesh(plainHemGeometry, hemMaterial)
      rightPlainHem.position.set(0.3, -1.0, 0)
      rightPlainHem.name = "hem_plain_right"
      parts["hem_plain_right"] = rightPlainHem
      meshRef.current.add(rightPlainHem)

      // Cuffed hem
      const cuffedHemGeometry = new THREE.CylinderGeometry(legBottomWidth + 0.05, legBottomWidth + 0.05, 0.1, 12)
      const leftCuffedHem = new THREE.Mesh(cuffedHemGeometry, hemMaterial)
      leftCuffedHem.position.set(-0.3, -1.0, 0)
      leftCuffedHem.name = "hem_cuffed_left"
      parts["hem_cuffed_left"] = leftCuffedHem
      meshRef.current.add(leftCuffedHem)

      const rightCuffedHem = new THREE.Mesh(cuffedHemGeometry, hemMaterial)
      rightCuffedHem.position.set(0.3, -1.0, 0)
      rightCuffedHem.name = "hem_cuffed_right"
      parts["hem_cuffed_right"] = rightCuffedHem
      meshRef.current.add(rightCuffedHem)

      // BELT LOOPS with color support
      const beltLoopColor = customizations.accentColor || baseColor
      const beltLoopMaterial = new THREE.MeshStandardMaterial({
        color: beltLoopColor,
        roughness: 0.8,
      })

      const beltLoopGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.03)
      for (let i = 0; i < 5; i++) {
        const angle = (i / 4) * Math.PI * 2
        const x = Math.cos(angle) * 0.75
        const z = Math.sin(angle) * 0.75

        const beltLoop = new THREE.Mesh(beltLoopGeometry, beltLoopMaterial)
        beltLoop.position.set(x, 1.1, z)
        beltLoop.name = `belt_loops_standard_€{i}`
        parts[`belt_loops_standard_€{i}`] = beltLoop
        meshRef.current.add(beltLoop)

        // Extended belt loops
        const extendedBeltLoopGeometry = new THREE.BoxGeometry(0.07, 0.2, 0.04)
        const extendedBeltLoop = new THREE.Mesh(extendedBeltLoopGeometry, beltLoopMaterial)
        extendedBeltLoop.position.set(x, 1.1, z)
        extendedBeltLoop.name = `belt_loops_extended_€{i}`
        parts[`belt_loops_extended_€{i}`] = extendedBeltLoop
        meshRef.current.add(extendedBeltLoop)
      }
    } else if (modelType === "sample-jacket") {
      // JACKET WITH ALL CUSTOMIZATIONS AND COLORS
      const baseColor = mainColor

      // Body
      const bodyGeometry = new THREE.BoxGeometry(2.2, 2.8, 0.4)
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: customizations.fabrictype === "velvet" ? 0.9 : customizations.fabrictype === "cashmere" ? 0.3 : 0.6,
        metalness: 0.1,
      })
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
      body.name = "jacket_body"
      parts["jacket_body"] = body
      meshRef.current.add(body)

      // LAPEL VARIATIONS with color support
      const lapelColor = customizations.accentColor || baseColor
      const lapelMaterial = new THREE.MeshStandardMaterial({
        color: lapelColor,
        roughness: 0.5,
      })

      // Notched lapels
      const notchedLapelGeometry = new THREE.BoxGeometry(0.6, 1, 0.1)
      const leftNotchedLapel = new THREE.Mesh(notchedLapelGeometry, lapelMaterial)
      leftNotchedLapel.position.set(-0.8, 0.8, 0.25)
      leftNotchedLapel.rotation.z = 0.3
      leftNotchedLapel.name = "lapel_notched_left"
      parts["lapel_notched_left"] = leftNotchedLapel
      meshRef.current.add(leftNotchedLapel)

      const rightNotchedLapel = new THREE.Mesh(notchedLapelGeometry, lapelMaterial)
      rightNotchedLapel.position.set(0.8, 0.8, 0.25)
      rightNotchedLapel.rotation.z = -0.3
      rightNotchedLapel.name = "lapel_notched_right"
      parts["lapel_notched_right"] = rightNotchedLapel
      meshRef.current.add(rightNotchedLapel)

      // Peak lapels - pointed
      const peakLapelGeometry = new THREE.ConeGeometry(0.3, 1.2, 3)
      const leftPeakLapel = new THREE.Mesh(peakLapelGeometry, lapelMaterial)
      leftPeakLapel.position.set(-0.8, 0.8, 0.25)
      leftPeakLapel.rotation.z = 0.5
      leftPeakLapel.name = "lapel_peak_left"
      parts["lapel_peak_left"] = leftPeakLapel
      meshRef.current.add(leftPeakLapel)

      const rightPeakLapel = new THREE.Mesh(peakLapelGeometry, lapelMaterial)
      rightPeakLapel.position.set(0.8, 0.8, 0.25)
      rightPeakLapel.rotation.z = -0.5
      rightPeakLapel.name = "lapel_peak_right"
      parts["lapel_peak_right"] = rightPeakLapel
      meshRef.current.add(rightPeakLapel)

      // Shawl lapels - rounded
      const shawlLapelGeometry = new THREE.CylinderGeometry(0.4, 0.3, 1.2, 8)
      const leftShawlLapel = new THREE.Mesh(shawlLapelGeometry, lapelMaterial)
      leftShawlLapel.position.set(-0.8, 0.8, 0.25)
      leftShawlLapel.rotation.z = 0.3
      leftShawlLapel.name = "lapel_shawl_left"
      parts["lapel_shawl_left"] = leftShawlLapel
      meshRef.current.add(leftShawlLapel)

      const rightShawlLapel = new THREE.Mesh(shawlLapelGeometry, lapelMaterial)
      rightShawlLapel.position.set(0.8, 0.8, 0.25)
      rightShawlLapel.rotation.z = -0.3
      rightShawlLapel.name = "lapel_shawl_right"
      parts["lapel_shawl_right"] = rightShawlLapel
      meshRef.current.add(rightShawlLapel)

      // BUTTON CONFIGURATIONS with color support
      const buttonColor = customizations.buttonColor || "#2C2C2C"
      const buttonMaterial = new THREE.MeshStandardMaterial({
        color: buttonColor,
        roughness: 0.2,
        metalness: 0.3,
      })

      const buttonGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.03, 8)

      // Single button
      const singleButton = new THREE.Mesh(buttonGeometry, buttonMaterial)
      singleButton.position.set(0, 0.2, 0.21)
      singleButton.name = "buttons_single"
      parts["buttons_single"] = singleButton
      meshRef.current.add(singleButton)

      // Two buttons
      for (let i = 0; i < 2; i++) {
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial)
        button.position.set(0, 0.4 - i * 0.4, 0.21)
        button.name = `buttons_double_€{i}`
        parts[`buttons_double_€{i}`] = button
        meshRef.current.add(button)
      }

      // Three buttons
      for (let i = 0; i < 3; i++) {
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial)
        button.position.set(0, 0.5 - i * 0.4, 0.21)
        button.name = `buttons_three_€{i}`
        parts[`buttons_three_€{i}`] = button
        meshRef.current.add(button)
      }

      // Four buttons
      for (let i = 0; i < 4; i++) {
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial)
        button.position.set(0, 0.6 - i * 0.3, 0.21)
        button.name = `buttons_four_€{i}`
        parts[`buttons_four_€{i}`] = button
        meshRef.current.add(button)
      }

      // VENT STYLES
      const ventMaterial = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.7,
      })

      // Single vent
      const singleVentGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.05)
      const singleVent = new THREE.Mesh(singleVentGeometry, ventMaterial)
      singleVent.position.set(0, -0.8, -0.2)
      singleVent.name = "vent_single"
      parts["vent_single"] = singleVent
      meshRef.current.add(singleVent)

      // Double vents
      const leftVent = new THREE.Mesh(singleVentGeometry, ventMaterial)
      leftVent.position.set(-0.5, -0.8, -0.2)
      leftVent.name = "vent_double_left"
      parts["vent_double_left"] = leftVent
      meshRef.current.add(leftVent)

      const rightVent = new THREE.Mesh(singleVentGeometry, ventMaterial)
      rightVent.position.set(0.5, -0.8, -0.2)
      rightVent.name = "vent_double_right"
      parts["vent_double_right"] = rightVent
      meshRef.current.add(rightVent)

      // SLEEVES with color support
      const sleeveColor = customizations.sleeveColor || baseColor
      const sleeveGeometry = new THREE.CylinderGeometry(0.35, 0.3, 1.8, 8)
      const sleeveMaterial = new THREE.MeshStandardMaterial({
        color: sleeveColor,
        roughness: 0.6,
      })

      const leftSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial)
      leftSleeve.position.set(-1.4, 0.5, 0)
      leftSleeve.rotation.z = Math.PI / 2
      parts["sleeve_left"] = leftSleeve
      meshRef.current.add(leftSleeve)

      const rightSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial)
      rightSleeve.position.set(1.4, 0.5, 0)
      rightSleeve.rotation.z = -Math.PI / 2
      parts["sleeve_right"] = rightSleeve
      meshRef.current.add(rightSleeve)
    }

    setModelParts(parts)
  }, [modelType, customizations])

  // Apply ALL customizations and layer controls
  useEffect(() => {
    Object.entries(modelParts).forEach(([partName, mesh]) => {
      // Default to visible
      mesh.visible = true

      // Apply layer controls from customizations
      Object.entries(customizations).forEach(([customKey, customValue]) => {
        // Handle collar styles
        if (customKey === "collarstyle") {
          if (partName.includes("collar_")) {
            mesh.visible = partName.includes(`collar_€{customValue}`)
          }
        }

        // Handle cuff styles
        if (customKey === "cuffstyle") {
          if (partName.includes("cuff_")) {
            mesh.visible = partName.includes(`cuff_€{customValue}`)
          }
        }

        // Handle pocket styles
        if (customKey === "pocketstyle") {
          if (partName.includes("pocket")) {
            if (customValue === "none") {
              mesh.visible = false
            } else {
              mesh.visible = partName.includes(`pocket_€{customValue}`) || partName.includes(`pockets_€{customValue}`)
            }
          }
        }

        // Handle button styles
        if (customKey === "buttonstyle") {
          if (partName.includes("buttons_")) {
            mesh.visible = partName.includes(`buttons_€{customValue}`)
          }
        }

        // Handle monogram
        if (customKey === "monogram") {
          if (partName.includes("monogram_")) {
            if (customValue === "none") {
              mesh.visible = false
            } else {
              mesh.visible = partName.includes(`monogram_€{customValue}`)
            }
          }
        }

        // Handle fit styles (already handled in geometry creation)
        // Handle waistband styles (already handled in geometry creation)
        // Handle hem styles
        if (customKey === "hemstyle") {
          if (partName.includes("hem_")) {
            mesh.visible = partName.includes(`hem_€{customValue}`)
          }
        }

        // Handle belt loops
        if (customKey === "beltloops") {
          if (partName.includes("belt_loops_")) {
            if (customValue === "none") {
              mesh.visible = false
            } else {
              mesh.visible = partName.includes(`belt_loops_€{customValue}`)
            }
          }
        }

        // Handle lapel styles
        if (customKey === "lapelstyle") {
          if (partName.includes("lapel_")) {
            mesh.visible = partName.includes(`lapel_€{customValue}`)
          }
        }

        // Handle button count and configuration
        if (customKey === "buttoncount" || customKey === "buttonConfiguration") {
          if (partName.includes("buttons_")) {
            // Handle both old format (buttoncount) and new format (buttonConfiguration)
            let shouldShow = false
            if (customKey === "buttoncount") {
              shouldShow = partName.includes(`buttons_€{customValue}`)
            } else if (customKey === "buttonConfiguration") {
              // Extract number from buttonConfiguration (e.g., "one-button" -> "one")
              const configMap: Record<string, string> = {
                "one-button": "one",
                "two-button": "two", 
                "three-button": "three",
                "four-button": "four"
              }
              const buttonType = configMap[customValue] || "two"
              shouldShow = partName.includes(`buttons_€{buttonType}`)
            }
            mesh.visible = shouldShow
          }
        }

        // Handle vent styles
        if (customKey === "ventstyle") {
          if (partName.includes("vent_")) {
            if (customValue === "none") {
              mesh.visible = false
            } else {
              mesh.visible = partName.includes(`vent_€{customValue}`)
            }
          }
        }
      })
    })
  }, [modelParts, customizations])

  // Rotate model slowly
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.2) * 0.1
    }
  })

  return <group ref={meshRef} />
}

// Camera controller
function CameraController() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 2, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

export function ModelViewer({
  modelUrl,
  customizations = {},
  layerControls = {},
  className = "w-full h-full",
  useGLTF = false,
  gltfModelPath,
  useStandardJacket = false,
  useModularJacket = true, // Default to modular jacket for jackets
}: ModelViewerProps) {
  const [error, setError] = useState<string | null>(null)

  // Map model URLs to types
  const getModelType = (url: string) => {
    if (url.includes("pants")) return "sample-pants"
    if (url.includes("jacket")) return "sample-jacket"
    return "sample-shirt"
  }

  const modelType = getModelType(modelUrl)

  // If using modular jacket system (NEW - for your component-based jackets)
  if (useModularJacket && modelType === "sample-jacket") {
    const basicCustomizations: BasicJacketCustomization = {
      fabricColor: customizations.fabricColor || customizations.color || "#000080",
      fabricType: customizations.fabricType || "wool",
      buttonColor: customizations.buttonColor || "#333333",
      threadColor: customizations.threadColor || "#000000",
      liningColor: customizations.liningColor,
      frontStyle: customizations.frontStyle as "2button" | "3button" | "6d2" | undefined,
      frontPocket: customizations.frontPocket || customizations.front_pocket || customizations["front-pocket"],
      chestPocket: customizations.chestPocket || customizations.chest_pocket || customizations["chest-pocket"],
      sleeveButtons: customizations.sleeveButtons || customizations.sleeve_buttons || customizations["jacket-sleeve-buttons"],
      ventStyle: customizations.ventStyle || customizations.vent_style || customizations["jacket-vent-style"],
    }

    // Extract frontStyle from customizations, default to 2button
    const frontStyle = (customizations.frontStyle || "2button") as "2button" | "3button" | "6d2"
    
    console.log("🎨 ModelViewer passing to ModularJacketViewerR3F:", {
      frontStyle,
      frontStyleFromCustomizations: customizations.frontStyle,
      frontPocket: basicCustomizations.frontPocket,
      chestPocket: basicCustomizations.chestPocket,
      sleeveButtons: basicCustomizations.sleeveButtons,
      ventStyle: basicCustomizations.ventStyle,
      allPocketVariations: {
        frontPocket: customizations.frontPocket,
        front_pocket: customizations.front_pocket,
        "front-pocket": customizations["front-pocket"]
      },
      allCustomizationsReceived: customizations,
      basicCustomizations
    })

    console.log("⚠️ CRITICAL: Is frontPocket defined?", basicCustomizations.frontPocket !== undefined)
    console.log("⚠️ CRITICAL: frontPocket value:", basicCustomizations.frontPocket)
    console.log("⚠️ CRITICAL: sleeveButtons value:", basicCustomizations.sleeveButtons)
    console.log("⚠️ CRITICAL: ventStyle value:", basicCustomizations.ventStyle)

    return (
      <ModularJacketViewerR3F
        customizations={basicCustomizations}
        frontStyle={frontStyle}
        className={className}
      />
    )
  }

  // If using standard jacket (for single GLTF testing)
  if (useStandardJacket && modelType === "sample-jacket" && gltfModelPath) {
    const basicCustomizations: BasicJacketCustomization = {
      fabricColor: customizations.fabricColor || customizations.color,
      fabricType: customizations.fabricType,
      buttonColor: customizations.buttonColor || "#333333",
      liningColor: customizations.liningColor,
    }

    return (
      <StandardJacketViewer
        modelPath={gltfModelPath}
        customizations={basicCustomizations}
        className={className}
      />
    )
  }

  // If GLTF is enabled and we have a jacket, use advanced GLTF viewer
  if (useGLTF && modelType === "sample-jacket" && gltfModelPath) {
    // Convert customizations to JacketCustomization format
    const jacketCustomizations: JacketCustomization = {
      fabricColor: customizations.fabricColor || customizations.color,
      fabricType: customizations.fabricType,
      lapelStyle: customizations.lapelStyle,
      sleeveStyle: customizations.sleeveStyle,
      frontStyle: customizations.frontStyle,
      pocketStyle: customizations.pocketStyle,
      buttonStyle: customizations.buttonStyle,
      collarStyle: customizations.collarStyle,
      liningColor: customizations.liningColor,
      ventStyle: customizations.ventStyle,
    }

    return (
      <GLTFModelViewer
        modelPath={gltfModelPath}
        customizations={jacketCustomizations}
        className={className}
        fallbackToGeometry={true}
      />
    )
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <div className="text-gray-600">Failed to load 3D model</div>
          <div className="text-sm text-gray-500 mt-2">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <Canvas
        shadows
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ background: "linear-gradient(to bottom, #f8fafc, #e2e8f0)" }}
      >
        <CameraController />

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Environment */}
        <Environment preset="studio" />

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
        />

        {/* 3D Model */}
        <Suspense fallback={null}>
          <CustomizableModel modelType={modelType} customizations={customizations} layerControls={layerControls} />
        </Suspense>

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.1} />
        </mesh>
      </Canvas>
    </div>
  )
}
