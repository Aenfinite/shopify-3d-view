"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ruler, User, Video, ImageIcon, Info } from "lucide-react"
import { BodyMeasurementGuide } from "../measurement/body-measurement-guide"
import { GarmentMeasurementGuide } from "../measurement/garment-measurement-guide"

interface MeasurementOption {
  id: string
  name: string
  price: number
  measurements: string
}

interface MeasurementModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  sizes: MeasurementOption[]
  selectedSize: string
  onSizeSelect: (sizeId: string) => void
  onConfirm: () => void
}

export function MeasurementModal({
  isOpen,
  onClose,
  title,
  sizes,
  selectedSize,
  onSizeSelect,
  onConfirm
}: MeasurementModalProps) {
  const [activeTab, setActiveTab] = useState<"standard" | "body" | "garment">("standard")
  const [bodyMeasurements, setBodyMeasurements] = useState<Record<string, number>>({})
  const [garmentMeasurements, setGarmentMeasurements] = useState<Record<string, number>>({})

  // Convert sizes to cm (all sizes now in cm instead of inches)
  const sizesInCm = sizes.map(size => ({
    ...size,
    measurements: size.measurements.replace(/(\d+)"/g, (match, inches) => {
      const cm = Math.round(parseInt(inches) * 2.54)
      return `€{cm} cm`
    })
  }))

  const handleBodyMeasurementsComplete = (measurements: Record<string, number>) => {
    setBodyMeasurements(measurements)
    // Store measurement type for order processing
    localStorage.setItem('measurementType', 'BODY_MEASUREMENTS')
    localStorage.setItem('bodyMeasurements', JSON.stringify(measurements))
  }

  const handleGarmentMeasurementsComplete = (measurements: Record<string, number>) => {
    setGarmentMeasurements(measurements)
    // Store measurement type for order processing
    localStorage.setItem('measurementType', 'GARMENT_MEASUREMENTS')
    localStorage.setItem('garmentMeasurements', JSON.stringify(measurements))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Choose your preferred measurement method for the perfect fit.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("standard")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors €{
              activeTab === "standard"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User className="w-4 h-4" />
              Standard Sizes
            </div>
          </button>
          <button
            onClick={() => setActiveTab("body")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors €{
              activeTab === "body"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Video className="w-4 h-4" />
              Body Measurements
            </div>
          </button>
          <button
            onClick={() => setActiveTab("garment")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors €{
              activeTab === "garment"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Garment Measurements
            </div>
          </button>
        </div>

        {/* Important Notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-1">Measurement Type Selection</h4>
              <p className="text-xs text-amber-700">
                <strong>Body Measurements:</strong> Your actual body dimensions (ease will be added for comfort) • 
                <strong>Garment Measurements:</strong> Measurements from a well-fitting jacket (used directly in production)
              </p>
            </div>
          </div>
        </div>

        {/* Standard Sizes Tab */}
        {activeTab === "standard" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sizesInCm.map((size) => (
                <div
                  key={size.id}
                  onClick={() => onSizeSelect(size.id)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                    €{
                      selectedSize === size.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{size.name}</h4>
                    {size.price > 0 && (
                      <Badge variant="outline" className="text-xs">
                        +€{size.price}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{size.measurements}</div>
                  {size.id === "custom" && (
                    <div className="mt-2 text-xs text-amber-600">
                      Professional measurements required
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Standard Sizes:</strong> All measurements shown in centimeters (cm). 
                For the most accurate fit, we recommend professional measurements.
              </p>
            </div>
          </div>
        )}

        {/* Body Measurements Tab */}
        {activeTab === "body" && (
          <div>
            <BodyMeasurementGuide onMeasurementsComplete={handleBodyMeasurementsComplete} />
          </div>
        )}

        {/* Garment Measurements Tab */}
        {activeTab === "garment" && (
          <div>
            <GarmentMeasurementGuide onMeasurementsComplete={handleGarmentMeasurementsComplete} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <div className="flex gap-3">
            {activeTab === "standard" && (
              <Button 
                onClick={onConfirm}
                disabled={!selectedSize}
                className="px-6"
              >
                Confirm Size Selection
              </Button>
            )}
            
            {activeTab === "body" && Object.keys(bodyMeasurements).length > 0 && (
              <Button 
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                Use Body Measurements
              </Button>
            )}
            
            {activeTab === "garment" && Object.keys(garmentMeasurements).length > 0 && (
              <Button 
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className="px-6 bg-purple-600 hover:bg-purple-700"
              >
                Use Garment Measurements
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
