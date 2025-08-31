"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Ruler, Info, Upload } from "lucide-react"

interface GarmentMeasurement {
  id: string
  title: string
  description: string
  sketchUrl?: string
  measurementType: "garment"
  unit: "cm"
  category: "jacket" | "general"
}

interface GarmentMeasurementGuideProps {
  onMeasurementsComplete: (measurements: Record<string, number>) => void
}

export function GarmentMeasurementGuide({ onMeasurementsComplete }: GarmentMeasurementGuideProps) {
  const [measurements, setMeasurements] = useState<Record<string, number>>({})
  const [selectedSketch, setSelectedSketch] = useState<string | null>(null)

  // Garment measurements based on measuring an existing favorite garment
  const garmentMeasurements: GarmentMeasurement[] = [
    {
      id: "chest-width",
      title: "1. Chest Width",
      description: "Measure from armpit to armpit across the chest of your favorite jacket",
      sketchUrl: "/sketches/garment-chest-width.jpg",
      measurementType: "garment",
      unit: "cm",
      category: "jacket"
    },
    {
      id: "waist-width", 
      title: "2. Waist Width",
      description: "Measure across the waist of the jacket at its narrowest point",
      sketchUrl: "/sketches/garment-waist-width.jpg",
      measurementType: "garment",
      unit: "cm",
      category: "jacket"
    },
    {
      id: "shoulder-width",
      title: "3. Shoulder Width",
      description: "Measure from shoulder seam to shoulder seam across the back",
      sketchUrl: "/sketches/garment-shoulder-width.jpg",
      measurementType: "garment",
      unit: "cm",
      category: "jacket"
    },
    {
      id: "sleeve-length",
      title: "4. Sleeve Length",
      description: "Measure from shoulder seam to end of sleeve",
      sketchUrl: "/sketches/garment-sleeve-length.jpg",
      measurementType: "garment",
      unit: "cm",
      category: "jacket"
    },
    {
      id: "jacket-length",
      title: "5. Jacket Length",
      description: "Measure from base of collar to bottom hem of jacket",
      sketchUrl: "/sketches/garment-jacket-length.jpg",
      measurementType: "garment",
      unit: "cm",
      category: "jacket"
    },
    {
      id: "back-width",
      title: "6. Back Width",
      description: "Measure across the back of the jacket from side seam to side seam",
      sketchUrl: "/sketches/garment-back-width.jpg",
      measurementType: "garment",
      unit: "cm",
      category: "jacket"
    },
    {
      id: "armhole-circumference",
      title: "7. Armhole Circumference",
      description: "Measure around the armhole opening of the jacket",
      sketchUrl: "/sketches/garment-armhole.jpg",
      measurementType: "garment",
      unit: "cm",
      category: "jacket"
    },
    {
      id: "bicep-width",
      title: "8. Bicep Width",
      description: "Measure across the sleeve at the fullest part of the bicep area",
      sketchUrl: "/sketches/garment-bicep-width.jpg",
      measurementType: "garment",
      unit: "cm",
      category: "jacket"
    },
    {
      id: "cuff-width",
      title: "9. Cuff Width",
      description: "Measure across the sleeve cuff opening",
      sketchUrl: "/sketches/garment-cuff-width.jpg",
      measurementType: "garment",
      unit: "cm",
      category: "jacket"
    },
    {
      id: "lapel-width",
      title: "10. Lapel Width",
      description: "Measure the width of the lapel at its widest point",
      sketchUrl: "/sketches/garment-lapel-width.jpg",
      measurementType: "garment",
      unit: "cm",
      category: "jacket"
    }
  ]

  const handleMeasurementInput = (measurementId: string, value: number) => {
    const newMeasurements = { ...measurements, [measurementId]: value }
    setMeasurements(newMeasurements)
  }

  const isComplete = garmentMeasurements.every(measurement => measurements[measurement.id] > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Garment Measurement Guide</h2>
        <div className="flex items-center justify-center gap-4 mb-4">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <ImageIcon className="w-4 h-4 mr-2" />
            Measurement Sketches
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Ruler className="w-4 h-4 mr-2" />
            Measurements in CM
          </Badge>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Measure your favorite well-fitting jacket using our detailed sketches. 
          These exact measurements will be used directly in production.
        </p>
      </div>

      {/* Important Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-orange-900">Important Notice on Garment Measurements</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 text-sm text-orange-800">
            <p>
              <strong>Garment Measurements:</strong> These are measurements taken from an existing jacket that fits you well. 
              These measurements will be used <strong>directly in production</strong> without any adjustments.
            </p>
            <p>
              <strong>Important:</strong> The jacket will be made exactly to the measurements you provide. 
              Make sure your reference jacket fits you the way you want your new jacket to fit.
            </p>
            <p className="font-medium">
              It must be clearly stated on each order that these are <strong>Garment Measurements</strong> 
              to ensure proper production handling.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Measurement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {garmentMeasurements.map((measurement) => (
          <Card key={measurement.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{measurement.title}</CardTitle>
              <p className="text-sm text-gray-600">{measurement.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Measurement Sketch */}
              <div 
                className="aspect-[4/3] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-purple-400 transition-colors overflow-hidden"
                onClick={() => setSelectedSketch(measurement.id)}
              >
                {measurement.sketchUrl ? (
                  <img 
                    src={measurement.sketchUrl} 
                    alt={measurement.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`€{measurement.sketchUrl ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Sketch Coming Soon</p>
                    <p className="text-xs text-gray-400 mt-1">Click to view large</p>
                  </div>
                </div>
              </div>

              {/* Measurement Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Enter measurement (cm):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={measurements[measurement.id] || ""}
                    onChange={(e) => handleMeasurementInput(measurement.id, parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0.0"
                  />
                  <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                    cm
                  </span>
                </div>
                {measurements[measurement.id] > 0 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Measurement recorded
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Custom Sketches Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-blue-900">Custom Measurement Sketches</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-blue-800 mb-3">
            Have your own measurement sketches or reference images? Upload them here to help with your measurements.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-100">
              <Upload className="w-4 h-4 mr-2" />
              Upload Images
            </Button>
            <span className="text-xs text-blue-600">JPG, PNG up to 5MB each</span>
          </div>
        </CardContent>
      </Card>

      {/* Progress and Action */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">
                Progress: {Object.keys(measurements).filter(key => measurements[key] > 0).length} / {garmentMeasurements.length}
              </h4>
              <p className="text-sm text-gray-600">
                Complete all garment measurements to proceed with your order
              </p>
            </div>
            <Button 
              onClick={() => onMeasurementsComplete(measurements)}
              disabled={!isComplete}
              className="px-6 bg-purple-600 hover:bg-purple-700"
            >
              Complete Garment Measurements
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sketch Modal */}
      {selectedSketch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {garmentMeasurements.find(m => m.id === selectedSketch)?.title}
                </h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedSketch(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              
              <div className="mb-4">
                {garmentMeasurements.find(m => m.id === selectedSketch)?.sketchUrl ? (
                  <img 
                    src={garmentMeasurements.find(m => m.id === selectedSketch)?.sketchUrl} 
                    alt={garmentMeasurements.find(m => m.id === selectedSketch)?.title}
                    className="w-full max-h-96 object-contain border rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-100 flex items-center justify-center border rounded-lg">
                    <div className="text-center">
                      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Detailed sketch coming soon</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Measurement Instructions:</h4>
                <p className="text-sm text-purple-800">
                  {garmentMeasurements.find(m => m.id === selectedSketch)?.description}
                </p>
                <p className="text-xs text-purple-600 mt-2">
                  💡 <strong>Tip:</strong> Lay the garment flat and use a ruler or measuring tape. 
                  Measure in centimeters for the most accurate results.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
