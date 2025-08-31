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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Ruler, 
  User, 
  VideoIcon, 
  Image as ImageIcon, 
  AlertTriangle,
  Info,
  Play
} from "lucide-react"
import { MeasurementVideoPlayer } from "@/components/measurement/measurement-video-player"
import { MeasurementSketchGuide } from "@/components/measurement/measurement-sketch-guide"

interface MeasurementOption {
  id: string
  name: string
  price: number
  measurements: string
}

interface BodyMeasurement {
  id: string
  name: string
  description: string
  videoNumber: number
  required: boolean
  placeholder: string
}

interface GarmentMeasurement {
  id: string
  name: string
  description: string
  sketchNumber: number
  required: boolean
  placeholder: string
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
  const [bodyMeasurements, setBodyMeasurements] = useState<Record<string, string>>({})
  const [garmentMeasurements, setGarmentMeasurements] = useState<Record<string, string>>({})
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null)
  const [selectedSketch, setSelectedSketch] = useState<number | null>(null)

  // Body Measurements (from 14 videos)
  const bodyMeasurementFields: BodyMeasurement[] = [
    { id: "chest", name: "Chest Circumference", description: "Around the fullest part of your chest", videoNumber: 1, required: true, placeholder: "e.g., 102" },
    { id: "waist", name: "Waist Circumference", description: "Around your natural waistline", videoNumber: 2, required: true, placeholder: "e.g., 85" },
    { id: "hip", name: "Hip Circumference", description: "Around the widest part of your hips", videoNumber: 3, required: true, placeholder: "e.g., 95" },
    { id: "shoulder", name: "Shoulder Width", description: "From shoulder point to shoulder point", videoNumber: 4, required: true, placeholder: "e.g., 45" },
    { id: "arm_length", name: "Arm Length", description: "From shoulder to wrist", videoNumber: 5, required: true, placeholder: "e.g., 63" },
    { id: "jacket_length", name: "Preferred Jacket Length", description: "From neck to desired hem", videoNumber: 6, required: true, placeholder: "e.g., 72" },
    { id: "neck", name: "Neck Circumference", description: "Around the base of your neck", videoNumber: 7, required: true, placeholder: "e.g., 40" },
    { id: "bicep", name: "Bicep Circumference", description: "Around the largest part of your upper arm", videoNumber: 8, required: false, placeholder: "e.g., 32" },
    { id: "forearm", name: "Forearm Circumference", description: "Around the largest part of your forearm", videoNumber: 9, required: false, placeholder: "e.g., 28" },
    { id: "wrist", name: "Wrist Circumference", description: "Around your wrist bone", videoNumber: 10, required: false, placeholder: "e.g., 17" },
    { id: "back_width", name: "Back Width", description: "Across your shoulder blades", videoNumber: 11, required: true, placeholder: "e.g., 42" },
    { id: "front_length", name: "Front Length", description: "From neck to waist (front)", videoNumber: 12, required: true, placeholder: "e.g., 45" },
    { id: "back_length", name: "Back Length", description: "From neck to waist (back)", videoNumber: 13, required: true, placeholder: "e.g., 47" },
    { id: "trouser_waist", name: "Trouser Waist", description: "Where you wear your trousers", videoNumber: 14, required: true, placeholder: "e.g., 88" }
  ]

  // Garment Measurements (from sketches - for existing garment measurements)
  const garmentMeasurementFields: GarmentMeasurement[] = [
    { id: "garment_chest", name: "Jacket Chest Width", description: "Chest width of your favorite jacket", sketchNumber: 1, required: true, placeholder: "e.g., 56" },
    { id: "garment_waist", name: "Jacket Waist Width", description: "Waist width of your favorite jacket", sketchNumber: 2, required: true, placeholder: "e.g., 50" },
    { id: "garment_shoulder", name: "Shoulder Seam Length", description: "Shoulder seam of your favorite jacket", sketchNumber: 3, required: true, placeholder: "e.g., 48" },
    { id: "garment_sleeve", name: "Sleeve Length", description: "Sleeve length of your favorite jacket", sketchNumber: 4, required: true, placeholder: "e.g., 65" },
    { id: "garment_length", name: "Jacket Length", description: "Total length of your favorite jacket", sketchNumber: 5, required: true, placeholder: "e.g., 74" },
    { id: "garment_lapel", name: "Lapel Width", description: "Width of the lapel", sketchNumber: 6, required: false, placeholder: "e.g., 9" }
  ]

  const handleBodyMeasurementChange = (id: string, value: string) => {
    setBodyMeasurements(prev => ({ ...prev, [id]: value }))
  }

  const handleGarmentMeasurementChange = (id: string, value: string) => {
    setGarmentMeasurements(prev => ({ ...prev, [id]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            {title} Measurements
          </DialogTitle>
          <DialogDescription>
            Choose your measurement method for the perfect fit. All measurements should be in centimeters (cm).
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="standard">
              <User className="w-4 h-4 mr-2" />
              Standard Sizes
            </TabsTrigger>
            <TabsTrigger value="body">
              <VideoIcon className="w-4 h-4 mr-2" />
              Body Measurements
            </TabsTrigger>
            <TabsTrigger value="garment">
              <ImageIcon className="w-4 h-4 mr-2" />
              Garment Measurements
            </TabsTrigger>
          </TabsList>

          {/* Standard Sizes Tab */}
          <TabsContent value="standard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sizes.map((size) => (
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
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-lg">{size.name}</div>
                    {size.price > 0 && (
                      <Badge variant="secondary" className="text-green-600">
                        +€{size.price}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {size.measurements.replace(/"/g, 'cm')}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Body Measurements Tab */}
          <TabsContent value="body" className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Body Measurements:</strong> These are your actual body measurements. 
                We will add the necessary ease (extra fabric) for comfort and fit during production.
                Follow our 14 video guides for accurate measurements.
              </AlertDescription>
            </Alert>

            <MeasurementVideoPlayer 
              selectedVideo={selectedVideo ?? undefined} 
              onVideoSelect={setSelectedVideo}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {bodyMeasurementFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.id} className="font-medium">
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedVideo(field.videoNumber)}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Play className="w-3 h-3" />
                      Video {field.videoNumber}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id={field.id}
                      type="number"
                      placeholder={field.placeholder}
                      value={bodyMeasurements[field.id] || ""}
                      onChange={(e) => handleBodyMeasurementChange(field.id, e.target.value)}
                      className="flex-1"
                    />
                    <span className="flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-l-0 rounded-r">
                      cm
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{field.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Garment Measurements Tab */}
          <TabsContent value="garment" className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Garment Measurements:</strong> These are measurements from your favorite 
                existing garment. We will use these EXACT measurements without adding ease. 
                Measure a garment that fits you perfectly.
              </AlertDescription>
            </Alert>

            <MeasurementSketchGuide 
              selectedSketch={selectedSketch ?? undefined} 
              onSketchSelect={setSelectedSketch}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {garmentMeasurementFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.id} className="font-medium">
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSketch(field.sketchNumber)}
                      className="flex items-center gap-1 text-xs"
                    >
                      <ImageIcon className="w-3 h-3" />
                      Sketch {field.sketchNumber}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id={field.id}
                      type="number"
                      placeholder={field.placeholder}
                      value={garmentMeasurements[field.id] || ""}
                      onChange={(e) => handleGarmentMeasurementChange(field.id, e.target.value)}
                      className="flex-1"
                    />
                    <span className="flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-l-0 rounded-r">
                      cm
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{field.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Important Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 mb-2">Important Notice on Measurements</h4>
              <div className="text-sm text-red-800 space-y-2">
                <p>
                  <strong>Body Measurements:</strong> Your actual body measurements. We add ease for comfort.
                </p>
                <p>
                  <strong>Garment Measurements:</strong> Measurements from existing garments. Used exactly as provided.
                </p>
                <p className="font-medium">
                  Please specify which type of measurements you are providing. This directly affects the fit of your finished garment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
            Confirm Measurements
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
