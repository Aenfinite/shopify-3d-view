"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Type, Palette, DollarSign } from "lucide-react"

interface EmbroideredMonogramStepProps {
  monogramEnabled: boolean
  monogramType: "initials" | "fullname"
  monogramText: string
  monogramFont: "england" | "arial"
  threadColor: string
  onUpdate: (updates: any) => void
}

const FONT_OPTIONS = [
  {
    id: "england",
    name: "England Hand DB",
    preview: "𝒜ℬ𝒞",
    style: "font-serif italic font-bold",
    previewStyle: "font-family: 'Brush Script MT', 'Lucida Handwriting', cursive; font-style: italic; font-weight: bold;",
    description: "Elegant script font",
  },
  {
    id: "arial",
    name: "Arial",
    preview: "ABC",
    style: "font-sans font-semibold",
    previewStyle: "font-family: Arial, sans-serif; font-weight: 600;",
    description: "Clean modern font",
  },
]

const THREAD_COLORS = [
  { id: "navy", name: "Navy Blue", color: "#1e3a8a" },
  { id: "black", name: "Black", color: "#000000" },
  { id: "white", name: "White", color: "#ffffff" },
  { id: "gold", name: "Gold", color: "#fbbf24" },
  { id: "silver", name: "Silver", color: "#9ca3af" },
  { id: "red", name: "Red", color: "#dc2626" },
  { id: "green", name: "Forest Green", color: "#166534" },
  { id: "brown", name: "Brown", color: "#92400e" },
  { id: "purple", name: "Purple", color: "#7c3aed" },
  { id: "burgundy", name: "Burgundy", color: "#991b1b" },
  { id: "royal", name: "Royal Blue", color: "#2563eb" },
  { id: "charcoal", name: "Charcoal", color: "#374151" },
]

