"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Palette, Check } from "lucide-react"

interface FabricOption {
  id: string
  name: string
  value: string
  price: number
  color?: string
  thumbnail?: string
}

interface FabricSelectorProps {
  selectedFabricColor: string
  selectedFabricType: string
  onFabricColorChange: (colorId: string) => void
  onFabricTypeChange: (typeId: string) => void
}

export function FabricSelector({ 
  selectedFabricColor, 
  selectedFabricType, 
  onFabricColorChange, 
  onFabricTypeChange 
}: FabricSelectorProps) {
  // Fabric colors from your actual product data
  const fabricColors: FabricOption[] = [
    { id: "white", name: "White", value: "#FFFFFF", price: 0, color: "#FFFFFF" },
    { id: "light-blue", name: "Light Blue", value: "#E3F2FD", price: 0, color: "#E3F2FD" },
    { id: "navy", name: "Navy", value: "#1565C0", price: 5, color: "#1565C0" },
    { id: "charcoal", name: "Charcoal", value: "#424242", price: 5, color: "#424242" },
    { id: "burgundy", name: "Burgundy", value: "#8E24AA", price: 10, color: "#8E24AA" },
    { id: "forest", name: "Forest Green", value: "#2E7D32", price: 10, color: "#2E7D32" },
    { id: "cream", name: "Cream", value: "#FFF8E1", price: 0, color: "#FFF8E1" },
    { id: "pink", name: "Pink", value: "#F8BBD9", price: 5, color: "#F8BBD9" },
  ]

  // Fabric types from your actual product data
  const fabricTypes: FabricOption[] = [
    { id: "cotton", name: "Cotton", value: "cotton", price: 0 },
    { id: "linen", name: "Linen", value: "linen", price: 15 },
    { id: "silk", name: "Silk", value: "silk", price: 50 },
    { id: "wool", name: "Wool", value: "wool", price: 25 },
    { id: "cashmere", name: "Cashmere", value: "cashmere", price: 100 },
  ]

  return (
    <div className="space-y-6">
      {/* Fabric Color Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-gray-600" />
          <Label className="text-lg font-medium">Fabric Color</Label>
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {fabricColors.map((color) => (
            <div
              key={color.id}
              onClick={() => onFabricColorChange(color.id)}
              className="cursor-pointer group"
            >
              <div
                className={`
                  w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all
                  €{selectedFabricColor === color.id 
                    ? "border-blue-500 shadow-lg scale-110" 
                    : "border-gray-300 hover:border-gray-400 hover:scale-105"
                  }
                `}
                style={{ backgroundColor: color.color }}
              >
                {selectedFabricColor === color.id && (
                  <Check className="w-4 h-4 text-white drop-shadow-lg" />
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                  {color.name}
                </p>
                {color.price > 0 && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    +€{color.price}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fabric Type Selection */}
      <div>
        <Label className="text-lg font-medium mb-4 block">Fabric Type</Label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fabricTypes.map((fabric) => (
            <Card
              key={fabric.id}
              onClick={() => onFabricTypeChange(fabric.id)}
              className={`cursor-pointer transition-all hover:shadow-md €{
                selectedFabricType === fabric.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{fabric.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{fabric.value}</p>
                  </div>
                  <div className="text-right">
                    {fabric.price > 0 ? (
                      <Badge variant="outline" className="text-xs">
                        +€{fabric.price}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Included
                      </Badge>
                    )}
                  </div>
                </div>
                
                {selectedFabricType === fabric.id && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Your Fabric Selection</h4>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: fabricColors.find(c => c.id === selectedFabricColor)?.color }}
            />
            <span className="text-gray-700">
              {fabricColors.find(c => c.id === selectedFabricColor)?.name}
            </span>
          </div>
          <div className="text-gray-400">•</div>
          <span className="text-gray-700">
            {fabricTypes.find(f => f.id === selectedFabricType)?.name}
          </span>
        </div>
      </div>
    </div>
  )
}
