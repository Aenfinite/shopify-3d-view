"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Type, Palette, MapPin } from "lucide-react"

interface MonogramConfig {
  text: string
  position: string
  style: string
  color: string
}

interface MonogramConfiguratorProps {
  selectedMonogram: string
  selectedStyle: string
  selectedColor: string
  monogramText: string
  onMonogramChange: (config: MonogramConfig) => void
}

export function MonogramConfigurator({
  selectedMonogram,
  selectedStyle,
  selectedColor,
  monogramText,
  onMonogramChange
}: MonogramConfiguratorProps) {
  const [localText, setLocalText] = useState(monogramText || "")
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)

  const monogramPositions = [
    { id: "no-monogram", name: "No Monogram", description: "Skip embroidered monogram", price: 0 },
    { id: "chest", name: "Chest", description: "Left chest area", price: 25 },
    { id: "inside-pocket", name: "Inside Pocket", description: "Interior pocket", price: 20 },
    { id: "cuff", name: "Cuff", description: "Sleeve cuff", price: 30 },
    { id: "lining", name: "Lining", description: "Interior lining", price: 35 },
  ]

  const monogramStyles = [
    { id: "classic-serif", name: "Classic Serif", preview: "ABC" },
    { id: "modern-sans", name: "Modern Sans", preview: "ABC" },
    { id: "script-elegant", name: "Elegant Script", preview: "ABC" },
    { id: "block-bold", name: "Bold Block", preview: "ABC" },
    { id: "vintage-ornate", name: "Vintage Ornate", preview: "ABC" },
  ]

  const threadColors = [
    { id: "navy", name: "Navy", color: "#1565C0" },
    { id: "black", name: "Black", color: "#000000" },
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "gold", name: "Gold", color: "#FFD700" },
    { id: "silver", name: "Silver", color: "#C0C0C0" },
    { id: "burgundy", name: "Burgundy", color: "#8E24AA" },
    { id: "forest", name: "Forest Green", color: "#2E7D32" },
    { id: "royal-blue", name: "Royal Blue", color: "#4169E1" },
  ]

  useEffect(() => {
    if (localText && selectedMonogram !== "no-monogram") {
      onMonogramChange({
        text: localText,
        position: selectedMonogram,
        style: selectedStyle,
        color: selectedColor
      })
    }
  }, [localText, selectedMonogram, selectedStyle, selectedColor, onMonogramChange])

  const getStyleFont = (styleId: string) => {
    switch (styleId) {
      case "classic-serif": return "font-serif"
      case "modern-sans": return "font-sans"
      case "script-elegant": return "font-serif italic"
      case "block-bold": return "font-sans font-bold"
      case "vintage-ornate": return "font-serif font-semibold"
      default: return "font-serif"
    }
  }

  const getSelectedColor = () => {
    const color = threadColors.find(c => c.id === selectedColor)
    return color?.color || "#1565C0"
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="w-5 h-5" />
          Monogram Customization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Position Selection - Always Show First */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Monogram Options
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {monogramPositions.map((position) => (
              <div
                key={position.id}
                onClick={() => onMonogramChange({
                  text: localText,
                  position: position.id,
                  style: selectedStyle,
                  color: selectedColor
                })}
                className={`p-3 border rounded-lg cursor-pointer transition-all €{
                  selectedMonogram === position.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{position.name}</div>
                    <div className="text-sm text-gray-500">{position.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {position.price > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +€{position.price}
                      </Badge>
                    )}
                    {selectedMonogram === position.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Show monogram customization options only if a position other than "no-monogram" is selected */}
        {selectedMonogram !== "no-monogram" && (
          <>
            {/* Text Input */}
            <div className="space-y-2">
              <Label htmlFor="monogram-text">Monogram Text</Label>
              <Input
                id="monogram-text"
                placeholder="Enter 1-4 characters (e.g., JDM, AB, etc.)"
                value={localText}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().slice(0, 4)
                  setLocalText(value)
                }}
                maxLength={4}
                className="text-center font-semibold text-lg"
              />
              <p className="text-sm text-gray-500">
                Enter your initials or preferred text (maximum 4 characters)
              </p>
            </div>

            {/* Style Selection */}
            <div className="space-y-3">
              <Label>Font Style</Label>
              <div className="grid grid-cols-1 gap-2">
                {monogramStyles.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => onMonogramChange({
                      text: localText,
                      position: selectedMonogram,
                      style: style.id,
                      color: selectedColor
                    })}
                    className={`p-3 border rounded-lg cursor-pointer transition-all €{
                      selectedStyle === style.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{style.name}</span>
                      <span 
                        className={`text-2xl €{getStyleFont(style.id)}`}
                        style={{ color: getSelectedColor() }}
                      >
                        {localText || style.preview}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Thread Color
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {threadColors.map((color) => (
                  <div
                    key={color.id}
                    onClick={() => onMonogramChange({
                      text: localText,
                      position: selectedMonogram,
                      style: selectedStyle,
                      color: color.id
                    })}
                    className={`p-2 border rounded-lg cursor-pointer transition-all €{
                      selectedColor === color.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.color }}
                      ></div>
                      <span className="text-sm">{color.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            {localText && (
              <div className="space-y-3">
                <Label>Embroidery Preview</Label>
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="bg-white rounded-lg p-6 shadow-sm inline-block">
                    <div className="text-sm text-gray-500 mb-2">
                      {monogramPositions.find(p => p.id === selectedMonogram)?.name} Monogram
                    </div>
                    <div 
                      className={`text-4xl €{getStyleFont(selectedStyle)}`}
                      style={{ 
                        color: getSelectedColor(),
                        textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
                      }}
                    >
                      {localText}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Embroidered with {threadColors.find(c => c.id === selectedColor)?.name} thread
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            {localText && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Monogram Summary</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>Text: <span className="font-semibold">{localText}</span></div>
                  <div>Position: <span className="font-semibold">
                    {monogramPositions.find(p => p.id === selectedMonogram)?.name}
                  </span></div>
                  <div>Style: <span className="font-semibold">
                    {monogramStyles.find(s => s.id === selectedStyle)?.name}
                  </span></div>
                  <div>Thread Color: <span className="font-semibold">
                    {threadColors.find(c => c.id === selectedColor)?.name}
                  </span></div>
                  <div className="pt-2 border-t border-blue-200">
                    Additional Cost: <span className="font-semibold">
                      €{monogramPositions.find(p => p.id === selectedMonogram)?.price || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Show message when no monogram is selected */}
        {selectedMonogram === "no-monogram" && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Type className="w-12 h-12 mx-auto mb-2 opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Monogram Selected</h3>
            <p className="text-sm text-gray-500">
              Choose a position above to add a personalized embroidered monogram to your garment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
