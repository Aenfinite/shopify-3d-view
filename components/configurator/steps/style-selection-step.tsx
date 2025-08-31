"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface StyleSelectionStepProps {
  sleeveStyle: string
  frontStyle: string
  backStyle: string
  bottomStyle: string
  collarStyle: string
  cuffStyle: string
  pocketStyle: string
  onUpdate: (updates: any) => void
}

const STYLE_OPTIONS = {
  sleeve: [
    { id: "regular", name: "Regular Sleeve", price: 0 },
    { id: "french-cuff", name: "French Cuff", price: 10 },
    { id: "rolled-sleeve", name: "Rolled Sleeve", price: 5 },
  ],
  front: [
    { id: "standard", name: "Standard Front", price: 0 },
    { id: "hidden-placket", name: "Hidden Placket", price: 8 },
    { id: "tuxedo-front", name: "Tuxedo Front", price: 15 },
  ],
  back: [
    { id: "standard", name: "Standard Back", price: 0 },
    { id: "pleated", name: "Pleated Back", price: 12 },
    { id: "yoke-detail", name: "Yoke Detail", price: 8 },
  ],
  bottom: [
    { id: "straight", name: "Straight Hem", price: 0 },
    { id: "curved", name: "Curved Hem", price: 0 },
    { id: "split-hem", name: "Split Hem", price: 5 },
  ],
  collar: [
    { id: "spread", name: "Spread Collar", price: 0 },
    { id: "button-down", name: "Button Down", price: 0 },
    { id: "cutaway", name: "Cutaway", price: 8 },
    { id: "band", name: "Band Collar", price: 5 },
  ],
  cuff: [
    { id: "button", name: "Button Cuff", price: 0 },
    { id: "french", name: "French Cuff", price: 10 },
    { id: "convertible", name: "Convertible", price: 8 },
  ],
  pocket: [
    { id: "no-pocket", name: "No Pocket", price: 0 },
    { id: "chest-pocket", name: "Chest Pocket", price: 5 },
    { id: "two-pockets", name: "Two Pockets", price: 10 },
  ],
}

export function StyleSelectionStep({
  sleeveStyle,
  frontStyle,
  backStyle,
  bottomStyle,
  collarStyle,
  cuffStyle,
  pocketStyle,
  onUpdate,
}: StyleSelectionStepProps) {
  const StyleSection = ({
    title,
    options,
    value,
    onChange,
  }: {
    title: string
    options: any[]
    value: string
    onChange: (value: string) => void
  }) => (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-3">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              <div className="flex justify-between items-center">
                <span>{option.name}</span>
                {option.price > 0 && <span className="text-sm text-green-600 font-medium">+€{option.price}</span>}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StyleSection
          title="Sleeve Style"
          options={STYLE_OPTIONS.sleeve}
          value={sleeveStyle}
          onChange={(value) => onUpdate({ sleeveStyle: value })}
        />

        <StyleSection
          title="Front Style"
          options={STYLE_OPTIONS.front}
          value={frontStyle}
          onChange={(value) => onUpdate({ frontStyle: value })}
        />

        <StyleSection
          title="Back Style"
          options={STYLE_OPTIONS.back}
          value={backStyle}
          onChange={(value) => onUpdate({ backStyle: value })}
        />

        <StyleSection
          title="Bottom Style"
          options={STYLE_OPTIONS.bottom}
          value={bottomStyle}
          onChange={(value) => onUpdate({ bottomStyle: value })}
        />

        <StyleSection
          title="Collar Style"
          options={STYLE_OPTIONS.collar}
          value={collarStyle}
          onChange={(value) => onUpdate({ collarStyle: value })}
        />

        <StyleSection
          title="Cuff Style"
          options={STYLE_OPTIONS.cuff}
          value={cuffStyle}
          onChange={(value) => onUpdate({ cuffStyle: value })}
        />
      </div>

      <StyleSection
        title="Pocket Style"
        options={STYLE_OPTIONS.pocket}
        value={pocketStyle}
        onChange={(value) => onUpdate({ pocketStyle: value })}
      />
    </div>
  )
}
