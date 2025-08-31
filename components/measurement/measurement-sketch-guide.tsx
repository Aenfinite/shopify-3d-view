"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Image as ImageIcon, 
  Ruler, 
  Download, 
  Printer,
  AlertTriangle,
  Info
} from "lucide-react"

interface MeasurementSketch {
  id: number
  title: string
  description: string
  garmentPart: string
  instructions: string[]
  tips: string[]
  imageUrl?: string
}

interface MeasurementSketchGuideProps {
  selectedSketch?: number
  onSketchSelect: (sketchId: number) => void
}

export function MeasurementSketchGuide({ selectedSketch, onSketchSelect }: MeasurementSketchGuideProps) {
  // Measurement sketches for garment measurements
  const measurementSketches: MeasurementSketch[] = [
    {
      id: 1,
      title: "Jacket Chest Width",
      description: "Measure the chest width of your favorite jacket",
      garmentPart: "Chest",
      instructions: [
        "Lay the jacket flat on a surface",
        "Button it up completely",
        "Measure from armpit to armpit across the chest",
        "Keep measuring tape straight and flat",
        "Double this measurement for full circumference"
      ],
      tips: [
        "Use a jacket that fits you perfectly",
        "Make sure the jacket is not stretched",
        "Measure at the widest part of the chest"
      ]
    },
    {
      id: 2,
      title: "Jacket Waist Width",
      description: "Measure the waist width of your jacket",
      garmentPart: "Waist",
      instructions: [
        "Keep the jacket buttoned and flat",
        "Measure at the narrowest part of the jacket waist",
        "Usually about 6-8 inches below the chest measurement",
        "Measure from side seam to side seam",
        "Double this measurement for full circumference"
      ],
      tips: [
        "This affects how fitted the jacket will be",
        "Consider the style you prefer",
        "Measure where the jacket naturally narrows"
      ]
    },
    {
      id: 3,
      title: "Shoulder Seam Length",
      description: "Measure the shoulder seam of your jacket",
      garmentPart: "Shoulder",
      instructions: [
        "Lay jacket flat with shoulders spread",
        "Measure from neck seam to shoulder point",
        "Follow the shoulder seam line exactly",
        "This is crucial for proper fit",
        "Measure both shoulders and average if different"
      ],
      tips: [
        "This is the most important measurement",
        "Cannot be easily altered later",
        "Should match your natural shoulder width"
      ]
    },
    {
      id: 4,
      title: "Sleeve Length",
      description: "Measure the sleeve length of your jacket",
      garmentPart: "Sleeve",
      instructions: [
        "Lay jacket flat with sleeves straight",
        "Measure from shoulder seam to cuff end",
        "Follow the outside seam of the sleeve",
        "Include any desired cuff showing",
        "Consider shirt cuff visibility preference"
      ],
      tips: [
        "Typically shows 1/4 to 1/2 inch of shirt cuff",
        "Can be adjusted during fitting",
        "Consider arm length and posture"
      ]
    },
    {
      id: 5,
      title: "Jacket Length",
      description: "Measure the total length of your jacket",
      garmentPart: "Length",
      instructions: [
        "Lay jacket flat and buttoned",
        "Measure from base of collar (back) to hem",
        "Keep measuring tape straight down the center back",
        "This determines the jacket's proportions",
        "Consider your height and leg length"
      ],
      tips: [
        "Should cover your bottom curve",
        "Classic length is thumb knuckle when arms hang",
        "Longer lengths are more formal"
      ]
    },
    {
      id: 6,
      title: "Lapel Width",
      description: "Measure the lapel width for style consistency",
      garmentPart: "Lapel",
      instructions: [
        "Measure the widest part of the lapel",
        "Usually at the chest button level",
        "Keep measurement perpendicular to lapel edge",
        "This affects the jacket's style",
        "Consider current fashion preferences"
      ],
      tips: [
        "Wider lapels are more classic/formal",
        "Narrower lapels are more modern",
        "Should complement your body type"
      ]
    }
  ]

  const currentSketch = selectedSketch ? measurementSketches.find(s => s.id === selectedSketch) : null

  return (
    <div className="space-y-6">
      {/* Important Notice */}
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Critical Notice:</strong> These are GARMENT measurements from your existing clothes. 
          We will use these measurements EXACTLY as provided without adding any ease. 
          Choose a garment that fits you perfectly.
        </AlertDescription>
      </Alert>

      {/* Sketch Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {measurementSketches.map((sketch) => (
          <Card
            key={sketch.id}
            className={`cursor-pointer transition-all hover:shadow-md €{
              selectedSketch === sketch.id 
                ? "border-blue-500 bg-blue-50 shadow-md" 
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onSketchSelect(sketch.id)}
          >
            <CardContent className="p-4">
              <div className="aspect-square bg-gray-100 rounded flex items-center justify-center mb-3 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <div className="text-xs text-gray-500">Sketch {sketch.id}</div>
                </div>
              </div>
              <div className="text-sm font-medium mb-1">{sketch.title}</div>
              <div className="text-xs text-gray-600">{sketch.garmentPart}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Sketch Details */}
      {currentSketch && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="default">Sketch {currentSketch.id}</Badge>
                  {currentSketch.title}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{currentSketch.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Sketch Image */}
            <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  {currentSketch.title} Measurement Guide
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Detailed sketch showing exactly where and how to measure your {currentSketch.garmentPart.toLowerCase()}
                </p>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    Your measurement sketches will be displayed here when uploaded to the /public/sketches/ folder
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Measurement Steps:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  {currentSketch.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">
                  💡 Professional Tips:
                </h4>
                <ul className="space-y-2 text-sm text-green-800">
                  {currentSketch.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Warning */}
            <Alert className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Remember:</strong> Garment measurements are used exactly as provided. 
                We do NOT add ease to these measurements. Choose a garment that fits you perfectly 
                and measure it carefully. All measurements should be in centimeters (cm).
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Getting Started Guide */}
      {!selectedSketch && (
        <Card>
          <CardHeader>
            <CardTitle>How to Measure Your Existing Garments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Use these detailed sketches to measure your favorite, best-fitting garment. 
                These measurements will be used exactly as provided to create your new garment.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What You'll Need:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your best-fitting jacket</li>
                    <li>• Measuring tape</li>
                    <li>• Flat surface</li>
                    <li>• Good lighting</li>
                    <li>• Pen and paper for notes</li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-2">Important Rules:</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Lay garment completely flat</li>
                    <li>• Button all buttons</li>
                    <li>• Measure in centimeters (cm)</li>
                    <li>• These measurements are used EXACTLY</li>
                    <li>• No ease will be added</li>
                  </ul>
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This method is recommended if you have a garment that fits you perfectly and want 
                  the same fit. If you're unsure, we recommend using the Body Measurements method instead.
                </AlertDescription>
              </Alert>
              
              <div className="text-center">
                <Button 
                  onClick={() => onSketchSelect(1)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Start with Sketch 1: Chest Width
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
