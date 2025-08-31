"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface ButtonConfigurationProps {
  selectedConfiguration: string
  onConfigurationChange: (configId: string) => void
}

export function ButtonConfiguration({
  selectedConfiguration,
  onConfigurationChange
}: ButtonConfigurationProps) {
  
  const buttonConfigurations = [
    { 
      id: "one-button", 
      name: "One Button", 
      price: 10, 
      description: "Single button - formal and elegant"
    },
    { 
      id: "two-button", 
      name: "Two Button", 
      price: 0, 
      description: "Classic style - most versatile"
    },
    { 
      id: "three-button", 
      name: "Three Button", 
      price: 5, 
      description: "Traditional cut - sophisticated look"
    },
    { 
      id: "four-button", 
      name: "Four Button (Double Breasted)", 
      price: 15, 
      description: "Formal double-breasted style"
    },
  ]

  const renderButtonPreview = (configId: string) => {
    const buttonCount = configId === "one-button" ? 1 : 
                       configId === "two-button" ? 2 :
                       configId === "three-button" ? 3 : 4
    
    if (configId === "four-button") {
      // Double-breasted layout
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-4">
            <div className="flex flex-col gap-1">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>
      )
    } else {
      // Single-breasted layout
      return (
        <div className="flex flex-col items-center gap-1">
          {Array.from({ length: buttonCount }, (_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-600 rounded-full"></div>
          ))}
        </div>
      )
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Button Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Choose Number of Buttons</Label>
          <div className="grid grid-cols-1 gap-3">
            {buttonConfigurations.map((config) => (
              <div
                key={config.id}
                onClick={() => onConfigurationChange(config.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all €{
                  selectedConfiguration === config.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-16 h-20 bg-gray-100 rounded-lg">
                      {renderButtonPreview(config.id)}
                    </div>
                    <div>
                      <div className="font-medium">{config.name}</div>
                      <div className="text-sm text-gray-500">{config.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {config.price > 0 && (
                      <Badge variant="secondary">+€{config.price}</Badge>
                    )}
                    {selectedConfiguration === config.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <Label>Button Layout Preview</Label>
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm inline-block">
              <div className="text-sm text-gray-500 mb-4">
                {buttonConfigurations.find(c => c.id === selectedConfiguration)?.name} Layout
              </div>
              <div className="flex items-center justify-center">
                {renderButtonPreview(selectedConfiguration)}
              </div>
              <div className="text-xs text-gray-500 mt-4">
                {buttonConfigurations.find(c => c.id === selectedConfiguration)?.description}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Configuration Summary</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>Style: <span className="font-semibold">
              {buttonConfigurations.find(c => c.id === selectedConfiguration)?.name}
            </span></div>
            <div className="pt-2 border-t border-blue-200">
              Additional Cost: <span className="font-semibold">
                €{buttonConfigurations.find(c => c.id === selectedConfiguration)?.price || 0}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
