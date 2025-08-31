"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Check, Shirt } from "lucide-react"

interface StyleDetail {
  id: string
  name: string
  value: string
  price: number
  description?: string
}

interface StyleDetailsProps {
  selectedCollar: string
  selectedCuff: string
  onCollarChange: (collarId: string) => void
  onCuffChange: (cuffId: string) => void
}

export function StyleDetails({ 
  selectedCollar, 
  selectedCuff, 
  onCollarChange, 
  onCuffChange 
}: StyleDetailsProps) {
  // Collar styles from your actual product data
  const collarStyles: StyleDetail[] = [
    { 
      id: "spread", 
      name: "Spread Collar", 
      value: "spread", 
      price: 0,
      description: "Classic wide collar suitable for most occasions"
    },
    { 
      id: "point", 
      name: "Point Collar", 
      value: "point", 
      price: 0,
      description: "Traditional pointed collar for a timeless look"
    },
    { 
      id: "button-down", 
      name: "Button Down", 
      value: "button-down", 
      price: 5,
      description: "Casual collar with buttons for a relaxed style"
    },
    { 
      id: "cutaway", 
      name: "Cutaway", 
      value: "cutaway", 
      price: 10,
      description: "Modern wide-spread collar for contemporary styling"
    },
  ]

  // Cuff styles from your actual product data
  const cuffStyles: StyleDetail[] = [
    { 
      id: "barrel", 
      name: "Barrel Cuff", 
      value: "barrel", 
      price: 0,
      description: "Standard rounded cuff with button closure"
    },
    { 
      id: "french", 
      name: "French Cuff", 
      value: "french", 
      price: 15,
      description: "Formal double cuff requiring cufflinks"
    },
    { 
      id: "convertible", 
      name: "Convertible", 
      value: "convertible", 
      price: 10,
      description: "Versatile cuff that works with buttons or cufflinks"
    },
  ]

  return (
    <div className="space-y-8">
      {/* Collar Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shirt className="w-5 h-5 text-gray-600" />
          <Label className="text-lg font-medium">Collar Style</Label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collarStyles.map((collar) => (
            <Card
              key={collar.id}
              onClick={() => onCollarChange(collar.id)}
              className={`cursor-pointer transition-all hover:shadow-md €{
                selectedCollar === collar.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    {collar.name}
                  </CardTitle>
                  {collar.price > 0 ? (
                    <Badge variant="outline">+€{collar.price}</Badge>
                  ) : (
                    <Badge variant="secondary">Included</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Placeholder for collar sketch */}
                <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-3 flex items-center justify-center border border-gray-200">
                  <div className="text-center">
                    <Shirt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">{collar.name}</p>
                    <p className="text-xs text-gray-400">Sketch</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{collar.description}</p>
                
                {selectedCollar === collar.id && (
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-100 p-2 rounded">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cuff Selection */}
      <div>
        <Label className="text-lg font-medium mb-4 block">Cuff Style</Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cuffStyles.map((cuff) => (
            <Card
              key={cuff.id}
              onClick={() => onCuffChange(cuff.id)}
              className={`cursor-pointer transition-all hover:shadow-md €{
                selectedCuff === cuff.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    {cuff.name}
                  </CardTitle>
                  {cuff.price > 0 ? (
                    <Badge variant="outline">+€{cuff.price}</Badge>
                  ) : (
                    <Badge variant="secondary">Included</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Placeholder for cuff sketch */}
                <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-3 flex items-center justify-center border border-gray-200">
                  <div className="text-center">
                    <div className="w-8 h-6 bg-gray-300 rounded mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500">{cuff.name}</p>
                    <p className="text-xs text-gray-400">Sketch</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{cuff.description}</p>
                
                {selectedCuff === cuff.id && (
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-100 p-2 rounded">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Style Selection Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Collar:</span>
            <span className="font-medium">
              {collarStyles.find(c => c.id === selectedCollar)?.name}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Cuff:</span>
            <span className="font-medium">
              {cuffStyles.find(c => c.id === selectedCuff)?.name}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center font-medium">
              <span>Style Upgrades:</span>
              <span>
                +€{(collarStyles.find(c => c.id === selectedCollar)?.price || 0) + 
                   (cuffStyles.find(c => c.id === selectedCuff)?.price || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
