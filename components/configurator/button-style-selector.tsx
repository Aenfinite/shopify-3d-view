"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Circle, Square, Gem, Disc } from "lucide-react"

interface ButtonStyleSelectorProps {
  selectedStyle: string
  selectedColor: string
  selectedMaterial: string
  onStyleChange: (styleId: string) => void
  onColorChange: (colorId: string) => void
}

export function ButtonStyleSelector({
  selectedStyle,
  selectedColor,
  selectedMaterial,
  onStyleChange,
  onColorChange
}: ButtonStyleSelectorProps) {
  
  const buttonStyles = [
    { 
      id: "classic-round", 
      name: "Classic Round", 
      price: 0, 
      icon: Circle,
      description: "Traditional round button with smooth edges"
    },
    { 
      id: "beveled-edge", 
      name: "Beveled Edge", 
      price: 5, 
      icon: Disc,
      description: "Round button with angled edge detail"
    },
    { 
      id: "flat-modern", 
      name: "Flat Modern", 
      price: 8, 
      icon: Circle,
      description: "Contemporary flat-face design"
    },
    { 
      id: "domed", 
      name: "Domed", 
      price: 10, 
      icon: Circle,
      description: "Raised center with curved profile"
    },
    { 
      id: "vintage-shank", 
      name: "Vintage Shank", 
      price: 15, 
      icon: Gem,
      description: "Classic shank-back design"
    },
    { 
      id: "square-modern", 
      name: "Square Modern", 
      price: 12, 
      icon: Square,
      description: "Contemporary square shape"
    },
  ]

  const buttonColors = [
    { id: "natural", name: "Natural", color: "#F5E6D3", price: 0 },
    { id: "dark-brown", name: "Dark Brown", color: "#4A2C2A", price: 5 },
    { id: "black", name: "Black", color: "#1A1A1A", price: 5 },
    { id: "navy", name: "Navy", color: "#1565C0", price: 5 },
    { id: "gold", name: "Gold", color: "#FFD700", price: 15 },
    { id: "silver", name: "Silver", color: "#C0C0C0", price: 12 },
    { id: "bronze", name: "Bronze", color: "#CD7F32", price: 12 },
    { id: "pearl-white", name: "Pearl White", color: "#F8F8FF", price: 10 },
  ]

  const getSelectedColor = () => {
    const color = buttonColors.find(c => c.id === selectedColor)
    return color?.color || "#F5E6D3"
  }

  const getButtonStylePreview = (styleId: string) => {
    const color = getSelectedColor()
    const baseStyle = "transition-all duration-200"
    
    switch (styleId) {
      case "classic-round":
        return (
          <div 
            className={`w-8 h-8 rounded-full €{baseStyle}`}
            style={{ 
              backgroundColor: color,
              border: `2px solid €{color}`,
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)"
            }}
          />
        )
      case "beveled-edge":
        return (
          <div 
            className={`w-8 h-8 rounded-full €{baseStyle}`}
            style={{ 
              backgroundColor: color,
              border: `3px solid €{color}`,
              borderTopColor: "rgba(255,255,255,0.3)",
              borderLeftColor: "rgba(255,255,255,0.3)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
            }}
          />
        )
      case "flat-modern":
        return (
          <div 
            className={`w-8 h-8 rounded-full €{baseStyle}`}
            style={{ 
              backgroundColor: color,
              border: `1px solid €{color}`
            }}
          />
        )
      case "domed":
        return (
          <div 
            className={`w-8 h-8 rounded-full €{baseStyle}`}
            style={{ 
              backgroundColor: color,
              border: `2px solid €{color}`,
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), €{color})`
            }}
          />
        )
      case "vintage-shank":
        return (
          <div 
            className={`w-8 h-8 rounded-full €{baseStyle} relative`}
            style={{ 
              backgroundColor: color,
              border: `2px solid €{color}`,
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)"
            }}
          >
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
            />
          </div>
        )
      case "square-modern":
        return (
          <div 
            className={`w-8 h-8 rounded-sm €{baseStyle}`}
            style={{ 
              backgroundColor: color,
              border: `1px solid €{color}`
            }}
          />
        )
      default:
        return (
          <div 
            className={`w-8 h-8 rounded-full €{baseStyle}`}
            style={{ backgroundColor: color }}
          />
        )
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Circle className="w-5 h-5" />
          Button Customization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Button Style Selection */}
        <div className="space-y-3">
          <Label>Button Style</Label>
          <div className="grid grid-cols-1 gap-3">
            {buttonStyles.map((style) => {
              const IconComponent = style.icon
              return (
                <div
                  key={style.id}
                  onClick={() => onStyleChange(style.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all €{
                    selectedStyle === style.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                        {getButtonStylePreview(style.id)}
                      </div>
                      <div>
                        <div className="font-medium">{style.name}</div>
                        <div className="text-sm text-gray-500">{style.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {style.price > 0 && (
                        <Badge variant="secondary">+€{style.price}</Badge>
                      )}
                      {selectedStyle === style.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Button Color Selection */}
        <div className="space-y-3">
          <Label>Button Color</Label>
          <div className="grid grid-cols-2 gap-3">
            {buttonColors.map((color) => (
              <div
                key={color.id}
                onClick={() => onColorChange(color.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-all €{
                  selectedColor === color.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.color }}
                    />
                    <span className="font-medium">{color.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {color.price > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +€{color.price}
                      </Badge>
                    )}
                    {selectedColor === color.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Button Preview */}
        <div className="space-y-3">
          <Label>Button Preview</Label>
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm inline-block">
              <div className="text-sm text-gray-500 mb-4">Selected Button Style</div>
              <div className="flex items-center justify-center gap-4">
                {/* Show 3 buttons as they would appear on jacket */}
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex flex-col items-center gap-2">
                    {getButtonStylePreview(selectedStyle)}
                    <div className="text-xs text-gray-400">Button {num}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-4">
                {buttonStyles.find(s => s.id === selectedStyle)?.name} - {buttonColors.find(c => c.id === selectedColor)?.name}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Button Summary</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>Style: <span className="font-semibold">
              {buttonStyles.find(s => s.id === selectedStyle)?.name}
            </span></div>
            <div>Color: <span className="font-semibold">
              {buttonColors.find(c => c.id === selectedColor)?.name}
            </span></div>
            <div>Material: <span className="font-semibold capitalize">
              {selectedMaterial.replace("-", " ")}
            </span></div>
            <div className="pt-2 border-t border-blue-200">
              Additional Cost: <span className="font-semibold">
                €{(buttonStyles.find(s => s.id === selectedStyle)?.price || 0) + 
                  (buttonColors.find(c => c.id === selectedColor)?.price || 0)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
