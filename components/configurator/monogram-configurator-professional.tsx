"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Type, Palette, MapPin, Upload, X, Check } from "lucide-react"

interface MonogramConfig {
  text: string
  position: string
  style: string
  color: string
  customColorImage?: string
}

interface MonogramConfiguratorProps {
  selectedMonogram: string
  selectedStyle: string
  selectedColor: string
  monogramText: string
  onMonogramChange: (config: MonogramConfig) => void
}

interface ThreadColor {
  id: string
  name: string
  color: string
  image?: string
}

export function MonogramConfigurator({
  selectedMonogram,
  selectedStyle,
  selectedColor,
  monogramText,
  onMonogramChange
}: MonogramConfiguratorProps) {
  const [localText, setLocalText] = useState(monogramText || "")
  const [customColors, setCustomColors] = useState<ThreadColor[]>([])
  const [uploadingColor, setUploadingColor] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const monogramPositions = [
    { id: "no-monogram", name: "No Monogram", description: "Skip embroidered monogram", price: 0 },
    { id: "chest", name: "Left Chest", description: "Above pocket area", price: 25 },
    { id: "inside-pocket", name: "Inside Pocket", description: "Interior pocket lining", price: 20 },
    { id: "cuff", name: "Sleeve Cuff", description: "Right sleeve cuff", price: 30 },
    { id: "lining", name: "Collar Lining", description: "Interior collar", price: 35 },
  ]

  const monogramStyles = [
    { id: "classic-serif", name: "Classic Serif", preview: "ABC", description: "Traditional serif font" },
    { id: "modern-sans", name: "Modern Sans", preview: "ABC", description: "Clean sans-serif style" },
    { id: "script-elegant", name: "Elegant Script", preview: "ABC", description: "Flowing script lettering" },
    { id: "block-bold", name: "Bold Block", preview: "ABC", description: "Strong block letters" },
    { id: "vintage-ornate", name: "Vintage Ornate", preview: "ABC", description: "Decorative vintage style" },
  ]

  // Professional thread colors based on your product data
  const defaultThreadColors: ThreadColor[] = [
    { id: "navy", name: "Navy Blue", color: "#1565C0" },
    { id: "black", name: "Black", color: "#000000" },
    { id: "white", name: "White", color: "#FFFFFF" },
    { id: "gold", name: "Metallic Gold", color: "#FFD700" },
    { id: "silver", name: "Metallic Silver", color: "#C0C0C0" },
    { id: "burgundy", name: "Burgundy", color: "#8E24AA" },
    { id: "forest", name: "Forest Green", color: "#2E7D32" },
    { id: "royal-blue", name: "Royal Blue", color: "#4169E1" },
    { id: "copper", name: "Copper", color: "#B87333" },
    { id: "charcoal", name: "Charcoal", color: "#424242" },
  ]

  const allThreadColors = [...defaultThreadColors, ...customColors]

  useEffect(() => {
    if (localText && selectedMonogram !== "no-monogram") {
      const customColor = customColors.find(c => c.id === selectedColor)
      onMonogramChange({
        text: localText,
        position: selectedMonogram,
        style: selectedStyle,
        color: selectedColor,
        customColorImage: customColor?.image
      })
    }
  }, [localText, selectedMonogram, selectedStyle, selectedColor, customColors, onMonogramChange])

  const handleColorUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size must be less than 5MB')
      return
    }

    setUploadingColor(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      const newColorId = `custom-€{Date.now()}`
      const newCustomColor: ThreadColor = {
        id: newColorId,
        name: `Custom Color €{customColors.length + 1}`,
        color: "#000000", // Fallback color
        image: imageUrl
      }
      
      setCustomColors(prev => [...prev, newCustomColor])
      
      // Auto-select the new custom color
      onMonogramChange({
        text: localText,
        position: selectedMonogram,
        style: selectedStyle,
        color: newColorId,
        customColorImage: imageUrl
      })
      
      setUploadingColor(false)
    }
    
    reader.onerror = () => {
      alert('Error reading file')
      setUploadingColor(false)
    }
    
    reader.readAsDataURL(file)
  }

  const removeCustomColor = (colorId: string) => {
    setCustomColors(prev => prev.filter(c => c.id !== colorId))
    if (selectedColor === colorId) {
      // Reset to default color
      onMonogramChange({
        text: localText,
        position: selectedMonogram,
        style: selectedStyle,
        color: "navy"
      })
    }
  }

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
    const color = allThreadColors.find(c => c.id === selectedColor)
    return color?.color || "#1565C0"
  }

  const getSelectedColorImage = () => {
    const color = allThreadColors.find(c => c.id === selectedColor)
    return color?.image
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="w-5 h-5" />
          Monogram Embroidery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Position Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <MapPin className="w-4 h-4" />
            Placement Options
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {monogramPositions.map((position) => (
              <div
                key={position.id}
                onClick={() => onMonogramChange({
                  text: localText,
                  position: position.id,
                  style: selectedStyle,
                  color: selectedColor
                })}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md €{
                  selectedMonogram === position.id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{position.name}</div>
                    <div className="text-sm text-gray-600">{position.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {position.price > 0 && (
                      <Badge variant="outline" className="font-medium">
                        +€{position.price}
                      </Badge>
                    )}
                    {selectedMonogram === position.id && (
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                        <Check className="w-4 h-4 text-white" />
                      </div>
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
            <div className="space-y-3">
              <Label htmlFor="monogram-text" className="text-base font-medium">Monogram Text</Label>
              <Input
                id="monogram-text"
                placeholder="Enter 1-4 characters (e.g., JDM, AB)"
                value={localText}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().slice(0, 4)
                  setLocalText(value)
                }}
                maxLength={4}
                className="text-center font-bold text-xl h-12 border-2"
              />
              <p className="text-sm text-gray-600">
                Enter your initials or preferred text (maximum 4 characters)
              </p>
            </div>

            {/* Style Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Font Style</Label>
              <div className="grid grid-cols-1 gap-3">
                {monogramStyles.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => onMonogramChange({
                      text: localText,
                      position: selectedMonogram,
                      style: style.id,
                      color: selectedColor
                    })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md €{
                      selectedStyle === style.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{style.name}</div>
                        <div className="text-sm text-gray-600">{style.description}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span 
                          className={`text-3xl €{getStyleFont(style.id)}`}
                          style={{ 
                            color: getSelectedColor(),
                            textShadow: getSelectedColorImage() ? "2px 2px 4px rgba(0,0,0,0.3)" : "none"
                          }}
                        >
                          {localText || style.preview}
                        </span>
                        {selectedStyle === style.id && (
                          <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thread Color Selection */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-base font-medium">
                <Palette className="w-4 h-4" />
                Thread Color
              </Label>
              
              {/* Default Colors */}
              <div className="grid grid-cols-5 gap-3">
                {defaultThreadColors.map((color) => (
                  <div
                    key={color.id}
                    onClick={() => {
                      onMonogramChange({
                        text: localText,
                        position: selectedMonogram,
                        style: selectedStyle,
                        color: color.id
                      })
                    }}
                    className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md €{
                      selectedColor === color.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div
                        className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm"
                        style={{ backgroundColor: color.color }}
                      />
                      <span className="text-xs font-medium text-center text-gray-700">
                        {color.name}
                      </span>
                    </div>
                    {selectedColor === color.id && (
                      <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom Colors */}
              {customColors.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Custom Colors</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {customColors.map((color) => (
                      <div
                        key={color.id}
                        className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md €{
                          selectedColor === color.id
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          onClick={() => {
                            onMonogramChange({
                              text: localText,
                              position: selectedMonogram,
                              style: selectedStyle,
                              color: color.id,
                              customColorImage: color.image
                            })
                          }}
                          className="flex flex-col items-center space-y-2"
                        >
                          <div className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm overflow-hidden">
                            {color.image ? (
                              <img 
                                src={color.image} 
                                alt={color.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div style={{ backgroundColor: color.color }} className="w-full h-full" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-center text-gray-700">
                            {color.name}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeCustomColor(color.id)
                          }}
                          className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                        
                        {selectedColor === color.id && (
                          <div className="absolute -top-1 -left-1 flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Custom Color */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleColorUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingColor}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingColor ? "Uploading..." : "Upload Thread Color Image"}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Upload a photo of your thread color (JPG, PNG, max 5MB)
                </p>
              </div>
            </div>

            {/* Preview */}
            {localText && (
              <div className="bg-gray-50 p-6 rounded-lg border">
                <Label className="text-base font-medium mb-3 block">Preview</Label>
                <div className="text-center">
                  <div 
                    className={`text-6xl €{getStyleFont(selectedStyle)}`}
                    style={{ 
                      color: getSelectedColor(),
                      textShadow: getSelectedColorImage() ? "3px 3px 6px rgba(0,0,0,0.3)" : "2px 2px 4px rgba(0,0,0,0.1)"
                    }}
                  >
                    {localText}
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    {monogramPositions.find(p => p.id === selectedMonogram)?.name} • {" "}
                    {monogramStyles.find(s => s.id === selectedStyle)?.name} • {" "}
                    {allThreadColors.find(c => c.id === selectedColor)?.name}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
