"use client"

import { useState, useEffect, useCallback } from "react"
import { BasicJacketCustomization } from "@/lib/3d/modular-jacket-loader"
import { useConfigurator } from "@/context/configurator-context"

// Hook to integrate jacket customizations with the configurator context
export function useJacketConfigurator() {
  const configurator = useConfigurator()
  const [jacketCustomizations, setJacketCustomizations] = useState<BasicJacketCustomization>({
    fabricColor: "#1a237e",
    buttonColor: "#2c2c2c", 
    threadColor: "#0d47a1",
    fabricType: "wool"
  })

  // Sync fabric selection from configurator context to jacket customizations
  useEffect(() => {
    if (configurator?.selectedFabric) {
      const fabric = configurator.selectedFabric
      
      // Map fabric properties to jacket customizations
      const newCustomizations: BasicJacketCustomization = {
        ...jacketCustomizations,
        fabricColor: fabric.color || "#1a237e",
        fabricType: fabric.category === "silk" ? "silk" : 
                   fabric.category === "wool" ? "wool" : 
                   fabric.category === "cotton" ? "cotton" : "wool"
      }
      
      setJacketCustomizations(newCustomizations)
      console.log("🎨 Synced fabric from configurator:", fabric.name, fabric.color)
    }
  }, [configurator?.selectedFabric])

  // Sync style options that affect jacket appearance
  useEffect(() => {
    if (configurator?.selectedStyles) {
      const styles = configurator.selectedStyles
      const newCustomizations = { ...jacketCustomizations }
      
      // Map button style to button color based on style category
      if (styles.buttons) {
        const buttonStyle = styles.buttons
        if (buttonStyle.category.includes("gold")) {
          newCustomizations.buttonColor = "#ffc107"
        } else if (buttonStyle.category.includes("silver")) {
          newCustomizations.buttonColor = "#757575"
        } else if (buttonStyle.category.includes("black")) {
          newCustomizations.buttonColor = "#000000"
        }
      }
      
      // Map thread style to thread color based on style name
      if (styles.thread) {
        const threadStyle = styles.thread
        if (threadStyle.name.toLowerCase().includes("contrast")) {
          newCustomizations.threadColor = "#1a1a1a"
        } else if (threadStyle.name.toLowerCase().includes("matching")) {
          newCustomizations.threadColor = jacketCustomizations.fabricColor || "#0d47a1"
        }
      }
      
      setJacketCustomizations(newCustomizations)
      console.log("🎯 Synced styles from configurator:", Object.keys(styles))
    }
  }, [configurator?.selectedStyles, jacketCustomizations.fabricColor])

  // Update jacket customizations and sync back to configurator if needed
  const updateJacketCustomizations = useCallback((updates: Partial<BasicJacketCustomization>) => {
    const newCustomizations = { ...jacketCustomizations, ...updates }
    setJacketCustomizations(newCustomizations)
    
    // If we have configurator context, update it too
    if (configurator && updates.fabricColor) {
      // Find fabric with matching color and update selection
      const matchingFabric = configurator.fabrics.find(f => 
        f.color === updates.fabricColor
      )
      
      if (matchingFabric && configurator.setSelectedFabric) {
        configurator.setSelectedFabric(matchingFabric)
        console.log("🔄 Updated configurator fabric selection:", matchingFabric.name)
      }
    }
    
    console.log("✨ Updated jacket customizations:", updates)
  }, [jacketCustomizations, configurator])

  // Get current price including customizations
  const getCustomizationPrice = useCallback(() => {
    const basePrice = configurator?.currentPrice || 299
    let customizationCost = 0
    
    // Add costs for premium customizations
    if (jacketCustomizations.fabricType === "silk") customizationCost += 100
    if (jacketCustomizations.fabricType === "cashmere") customizationCost += 200
    if (jacketCustomizations.buttonColor === "#ffc107") customizationCost += 25 // Gold buttons
    
    return basePrice + customizationCost
  }, [configurator?.currentPrice, jacketCustomizations])

  return {
    jacketCustomizations,
    updateJacketCustomizations,
    getCustomizationPrice,
    isConfiguratorConnected: !!configurator,
    configuratorData: configurator
  }
}

// Utility to convert configurator fabric to jacket customization
export function fabricToJacketCustomization(fabric: any): Partial<BasicJacketCustomization> {
  return {
    fabricColor: fabric.color || "#1a237e",
    fabricType: fabric.category === "silk" ? "silk" : 
               fabric.category === "wool" ? "wool" : 
               fabric.category === "cotton" ? "cotton" : "wool"
  }
}

// Utility to convert style options to jacket customization
export function stylesToJacketCustomization(styles: Record<string, any>): Partial<BasicJacketCustomization> {
  const customizations: Partial<BasicJacketCustomization> = {}
  
  if (styles.buttons?.category?.includes("gold")) {
    customizations.buttonColor = "#ffc107"
  } else if (styles.buttons?.category?.includes("silver")) {
    customizations.buttonColor = "#757575"
  }
  
  if (styles.thread?.name?.toLowerCase().includes("contrast")) {
    customizations.threadColor = "#1a1a1a"
  }
  
  return customizations
}