"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"

interface MonogramStepProps {
  monogramText: string
  monogramColor: string
  monogramPosition: string
  onUpdate: (updates: any) => void
}

const MONOGRAM_COLORS = [
  { id: "navy", name: "Navy", color: "#000080" },
  { id: "black", name: "Black", color: "#000000" },
  { id: "white", name: "White", color: "#FFFFFF" },
  { id: "gold", name: "Gold", color: "#FFD700" },
  { id: "silver", name: "Silver", color: "#C0C0C0" },
  { id: "red", name: "Red", color: "#FF0000" },
]

const MONOGRAM_POSITIONS = [
  { id: "chest", name: "Chest", description: "Left chest area" },
  { id: "collar", name: "Collar", description: "Inside collar" },
  { id: "cuff", name: "Cuff", description: "Left cuff" },
  { id: "sleeve", name: "Sleeve", description: "Left sleeve" },
  { id: "no-monogram", name: "No Monogram", description: "Skip personalization" },
]

export function MonogramStep({ monogramText, monogramColor, monogramPosition, onUpdate }: MonogramStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Personalization:</strong> Add a custom monogram to make your shirt unique. Monogram service adds €18
          to the total price.
        </p>
      </div>

      {/* Monogram Text */}
      <div className="space-y-2">
        <Label htmlFor="monogram-text" className="text-lg font-semibold">
          Monogram Text (up to 3 characters)
        </Label>
        <Input
          id="monogram-text"
          value={monogramText}
          onChange={(e) => onUpdate({ monogramText: e.target.value.slice(0, 3).toUpperCase() })}
          placeholder="ABC"
          className="text-center text-lg font-mono"
          maxLength={3}
        />
        <p className="text-sm text-gray-600">
          Enter your initials or preferred letters (e.g., "JDM" for John David Miller)
        </p>
      </div>

      {/* Monogram Position */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Position</h3>
        <RadioGroup
          value={monogramPosition}
          onValueChange={(value) => onUpdate({ monogramPosition: value })}
          className="space-y-3"
        >
          {MONOGRAM_POSITIONS.map((position) => (
            <div key={position.id}>
              <RadioGroupItem value={position.id} id={position.id} className="sr-only" />
              <Label
                htmlFor={position.id}
                className={`
                  block cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-gray-50
                  €{monogramPosition === position.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                `}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{position.name}</h4>
                    <p className="text-sm text-gray-600">{position.description}</p>
                  </div>
                  {position.id !== "no-monogram" && monogramPosition === position.id && (
                    <span className="text-sm text-green-600 font-medium">+€18</span>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Monogram Color (only if monogram is selected) */}
      {monogramPosition && monogramPosition !== "no-monogram" && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Choose Monogram Color</h3>
          <RadioGroup
            value={monogramColor}
            onValueChange={(value) => onUpdate({ monogramColor: value })}
            className="grid grid-cols-3 gap-4"
          >
            {MONOGRAM_COLORS.map((color) => (
              <div key={color.id}>
                <RadioGroupItem value={color.id} id={`mono-€{color.id}`} className="sr-only" />
                <Label
                  htmlFor={`mono-€{color.id}`}
                  className={`
                    block cursor-pointer rounded-lg border-2 p-3 transition-all hover:scale-105
                    €{monogramColor === color.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}
                  `}
                >
                  <div className="text-center">
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-2 border border-gray-300"
                      style={{ backgroundColor: color.color }}
                    />
                    <span className="text-sm font-medium">{color.name}</span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Preview */}
      {monogramText && monogramPosition !== "no-monogram" && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Monogram Preview</h4>
            <div className="flex items-center space-x-4">
              <div
                className="w-16 h-16 rounded-lg border-2 border-gray-300 flex items-center justify-center text-lg font-bold"
                style={{ color: MONOGRAM_COLORS.find((c) => c.id === monogramColor)?.color }}
              >
                {monogramText}
              </div>
              <div>
                <p className="font-medium">{monogramText}</p>
                <p className="text-sm text-gray-600">
                  Position: {MONOGRAM_POSITIONS.find((p) => p.id === monogramPosition)?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Color: {MONOGRAM_COLORS.find((c) => c.id === monogramColor)?.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
