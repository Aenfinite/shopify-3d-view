"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ButtonSelectionStepProps {
  buttonColor: string
  buttonStyle: string
  onUpdate: (updates: any) => void
}

const BUTTON_COLORS = [
  { id: "white", name: "White", color: "#FFFFFF" },
  { id: "black", name: "Black", color: "#000000" },
  { id: "navy", name: "Navy", color: "#000080" },
  { id: "brown", name: "Brown", color: "#8B4513" },
  { id: "gold", name: "Gold", color: "#FFD700" },
  { id: "silver", name: "Silver", color: "#C0C0C0" },
]

const BUTTON_STYLES = [
  {
    id: "standard",
    name: "Standard Plastic",
    description: "Classic plastic buttons",
    price: 0,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "mother-of-pearl",
    name: "Mother of Pearl",
    description: "Elegant natural buttons",
    price: 15,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "horn",
    name: "Horn Buttons",
    description: "Premium natural horn",
    price: 20,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "metal",
    name: "Metal Buttons",
    description: "Modern metal finish",
    price: 12,
    image: "/placeholder.svg?height=60&width=60",
  },
]

export function ButtonSelectionStep({ buttonColor, buttonStyle, onUpdate }: ButtonSelectionStepProps) {
  return (
    <div className="space-y-8">
      {/* Button Style Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Button Style</h3>
        <RadioGroup
          value={buttonStyle}
          onValueChange={(value) => onUpdate({ buttonStyle: value })}
          className="grid grid-cols-1 gap-4"
        >
          {BUTTON_STYLES.map((style) => (
            <div key={style.id}>
              <RadioGroupItem value={style.id} id={style.id} className="sr-only" />
              <Label
                htmlFor={style.id}
                className={`
                  block cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-gray-50
                  €{buttonStyle === style.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                `}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={style.image || "/placeholder.svg"}
                    alt={style.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{style.name}</h4>
                      {style.price > 0 && <span className="text-sm font-medium text-green-600">+€{style.price}</span>}
                    </div>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Button Color Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Button Color</h3>
        <RadioGroup
          value={buttonColor}
          onValueChange={(value) => onUpdate({ buttonColor: value })}
          className="grid grid-cols-3 gap-4"
        >
          {BUTTON_COLORS.map((color) => (
            <div key={color.id}>
              <RadioGroupItem value={color.id} id={`btn-€{color.id}`} className="sr-only" />
              <Label
                htmlFor={`btn-€{color.id}`}
                className={`
                  block cursor-pointer rounded-lg border-2 p-3 transition-all hover:scale-105
                  €{buttonColor === color.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}
                `}
              >
                <div className="text-center">
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-2 border-2 border-gray-300"
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
