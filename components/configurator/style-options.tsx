"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Shirt, ImageIcon } from "lucide-react"

interface StyleOption {
  id: string
  name: string
  description: string
  price: number
  sketchUrl?: string // Will contain your actual garment sketches
  features: string[]
}

interface StyleOptionsProps {
  selectedStyle: string
  onStyleChange: (styleId: string) => void
}

export function StyleOptions({ selectedStyle, onStyleChange }: StyleOptionsProps) {
  // Placeholder style options - replace with your actual garment styles
  const styleOptions: StyleOption[] = [
    {
      id: "classic-suit",
      name: "Classic Business Suit",
      description: "Traditional two-piece suit with notched lapels",
      price: 0,
      sketchUrl: "/sketches/classic-suit.jpg", // Your sketch goes here
      features: ["Notched Lapels", "Two Button", "Classic Fit", "Side Vents"]
    },
    {
      id: "modern-slim",
      name: "Modern Slim Fit",
      description: "Contemporary cut with clean lines",
      price: 25,
      sketchUrl: "/sketches/modern-slim.jpg", // Your sketch goes here
      features: ["Peak Lapels", "Slim Fit", "Functional Buttonholes", "No Vents"]
    },
    {
      id: "three-piece",
      name: "Three-Piece Traditional",
      description: "Classic three-piece with vest",
      price: 150,
      sketchUrl: "/sketches/three-piece.jpg", // Your sketch goes here
      features: ["Matching Vest", "Peak Lapels", "Six Button Vest", "Ticket Pocket"]
    },
    {
      id: "tuxedo",
      name: "Formal Tuxedo",
      description: "Black tie formal wear",
      price: 200,
      sketchUrl: "/sketches/tuxedo.jpg", // Your sketch goes here
      features: ["Satin Lapels", "One Button", "Satin Stripe", "No Vents"]
    }
  ]

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Choose Your Style</h3>
        <p className="text-sm text-gray-600">Select from our signature garment styles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {styleOptions.map((style) => (
          <Card
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            className={`cursor-pointer transition-all hover:shadow-lg €{
              selectedStyle === style.id
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Shirt className="w-4 h-4" />
                  {style.name}
                </CardTitle>
                {style.price > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    +€{style.price}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Sketch placeholder - replace with your actual sketches */}
              <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 flex items-center justify-center border-2 border-dashed border-gray-300">
                {style.sketchUrl ? (
                  <img 
                    src={style.sketchUrl} 
                    alt={style.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      // Fallback if sketch image is not found
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`text-center €{style.sketchUrl ? 'hidden' : ''}`}>
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Sketch Coming Soon</p>
                  <p className="text-xs text-gray-400 mt-1">{style.name}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{style.description}</p>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Key Features:</Label>
                <div className="flex flex-wrap gap-1">
                  {style.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedStyle === style.id && (
                <div className="mt-3 p-2 bg-blue-100 rounded text-center">
                  <p className="text-xs text-blue-700 font-medium">Selected Style</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 mb-1">Style Sketches</h4>
            <p className="text-xs text-yellow-700">
              Detailed garment sketches will be integrated when connecting to your Shopify store. 
              These placeholder styles can be customized to match your exact offerings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
