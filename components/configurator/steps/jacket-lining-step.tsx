"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shirt, 
  Palette, 
  Type, 
  CheckCircle, 
  Info,
  DollarSign,
  Star,
  Clock
} from "lucide-react"

interface JacketLiningStepProps {
  liningType: "standard" | "custom" | "none"
  standardLiningColor?: string
  customLiningColor?: string
  monogramEnabled: boolean
  monogramType: "initials" | "fullname"
  monogramText: string
  monogramFont: "england" | "arial"
  threadColor: string
  onUpdate: (updates: any) => void
}

// Standard lining colors that match fabric types
const STANDARD_LINING_COLORS = [
  { id: "navy-silk", name: "Navy Silk", color: "#1e3a8a", fabric: "silk" },
  { id: "charcoal-silk", name: "Charcoal Silk", color: "#374151", fabric: "silk" },
  { id: "black-silk", name: "Black Silk", color: "#000000", fabric: "silk" },
  { id: "burgundy-silk", name: "Burgundy Silk", color: "#991b1b", fabric: "silk" },
  { id: "forest-silk", name: "Forest Green Silk", color: "#166534", fabric: "silk" },
]

// 20 plain lining colors for customer preference
const CUSTOM_LINING_COLORS = [
  { id: "navy", name: "Navy Blue", color: "#1e3a8a" },
  { id: "black", name: "Black", color: "#000000" },
  { id: "white", name: "White", color: "#ffffff" },
  { id: "charcoal", name: "Charcoal Gray", color: "#374151" },
  { id: "burgundy", name: "Burgundy", color: "#991b1b" },
  { id: "forest", name: "Forest Green", color: "#166534" },
  { id: "royal", name: "Royal Blue", color: "#2563eb" },
  { id: "crimson", name: "Crimson", color: "#dc2626" },
  { id: "purple", name: "Deep Purple", color: "#7c3aed" },
  { id: "brown", name: "Chocolate Brown", color: "#92400e" },
  { id: "teal", name: "Teal", color: "#0f766e" },
  { id: "gold", name: "Golden Yellow", color: "#ca8a04" },
  { id: "olive", name: "Olive Green", color: "#65a30d" },
  { id: "maroon", name: "Maroon", color: "#7f1d1d" },
  { id: "slate", name: "Slate Blue", color: "#475569" },
  { id: "emerald", name: "Emerald", color: "#059669" },
  { id: "orange", name: "Burnt Orange", color: "#ea580c" },
  { id: "indigo", name: "Indigo", color: "#4338ca" },
  { id: "rose", name: "Rose Pink", color: "#e11d48" },
  { id: "amber", name: "Amber", color: "#d97706" },
]

