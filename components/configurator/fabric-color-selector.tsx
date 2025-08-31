"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Palette, ArrowLeft } from "lucide-react"

interface FabricColorSelectorProps {
  selectedFabricType: string
  selectedColor: string
  onColorSelect: (colorId: string, price: number) => void
  onBack: () => void
  availableColors: Array<{
    id: string
    name: string
    hex: string
    fabrics: string[]
  }>
}

export function FabricColorSelector({ 
  selectedFabricType, 
  selectedColor, 
  onColorSelect, 
  onBack,
  availableColors 
}: FabricColorSelectorProps) {
  const [filteredColors, setFilteredColors] = useState<typeof availableColors>([])

  // Filter colors based on selected fabric type
  useEffect(() => {
    const filtered = availableColors.filter(color => 
      color.fabrics.includes(selectedFabricType)
    )
    setFilteredColors(filtered)
  }, [selectedFabricType, availableColors])

  // Get fabric type name for display
  const getFabricTypeName = (fabricId: string) => {
    const fabricNames: Record<string, string> = {
      'wool-blend': 'Wool Blend',
      'premium-wool': 'Premium Wool',
      'cashmere-blend': 'Cashmere Blend',
      'summer-wool': 'Summer Wool',
      'tweed': 'Tweed',
      'linen-blend': 'Linen Blend'
    }
    return fabricNames[fabricId] || fabricId
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fabric Type
        </Button>
        <Badge variant="secondary" className="text-sm">
          {getFabricTypeName(selectedFabricType)}
        </Badge>
      </div>

      {/* Color Selection Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Palette className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Choose Your Color
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Available colors for {getFabricTypeName(selectedFabricType)}
        </p>
      </div>

      {/* Available Colors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredColors.map((color) => (
          <Card
            key={color.id}
            onClick={() => onColorSelect(color.id, 0)}
            className={`cursor-pointer transition-all hover:shadow-lg group €{
              selectedColor === color.id
                ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <CardContent className="p-4 text-center">
              {/* Color Swatch */}
              <div 
                className={`
                  w-16 h-16 mx-auto rounded-full border-2 mb-3 transition-all
                  €{selectedColor === color.id 
                    ? "border-blue-500 scale-110" 
                    : "border-gray-300 group-hover:border-gray-400"
                  }
                  flex items-center justify-center
                `}
                style={{ backgroundColor: color.hex }}
              >
                {selectedColor === color.id && (
                  <Check className="w-6 h-6 text-white drop-shadow-lg" />
                )}
              </div>

              {/* Color Name */}
              <h4 className="font-medium text-gray-900 mb-1">
                {color.name}
              </h4>

              {/* Selection Indicator */}
              {selectedColor === color.id && (
                <Badge variant="default" className="text-xs">
                  Selected
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fabric + Color Summary */}
      {selectedColor && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base text-blue-900">
              Your Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-blue-300"
                  style={{ 
                    backgroundColor: filteredColors.find(c => c.id === selectedColor)?.hex 
                  }}
                />
                <div>
                  <p className="font-medium text-blue-900">
                    {filteredColors.find(c => c.id === selectedColor)?.name}
                  </p>
                  <p className="text-sm text-blue-700">
                    {getFabricTypeName(selectedFabricType)}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-blue-800 border-blue-300">
                Perfect Match
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          <strong>Pro Tip:</strong> Each fabric type has carefully curated colors that 
          work best with that material's texture and weight. These combinations have been 
          selected by our master tailors for optimal appearance and style.
        </p>
      </div>
    </div>
  )
}
