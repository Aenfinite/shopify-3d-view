"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ColorContrastStepProps {
  state: any
  onUpdate: (updates: any) => void
}

const CONTRAST_COLORS = [
  { id: "white", name: "White", color: "#FFFFFF" },
  { id: "light-blue", name: "Light Blue", color: "#87CEEB" },
  { id: "navy", name: "Navy", color: "#000080" },
  { id: "pink", name: "Pink", color: "#FFB6C1" },
  { id: "gray", name: "Gray", color: "#808080" },
  { id: "black", name: "Black", color: "#000000" },
  { id: "red", name: "Red", color: "#FF0000" },
  { id: "green", name: "Green", color: "#008000" },
]

export function ColorContrastStep({ state, onUpdate }: ColorContrastStepProps) {
  const ColorSelector = ({
    title,
    value,
    onChange,
    premium = false,
  }: {
    title: string
    value: string
    onChange: (value: string) => void
    premium?: boolean
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">{title}</h4>
        {premium && <span className="text-xs text-green-600 font-medium">+€12</span>}
      </div>
      <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-4 gap-2">
        {CONTRAST_COLORS.map((color) => (
          <div key={color.id}>
            <RadioGroupItem value={color.id} id={`€{title}-€{color.id}`} className="sr-only" />
            <Label
              htmlFor={`€{title}-€{color.id}`}
              className={`
                block cursor-pointer rounded-lg border-2 p-2 transition-all hover:scale-105
                €{value === color.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}
              `}
            >
              <div className="text-center">
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-1 border border-gray-300"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-xs">{color.name}</span>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Color Contrast:</strong> Choose different colors for various shirt components. Each contrast color
          adds €12 to the total price.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorSelector
          title="Collar Outside"
          value={state.collarOutsideColor}
          onChange={(value) => onUpdate({ collarOutsideColor: value })}
          premium={state.collarOutsideColor !== state.fabricColor}
        />

        <ColorSelector
          title="Collar Inside"
          value={state.collarInsideColor}
          onChange={(value) => onUpdate({ collarInsideColor: value })}
          premium={state.collarInsideColor !== state.fabricColor}
        />

        <ColorSelector
          title="Collar Band"
          value={state.collarBandColor}
          onChange={(value) => onUpdate({ collarBandColor: value })}
          premium={state.collarBandColor !== state.fabricColor}
        />

        <ColorSelector
          title="Cuff Outside"
          value={state.cuffOutsideColor}
          onChange={(value) => onUpdate({ cuffOutsideColor: value })}
          premium={state.cuffOutsideColor !== state.fabricColor}
        />

        <ColorSelector
          title="Cuff Inside"
          value={state.cuffInsideColor}
          onChange={(value) => onUpdate({ cuffInsideColor: value })}
          premium={state.cuffInsideColor !== state.fabricColor}
        />

        <ColorSelector
          title="Wristband"
          value={state.wristbandColor}
          onChange={(value) => onUpdate({ wristbandColor: value })}
          premium={state.wristbandColor !== state.fabricColor}
        />

        <ColorSelector
          title="Placket Inside"
          value={state.placketInsideColor}
          onChange={(value) => onUpdate({ placketInsideColor: value })}
          premium={state.placketInsideColor !== state.fabricColor}
        />

        <ColorSelector
          title="Placket Outside"
          value={state.placketOutsideColor}
          onChange={(value) => onUpdate({ placketOutsideColor: value })}
          premium={state.placketOutsideColor !== state.fabricColor}
        />

        <ColorSelector
          title="Sleeve Fabric"
          value={state.sleeveFabricColor}
          onChange={(value) => onUpdate({ sleeveFabricColor: value })}
          premium={state.sleeveFabricColor !== state.fabricColor}
        />

        <ColorSelector
          title="Elbow Patch"
          value={state.elbowPatchColor}
          onChange={(value) => onUpdate({ elbowPatchColor: value })}
          premium={state.elbowPatchColor !== state.fabricColor}
        />
      </div>
    </div>
  )
}
