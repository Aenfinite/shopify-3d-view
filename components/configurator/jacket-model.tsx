"use client"

import { useConfigurator } from "@/context/configurator-context"
import { useJacketStyle } from "@/lib/3d/modular-jacket-loader"
import { Group } from "three"
import { useRef, useEffect } from "react"

export function JacketModel() {
  const { frontStyle, jacketCustomizations } = useConfigurator()
  const groupRef = useRef<Group>(null)
  
  // Load jacket parts based on selected style
  const parts = useJacketStyle(frontStyle, jacketCustomizations)
  
  useEffect(() => {
    if (!groupRef.current) return
    
    console.log(`🔄 Updating jacket model for style: ${frontStyle}`)
    console.log('Current customizations:', jacketCustomizations)
    
    // Clear existing model
    while (groupRef.current.children.length > 0) {
      const removedChild = groupRef.current.children[0]
      console.log(`🗑️ Removing part:`, removedChild.name)
      groupRef.current.remove(removedChild)
    }
    
    // Add new parts
    Object.entries(parts).forEach(([name, part]) => {
      if (part) {
        console.log(`➕ Adding part: ${name}`)
        groupRef.current?.add(part)
      } else {
        console.warn(`⚠️ Missing part: ${name}`)
      }
    })
    
    console.log('✅ Model update complete')
  }, [parts, frontStyle])

  return <group ref={groupRef} position={[0, -1, 0]} scale={0.01} />
}