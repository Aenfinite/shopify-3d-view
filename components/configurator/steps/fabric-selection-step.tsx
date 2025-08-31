"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface FabricSelectionStepProps {
  fabricType: string
  fabricColor: string
  onUpdate: (updates: any) => void
}

const FABRIC_TYPES = [
  {
    id: "cotton-poplin",
    name: "Cotton Poplin",
    description: "Classic, crisp finish",
    price: 0,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "premium-cotton",
    name: "Premium Cotton",
    description: "Soft, luxurious feel",
    price: 15,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "linen",
    name: "Linen Blend",
    description: "Breathable, casual",
    price: 25,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "silk",
    name: "Silk Blend",
    description: "Elegant, premium",
    price: 45,
    image: "/placeholder.svg?height=80&width=80",
  },
]

const FABRIC_COLORS = [
  { id: "white", name: "White", color: "#FFFFFF" },
  { id: "light-blue", name: "Light Blue", color: "#87CEEB" },
  { id: "navy", name: "Navy", color: "#000080" },
  { id: "pink", name: "Pink", color: "#FFB6C1" },
  { id: "gray", name: "Gray", color: "#808080" },
  { id: "cream", name: "Cream", color: "#F5F5DC" },
  { id: "lavender", name: "Lavender", color: "#E6E6FA" },
  { id: "mint", name: "Mint", color: "#98FB98" },
]

export function FabricSelectionStep({ fabricType, fabricColor, onUpdate }: FabricSelectionStepProps) {
  return (
    <div className="space-y-8">
      {/* Fabric Type Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Fabric Type</h3>
        <RadioGroup
          value={fabricType}
          onValueChange={(value) => onUpdate({ fabricType: value })}
          className="grid grid-cols-1 gap-4"
        >
          {FABRIC_TYPES.map((fabric) => (
            <div key={fabric.id}>
              <RadioGroupItem value={fabric.id} id={fabric.id} className="sr-only" />
              <Label
                htmlFor={fabric.id}
                className={`
                  block cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-gray-50
                  €{fabricType === fabric.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                `}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={fabric.image || "/placeholder.svg"}
                    alt={fabric.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{fabric.name}</h4>
                      {fabric.price > 0 && <span className="text-sm font-medium text-green-600">+€{fabric.price}</span>}
                    </div>
                    <p className="text-sm text-gray-600">{fabric.description}</p>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Fabric Color Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Fabric Color</h3>
        <RadioGroup
          value={fabricColor}
          onValueChange={(value) => onUpdate({ fabricColor: value })}
          className="grid grid-cols-4 gap-4"
        >
          {FABRIC_COLORS.map((color) => (
            <div key={color.id}>
              <RadioGroupItem value={color.id} id={color.id} className="sr-only" />
              <Label
                htmlFor={color.id}
                className={`
                  block cursor-pointer rounded-lg border-2 p-3 transition-all hover:scale-105
                  €{fabricColor === color.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}
                `}
              >
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-gray-300"
                    style={{ backgroundColor: color.color }}
                  />
                  <span className="text-sm font-medium">{color.name}</span>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
