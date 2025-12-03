"use client"

import { useState } from "react"
import { BasicJacketCustomization } from "@/lib/3d/modular-jacket-loader"

interface FabricColorControllerProps {
  onCustomizationChange: (customizations: BasicJacketCustomization) => void
  className?: string
}

// Predefined fabric colors for quick selection
const fabricColors = [
  { name: "Navy Blue", color: "#1a237e", category: "classic" },
  { name: "Charcoal Gray", color: "#2c2c2c", category: "classic" },
  { name: "Black", color: "#000000", category: "classic" },
  { name: "Midnight Blue", color: "#0d47a1", category: "classic" },
  { name: "Deep Brown", color: "#3e2723", category: "classic" },
  { name: "Forest Green", color: "#1b5e20", category: "modern" },
  { name: "Burgundy", color: "#4a148c", category: "modern" },
  { name: "Steel Blue", color: "#37474f", category: "modern" },
  { name: "Olive Green", color: "#33691e", category: "modern" },
  { name: "Wine Red", color: "#b71c1c", category: "bold" },
  { name: "Royal Purple", color: "#4a148c", category: "bold" },
  { name: "Deep Emerald", color: "#004d40", category: "bold" },
]

const buttonColors = [
  { name: "Dark Horn", color: "#2c2c2c" },
  { name: "Black", color: "#000000" },
  { name: "Silver", color: "#757575" },
  { name: "Gold", color: "#ffc107" },
  { name: "Bronze", color: "#8d6e63" },
]

const threadColors = [
  { name: "Matching", color: "match" },
  { name: "Contrast Dark", color: "#1a1a1a" },
  { name: "Navy", color: "#0d47a1" },
  { name: "Black", color: "#000000" },
  { name: "Gold", color: "#ffc107" },
]

export default function FabricColorController({ 
  onCustomizationChange, 
  className = "" 
}: FabricColorControllerProps) {
  const [selectedFabric, setSelectedFabric] = useState(fabricColors[0])
  const [selectedButton, setSelectedButton] = useState(buttonColors[0])
  const [selectedThread, setSelectedThread] = useState(threadColors[0])
  const [activeCategory, setActiveCategory] = useState<string>("classic")

  const handleFabricChange = (fabric: typeof fabricColors[0]) => {
    setSelectedFabric(fabric)
    updateCustomizations(fabric.color, selectedButton.color, selectedThread.color)
  }

  const handleButtonChange = (button: typeof buttonColors[0]) => {
    setSelectedButton(button)
    // Thread always matches fabric, not button
    updateCustomizations(selectedFabric.color, button.color, selectedFabric.color)
  }

  const handleThreadChange = (thread: typeof threadColors[0]) => {
    setSelectedThread(thread)
    const threadColor = thread.color === "match" ? selectedFabric.color : thread.color
    updateCustomizations(selectedFabric.color, selectedButton.color, threadColor)
  }

  const updateCustomizations = (fabricColor: string, buttonColor: string, threadColor: string) => {
    const customizations: BasicJacketCustomization = {
      fabricColor,
      buttonColor,
      threadColor: fabricColor, // Thread ALWAYS matches fabric color
      fabricType: "wool", // Default fabric type
    }
    console.log('🎨 Sending customizations:', customizations)
    onCustomizationChange(customizations)
  }

  const filteredFabricColors = fabricColors.filter(fabric => 
    activeCategory === "all" || fabric.category === activeCategory
  )

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Customize Your Jacket</h3>
      
      {/* Fabric Color Selection */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Fabric Color</h4>
        
        {/* Category Filter */}
        <div className="flex gap-2 mb-3">
          {["classic", "modern", "bold"].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Color Grid */}
        <div className="grid grid-cols-4 gap-3">
          {filteredFabricColors.map((fabric) => (
            <button
              key={fabric.name}
              onClick={() => handleFabricChange(fabric)}
              className={`relative w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                selectedFabric.color === fabric.color
                  ? "border-blue-600 ring-2 ring-blue-200"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ backgroundColor: fabric.color }}
              title={fabric.name}
            >
              {selectedFabric.color === fabric.color && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full border border-gray-300"></div>
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">Selected: {selectedFabric.name}</p>
      </div>

      {/* Button Color Selection */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Button Color</h4>
        <div className="flex gap-3">
          {buttonColors.map((button) => (
            <button
              key={button.name}
              onClick={() => handleButtonChange(button)}
              className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-105 ${
                selectedButton.color === button.color
                  ? "border-blue-600 ring-2 ring-blue-200"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ backgroundColor: button.color }}
              title={button.name}
            >
              {selectedButton.color === button.color && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full border border-gray-300"></div>
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">Selected: {selectedButton.name}</p>
      </div>

      {/* Thread Color Selection */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-3">Thread Color</h4>
        <div className="flex gap-3">
          {threadColors.map((thread) => (
            <button
              key={thread.name}
              onClick={() => handleThreadChange(thread)}
              className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                selectedThread.color === thread.color
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400 text-gray-700"
              }`}
            >
              {thread.name}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">Selected: {selectedThread.name}</p>
      </div>

      {/* Real-time Preview Info */}
      <div className="bg-gray-50 rounded-lg p-3 mt-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Real-time Preview:</span> Changes apply instantly to your 3D jacket model
        </p>
      </div>
    </div>
  )
}