const MONOGRAM_FONTS = [
  {
    id: "england",
    name: "England Hand DB",
    preview: "𝒜ℬ𝒞",
    style: "font-serif italic",
    description: "Elegant script font",
  },
  {
    id: "arial",
    name: "Arial",
    preview: "ABC",
    style: "font-sans",
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

export function JacketLiningStep({
  liningType,
  standardLiningColor,
  customLiningColor,
  monogramEnabled,
  monogramType,
  monogramText,
  monogramFont,
  threadColor,
  onUpdate,
}: JacketLiningStepProps) {
  const [selectedLiningType, setSelectedLiningType] = useState(liningType || "standard")

  const calculatePrice = () => {
    let total = 0
    
    // Lining prices
    switch (selectedLiningType) {
      case "standard":
        total += 0 // Standard matching lining is included
        break
      case "custom":
        total += 25 // Custom lining surcharge
        break
      case "none":
        total -= 15 // Discount for no lining (sleeve only)
        break
    }

    // Monogram prices
    if (monogramEnabled) {
      total += monogramType === "initials" ? 8.5 : 15.0
    }

    return total
  }

  const validateMonogramText = (text: string, type: "initials" | "fullname") => {
    if (type === "initials") {
      return text.length <= 3
    }
    return text.length <= 15
  }

  const selectedThreadColorData = THREAD_COLORS.find((c) => c.id === threadColor) || THREAD_COLORS[0]
  const selectedFont = MONOGRAM_FONTS.find((f) => f.id === monogramFont) || MONOGRAM_FONTS[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <Shirt className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Jacket Interior Options</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            €${calculatePrice() >= 0 ? `+${calculatePrice()}` : `${calculatePrice()}`}
          </Badge>
        </div>
        <p className="text-sm text-blue-700">
          Customize your jacket's interior lining and add an optional embroidered monogram for personalization.
        </p>
      </div>

      {/* Lining Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Lining Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedLiningType}
            onValueChange={(value) => {
              setSelectedLiningType(value as "standard" | "custom" | "none")
              onUpdate({ liningType: value })
            }}
            className="space-y-4"
          >
            {/* Standard Matching Lining */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="flex items-center gap-2 cursor-pointer">
                  <span className="font-medium">Standard Matching Lining</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Included
                  </Badge>
                </Label>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Our premium silk lining that perfectly complements your chosen suit fabric. 
                Each fabric has a carefully selected matching lining color.
              </p>
              
              {selectedLiningType === "standard" && (
                <div className="ml-6 mt-4">
                  <h4 className="text-sm font-medium mb-3">Select Standard Lining:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {STANDARD_LINING_COLORS.map((color) => (
                      <Button
                        key={color.id}
                        variant={standardLiningColor === color.id ? "default" : "outline"}
                        className="h-auto p-3 justify-start"
                        onClick={() => onUpdate({ standardLiningColor: color.id })}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color.color }}
                          />
                          <div className="text-left">
                            <div className="text-xs font-medium">{color.name}</div>
                            <div className="text-xs text-gray-500">{color.fabric}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customer's Preference */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="flex items-center gap-2 cursor-pointer">
                  <span className="font-medium">Customer's Preference</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    +€25.00
                  </Badge>
                </Label>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Choose from our selection of 20 premium plain lining colors. 
                Perfect for adding a personal touch or matching specific preferences.
              </p>

              {selectedLiningType === "custom" && (
                <div className="ml-6 mt-4">
                  <h4 className="text-sm font-medium mb-3">Choose Your Lining Color:</h4>
                  <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                    {CUSTOM_LINING_COLORS.map((color) => (
                      <Button
                        key={color.id}
                        variant={customLiningColor === color.id ? "default" : "outline"}
                        className="h-auto p-3 flex-col gap-1"
                        onClick={() => onUpdate({ customLiningColor: color.id })}
                      >
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color.color }}
                        />
                        <span className="text-xs font-medium text-center">{color.name}</span>
                      </Button>
                    ))}
                  </div>
                  
                  <Alert className="mt-4 border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Extensible Collection:</strong> We continuously expand our lining color selection. 
                      Contact us if you need a specific color not shown here.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>

            {/* No Lining (Sleeve Only) */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="flex items-center gap-2 cursor-pointer">
                  <span className="font-medium">No Lining (Sleeve Lined Only)</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    -€15.00
                  </Badge>
                </Label>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Unlined jacket body with only sleeve lining for structure. 
                Provides better breathability and a more casual drape.
              </p>

              {selectedLiningType === "none" && (
                <Alert className="ml-6 mt-4 border-amber-200 bg-amber-50">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Note:</strong> Unlined jackets are perfect for warmer climates and casual wear. 
                    The sleeves will still be lined for proper structure and comfort.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Embroidered Monogram Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Embroidered Monogram (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="monogram-enabled"
              checked={monogramEnabled}
              onChange={(e) => onUpdate({ monogramEnabled: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="monogram-enabled" className="flex items-center gap-2 cursor-pointer">
              <span className="font-medium">Add Embroidered Monogram</span>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {monogramEnabled ? (monogramType === "initials" ? "+€8.50" : "+€15.00") : "Optional"}
              </Badge>
            </Label>
          </div>

          {monogramEnabled && (
            <div className="space-y-6 pl-6 border-l-2 border-purple-200">
              {/* Monogram Type */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Monogram Type:</Label>
                <RadioGroup
                  value={monogramType}
                  onValueChange={(value) => onUpdate({ monogramType: value })}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="initials" id="initials" />
                    <Label htmlFor="initials" className="cursor-pointer">
                      Initials (up to 3 letters) - €8.50
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fullname" id="fullname" />
                    <Label htmlFor="fullname" className="cursor-pointer">
                      Full Name (up to 15 letters) - €15.00
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Text Input */}
              <div>
                <Label htmlFor="monogram-text" className="text-sm font-medium">
                  {monogramType === "initials" ? "Initials:" : "Full Name:"}
                </Label>
                <Input
                  id="monogram-text"
                  value={monogramText}
                  onChange={(e) => {
                    const text = e.target.value.toUpperCase()
                    if (validateMonogramText(text, monogramType)) {
                      onUpdate({ monogramText: text })
                    }
                  }}
                  placeholder={monogramType === "initials" ? "ABC" : "JOHN SMITH"}
                  maxLength={monogramType === "initials" ? 3 : 15}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {monogramType === "initials" 
                    ? `€{monogramText.length}/3 characters`
                    : `€{monogramText.length}/15 characters`
                  }
                </p>
              </div>

              {/* Font Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Font Style:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MONOGRAM_FONTS.map((font) => (
                    <Button
                      key={font.id}
                      variant={monogramFont === font.id ? "default" : "outline"}
                      className="h-auto p-4 justify-start"
                      onClick={() => onUpdate({ monogramFont: font.id })}
                    >
                      <div className="text-left">
                        <div className={`text-lg mb-1 €{font.style}`}>{font.preview}</div>
                        <div className="text-sm font-medium">{font.name}</div>
                        <div className="text-xs text-gray-600">{font.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Thread Color */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Thread Color:</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {THREAD_COLORS.map((color) => (
                    <Button
                      key={color.id}
                      variant={threadColor === color.id ? "default" : "outline"}
                      className="h-auto p-3 flex-col gap-1"
                      onClick={() => onUpdate({ threadColor: color.id })}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color.color }}
                      />
                      <span className="text-xs font-medium text-center">{color.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Enhanced Monogram Preview */}
              {monogramText && (
                <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 border border-gray-200 rounded-xl p-6 shadow-lg">
                  <h4 className="text-lg font-semibold mb-6 text-center text-gray-800 flex items-center justify-center gap-2">
                    <span className="text-xl">✨</span>
                    Live Monogram Preview
                    <span className="text-xl">✨</span>
                  </h4>
                  
                  {/* Realistic Jacket Preview */}
                  <div className="relative bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-xl p-8 shadow-2xl mx-auto max-w-sm">
                    {/* Fabric texture overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none"></div>
                    
                    {/* Jacket structure */}
                    <div className="relative">
                      {/* Lapels */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                        <div className="flex gap-1">
                          <div className="w-8 h-16 bg-gray-600 transform rotate-12 rounded-bl-xl shadow-lg border border-gray-500"></div>
                          <div className="w-8 h-16 bg-gray-600 transform -rotate-12 rounded-br-xl shadow-lg border border-gray-500"></div>
                        </div>
                      </div>
                      
                      {/* Main chest area */}
                      <div className="bg-gray-700 rounded-lg p-6 min-h-32 relative border border-gray-600 shadow-inner">
                        
                        {/* Monogram embroidery simulation */}
                        <div className="absolute top-4 right-4">
                          <div className="relative">
                            {/* Embroidery base effect */}
                            <div 
                              className={`absolute inset-0 €{selectedFont.style} blur-sm opacity-30`}
                              style={{ 
                                color: selectedThreadColorData.color,
                                fontSize: monogramType === "initials" ? '1.25rem' : '1rem',
                                fontWeight: 'bold',
                                transform: 'translate(1px, 1px)'
                              }}
                            >
                              {monogramText}
                            </div>
                            
                            {/* Main embroidered text */}
                            <div 
                              className={`relative €{selectedFont.style} select-none`}
                              style={{ 
                                color: selectedThreadColorData.color,
                                fontSize: monogramType === "initials" ? '1.25rem' : '1rem',
                                fontWeight: 'bold',
                                textShadow: `
                                  0 0 2px €{selectedThreadColorData.color}40,
                                  1px 1px 0 rgba(0,0,0,0.3),
                                  -1px -1px 0 rgba(255,255,255,0.1)
                                `,
                                letterSpacing: monogramType === "initials" ? '0.15em' : '0.05em',
                                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'
                              }}
                            >
                              {monogramText}
                            </div>
                            
                            {/* Stitching effect lines */}
                            <div className="absolute -inset-1 pointer-events-none">
                              <div 
                                className="absolute inset-0 border-2 border-dotted opacity-20 rounded"
                                style={{ borderColor: selectedThreadColorData.color }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Pocket detail */}
                        <div className="absolute bottom-4 left-4 w-12 h-4 border border-gray-500 rounded-sm bg-gray-800 shadow-inner"></div>
                        
                        {/* Button placeholders */}
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-2.5 h-2.5 bg-gray-500 rounded-full shadow-sm border border-gray-400"></div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Highlight arrow */}
                      <div className="absolute -top-2 -right-2 text-amber-400 animate-pulse">
                        <div className="text-xs font-bold text-center">Your Monogram</div>
                        <div className="text-2xl transform rotate-45">↗</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailed Preview Cards */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Close-up preview */}
                    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                      <div className="text-xs font-medium text-gray-600 mb-2 text-center">Close-up View</div>
                      <div className="bg-gray-800 rounded p-3 text-center">
                        <div 
                          className={`€{selectedFont.style}`}
                          style={{ 
                            color: selectedThreadColorData.color,
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            textShadow: `0 0 3px €{selectedThreadColorData.color}60, 1px 1px 0 rgba(0,0,0,0.5)`
                          }}
                        >
                          {monogramText}
                        </div>
                      </div>
                    </div>
                    
                    {/* Size reference */}
                    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                      <div className="text-xs font-medium text-gray-600 mb-2 text-center">Actual Size</div>
                      <div className="bg-gray-100 rounded p-3 text-center border-2 border-dashed border-gray-300">
                        <div 
                          className={`€{selectedFont.style}`}
                          style={{ 
                            color: selectedThreadColorData.color,
                            fontSize: monogramType === "initials" ? '0.875rem' : '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {monogramText}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {monogramType === "initials" ? "14px height" : "12px height"}
                        </div>
                      </div>
                    </div>
                    
                    {/* Thread color sample */}
                    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                      <div className="text-xs font-medium text-gray-600 mb-2 text-center">Thread Details</div>
                      <div className="text-center space-y-2">
                        <div 
                          className="w-8 h-8 rounded-full mx-auto shadow-lg border-2 border-white"
                          style={{ backgroundColor: selectedThreadColorData.color }}
                        ></div>
                        <div className="text-xs font-medium">{selectedThreadColorData.name}</div>
                        <div className="text-xs text-gray-500">Premium thread</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Specification details */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      <div>
                        <div className="font-medium text-gray-800 mb-1">Embroidery Details:</div>
                        <div>• Font: {selectedFont.name}</div>
                        <div>• Type: {monogramType === "initials" ? "Initials" : "Full Name"}</div>
                        <div>• Position: Right chest pocket</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 mb-1">Quality Features:</div>
                        <div>• Premium thread quality</div>
                        <div>• Hand-finished appearance</div>
                        <div>• Colorfast guarantee</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Alternative background previews */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-3 text-center">
                      Preview on Different Lining Colors
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: "Navy", bg: "#1e3a8a", text: "white" },
                        { name: "Charcoal", bg: "#374151", text: "white" },
                        { name: "Burgundy", bg: "#7f1d1d", text: "white" },
                        { name: "Cream", bg: "#fef3c7", text: "black" }
                      ].map((lining) => (
                        <div key={lining.name} className="text-center">
                          <div 
                            className="rounded p-2 text-center shadow-sm border"
                            style={{ backgroundColor: lining.bg }}
                          >
                            <div 
                              className={`€{selectedFont.style} text-xs`}
                              style={{ 
                                color: selectedThreadColorData.color,
                                fontWeight: 'bold',
                                textShadow: lining.text === "white" ? '1px 1px 0 rgba(0,0,0,0.5)' : '1px 1px 0 rgba(255,255,255,0.5)'
                              }}
                            >
                              {monogramText}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{lining.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Lining & Monogram Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  Lining: {selectedLiningType === "standard" ? "Standard Matching" : 
                          selectedLiningType === "custom" ? "Custom Color" : "No Lining (Sleeve Only)"}
                </div>
                {monogramEnabled && (
                  <div>
                    Monogram: {monogramType === "initials" ? "Initials" : "Full Name"} 
                    {monogramText && ` - "€{monogramText}"`}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">
                {calculatePrice() >= 0 ? `+€${calculatePrice()}` : `€${calculatePrice()}`}
              </div>
              <div className="text-xs text-gray-500">Additional cost</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