export function EmbroideredMonogramStep({
  monogramEnabled,
  monogramType,
  monogramText,
  monogramFont,
  threadColor,
  onUpdate,
}: EmbroideredMonogramStepProps) {
  const [showPreview, setShowPreview] = useState(true)

  const selectedThreadColor = THREAD_COLORS.find((c) => c.id === threadColor) || THREAD_COLORS[0]
  const selectedFont = FONT_OPTIONS.find((f) => f.id === monogramFont) || FONT_OPTIONS[0]

  const getPrice = () => {
    if (!monogramEnabled) return 0
    return monogramType === "initials" ? 6.5 : 10.0
  }

  const validateText = (text: string, type: "initials" | "fullname") => {
    if (type === "initials") {
      return text.length <= 2
    }
    return text.length <= 15
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Type className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-blue-800">Embroidered Monogram Option (Inside Left of Jacket)</h3>
        </div>
        <p className="text-sm text-blue-700">
          Add a personalized touch to your jacket with our custom embroidered monogram. 
          Choose from two elegant font styles — England Hand DB for a classic cursive look or Arial for a clean, modern feel.
        </p>
      </div>

      {/* Enable/Disable Monogram */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Add Embroidered Monogram?</h4>
        <RadioGroup
          value={monogramEnabled ? "yes" : "no"}
          onValueChange={(value) => onUpdate({ monogramEnabled: value === "yes" })}
          className="space-y-3"
        >
          <div>
            <RadioGroupItem value="no" id="no-monogram" className="sr-only" />
            <Label
              htmlFor="no-monogram"
              className={`
                block cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-gray-50
                €{!monogramEnabled ? "border-blue-500 bg-blue-50" : "border-gray-200"}
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-medium text-gray-900">No Monogram</h5>
                  <p className="text-sm text-gray-600">Keep the jacket clean without personalization</p>
                </div>
                <Badge variant="outline">Included</Badge>
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem value="yes" id="yes-monogram" className="sr-only" />
            <Label
              htmlFor="yes-monogram"
              className={`
                block cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-gray-50
                €{monogramEnabled ? "border-blue-500 bg-blue-50" : "border-gray-200"}
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-medium text-gray-900">Add Embroidered Monogram</h5>
                  <p className="text-sm text-gray-600">Personal embroidery inside the jacket</p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  From €6.50
                </Badge>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Monogram Configuration */}
      {monogramEnabled && (
        <>
          <Separator />

          {/* Monogram Type */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Choose Monogram Type</h4>
            <RadioGroup
              value={monogramType}
              onValueChange={(value: "initials" | "fullname") => onUpdate({ monogramType: value })}
              className="space-y-3"
            >
              <div>
                <RadioGroupItem value="initials" id="initials" className="sr-only" />
                <Label
                  htmlFor="initials"
                  className={`
                    block cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-gray-50
                    €{monogramType === "initials" ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                  `}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-gray-900">Initials (2 letters)</h5>
                      <p className="text-sm text-gray-600">Example: A.F.</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      USD €6.50
                    </Badge>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="fullname" id="fullname" className="sr-only" />
                <Label
                  htmlFor="fullname"
                  className={`
                    block cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-gray-50
                    €{monogramType === "fullname" ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                  `}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-gray-900">Full Name (two words, up to 15 letters)</h5>
                      <p className="text-sm text-gray-600">Perfect for adding a unique and personal element</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      USD €10.00
                    </Badge>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Text Input */}
          <div>
            <Label htmlFor="monogram-text" className="text-lg font-semibold">
              Enter {monogramType === "initials" ? "Initials" : "Full Name"}
            </Label>
            <div className="mt-2">
              <Input
                id="monogram-text"
                value={monogramText}
                onChange={(e) => {
                  const text = e.target.value.toUpperCase()
                  if (validateText(text, monogramType)) {
                    onUpdate({ monogramText: text })
                  }
                }}
                placeholder={monogramType === "initials" ? "AF" : "JOHN DOE"}
                maxLength={monogramType === "initials" ? 2 : 15}
                className="text-center text-lg font-medium"
              />
              <p className="text-sm text-gray-500 mt-1 text-center">
                {monogramText.length}/{monogramType === "initials" ? 2 : 15} characters
              </p>
            </div>
          </div>

          {/* Font Selection */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Choose Font Style</h4>
            <RadioGroup
              value={monogramFont}
              onValueChange={(value: "england" | "arial") => onUpdate({ monogramFont: value })}
              className="space-y-3"
            >
              {FONT_OPTIONS.map((font) => (
                <div key={font.id}>
                  <RadioGroupItem value={font.id} id={font.id} className="sr-only" />
                  <Label
                    htmlFor={font.id}
                    className={`
                      block cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-gray-50
                      €{monogramFont === font.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl €{font.style}`}>{font.preview}</div>
                      <div>
                        <h5 className="font-medium text-gray-900">{font.name}</h5>
                        <p className="text-sm text-gray-600">{font.description}</p>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Thread Color Selection */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Choose Thread Color</h4>
            <p className="text-sm text-gray-600 mb-4">12 different color options available</p>
            <div className="grid grid-cols-4 gap-3">
              {THREAD_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onUpdate({ threadColor: color.id })}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all hover:scale-105
                    €{threadColor === color.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}
                  `}
                >
                  <div className="text-center">
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-2 border border-gray-300"
                      style={{ backgroundColor: color.color }}
                    />
                    <div className="text-xs font-medium text-gray-900 truncate">{color.name}</div>
                  </div>
                  {threadColor === color.id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Card */}
          {monogramText && (
            <Card className="bg-gradient-to-br from-gray-100 to-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Monogram Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Inside Left Jacket</div>
                    <div 
                      className="text-4xl"
                      style={{ 
                        color: selectedThreadColor.color,
                        fontFamily: selectedFont.id === 'england' 
                          ? "'Brush Script MT', 'Lucida Handwriting', cursive" 
                          : "Arial, sans-serif",
                        fontWeight: selectedFont.id === 'england' ? 'bold' : '600',
                        fontStyle: selectedFont.id === 'england' ? 'italic' : 'normal'
                      }}
                    >
                      {monogramText}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Font: {selectedFont.name}</div>
                    <div>Thread: {selectedThreadColor.name}</div>
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-green-600">USD €{getPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
