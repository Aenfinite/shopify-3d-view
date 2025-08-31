"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Palette, Check, Sparkles } from "lucide-react"

interface ButtonColorStepProps {
  buttonColorType: "standard" | "custom"
  selectedButtonColor: string
  fabricColor?: string
  onUpdate: (updates: any) => void
}

const STANDARD_BUTTON_COLORS = [
  { id: "black", name: "Black", color: "#000000", description: "Classic black buttons" },
  { id: "brown", name: "Brown", color: "#8b4513", description: "Rich brown horn buttons" },
  { id: "navy", name: "Navy", color: "#1e3a8a", description: "Deep navy buttons" },
  { id: "white", name: "White", color: "#ffffff", description: "Crisp white buttons" },
  { id: "cream", name: "Cream", color: "#f5f5dc", description: "Elegant cream buttons" },
  { id: "grey", name: "Grey", color: "#6b7280", description: "Sophisticated grey buttons" },
]

const PREMIUM_BUTTON_COLORS = [
  { id: "gold", name: "Gold", color: "#fbbf24", description: "Luxurious gold buttons", premium: true },
  { id: "silver", name: "Silver", color: "#9ca3af", description: "Polished silver buttons", premium: true },
  { id: "copper", name: "Copper", color: "#b45309", description: "Warm copper buttons", premium: true },
  { id: "pewter", name: "Pewter", color: "#71717a", description: "Matte pewter buttons", premium: true },
  { id: "bronze", name: "Bronze", color: "#92400e", description: "Antique bronze buttons", premium: true },
  { id: "gunmetal", name: "Gunmetal", color: "#374151", description: "Modern gunmetal buttons", premium: true },
]

export function ButtonColorStep({ buttonColorType, selectedButtonColor, fabricColor, onUpdate }: ButtonColorStepProps) {
  const getMatchingButtonColor = (fabricColor: string) => {
    // Logic to automatically match button color to fabric
    const colorMap: Record<string, string> = {
      "#1e3a8a": "navy", // Navy fabric -> Navy buttons
      "#000000": "black", // Black fabric -> Black buttons
      "#8b4513": "brown", // Brown fabric -> Brown buttons
      "#ffffff": "white", // White fabric -> White buttons
      "#6b7280": "grey", // Grey fabric -> Grey buttons
    }
    return colorMap[fabricColor] || "black"
  }

  const matchingColor = fabricColor ? getMatchingButtonColor(fabricColor) : "black"
  const allButtonColors = [...STANDARD_BUTTON_COLORS, ...PREMIUM_BUTTON_COLORS]
  const selectedColor = allButtonColors.find((c) => c.id === selectedButtonColor) || STANDARD_BUTTON_COLORS[0]

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-5 h-5 text-amber-600" />
          <h3 className="font-medium text-amber-800">Button Color Selection</h3>
        </div>
        <p className="text-sm text-amber-700">
          Choose between standard matching buttons or select your preferred color.
        </p>
      </div>

      {/* Button Color Type Selection */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Button Color Option</h4>
        <RadioGroup
          value={buttonColorType}
          onValueChange={(value: "standard" | "custom") => {
            onUpdate({ buttonColorType: value })
            if (value === "standard") {
              onUpdate({ selectedButtonColor: matchingColor })
            }
          }}
          className="space-y-3"
        >
          <div>
            <RadioGroupItem value="standard" id="standard-buttons" className="sr-only" />
            <Label
              htmlFor="standard-buttons"
              className={`
                block cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-gray-50
                €{buttonColorType === "standard" ? "border-blue-500 bg-blue-50" : "border-gray-200"}
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-medium text-gray-900">Standard Matching</h5>
                  <p className="text-sm text-gray-600">
                    Buttons automatically match your fabric choice - included in base price
                  </p>
                </div>
                <Badge variant="outline">Included</Badge>
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem value="custom" id="custom-buttons" className="sr-only" />
            <Label
              htmlFor="custom-buttons"
              className={`
                block cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-gray-50
                €{buttonColorType === "custom" ? "border-blue-500 bg-blue-50" : "border-gray-200"}
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-medium text-gray-900">Customer's Preference</h5>
                  <p className="text-sm text-gray-600">Choose from our selection of premium button colors</p>
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  Premium Options
                </Badge>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Standard Matching Preview */}
      {buttonColorType === "standard" && (
        <>
          <Separator />
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Automatic Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Your Fabric</div>
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-white shadow-sm mx-auto"
                    style={{ backgroundColor: fabricColor || "#1e3a8a" }}
                  />
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Matching Buttons</div>
                  <div
                    className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-sm mx-auto"
                    style={{
                      backgroundColor: STANDARD_BUTTON_COLORS.find((c) => c.id === matchingColor)?.color || "#000000",
                    }}
                  />
                </div>
              </div>
              <div className="text-center mt-4">
                <div className="font-medium text-gray-900">
                  {STANDARD_BUTTON_COLORS.find((c) => c.id === matchingColor)?.name || "Black"} Buttons
                </div>
                <div className="text-sm text-gray-600">
                  {STANDARD_BUTTON_COLORS.find((c) => c.id === matchingColor)?.description || "Classic buttons"}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Custom Button Color Selection */}
      {buttonColorType === "custom" && (
        <>
          <Separator />
          <div>
            <h4 className="text-lg font-semibold mb-4">Standard Button Colors</h4>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {STANDARD_BUTTON_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onUpdate({ selectedButtonColor: color.id })}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all hover:scale-105
                    €{selectedButtonColor === color.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}
                  `}
                >
                  <div className="text-center">
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-2 border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: color.color }}
                    />
                    <div className="text-sm font-medium text-gray-900">{color.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{color.description}</div>
                  </div>
                  {selectedButtonColor === color.id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold">Premium Button Colors</h4>
              <Badge variant="outline" className="text-purple-600 border-purple-600">
                Luxury Options
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PREMIUM_BUTTON_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onUpdate({ selectedButtonColor: color.id })}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all hover:scale-105
                    €{selectedButtonColor === color.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}
                  `}
                >
                  <div className="text-center">
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-2 border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: color.color }}
                    />
                    <div className="text-sm font-medium text-gray-900">{color.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{color.description}</div>
                    <Badge variant="outline" className="text-xs mt-1 text-purple-600 border-purple-600">
                      Premium
                    </Badge>
                  </div>
                  {selectedButtonColor === color.id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Button Preview */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Selected Button Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                  style={{ backgroundColor: selectedColor.color }}
                />
                <div className="font-medium text-gray-900 text-lg">{selectedColor.name} Buttons</div>
                <div className="text-sm text-gray-600 mt-1">{selectedColor.description}</div>
                {selectedColor.premium && (
                  <Badge variant="outline" className="mt-2 text-purple-600 border-purple-600">
                    Premium Selection
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
