"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Ruler, Video, Edit3, Download, Play, Users, DollarSign, CheckCircle } from "lucide-react"

interface MeasurementStepProps {
  sizeType: "standard" | "custom"
  standardSize: string
  fitType: string
  customMeasurements: {
    neck: number
    chest: number
    stomach: number
    hip: number
    length: number
    shoulder: number
    sleeve: number
  }
  customMeasurementMethod?: "sketches" | "videos" | "manual"
  onUpdate: (updates: any) => void
}

interface MeasurementData {
  neck: string
  chest: string
  stomach: string
  hip: string
  length: string
  shoulder: string
  sleeve: string
}

const MEASUREMENT_FIELDS = [
  { key: "neck", label: "Neck", description: "Measure around the neck where collar sits", unit: "inches" },
  { key: "chest", label: "Chest", description: "Measure around fullest part of chest", unit: "inches" },
  { key: "stomach", label: "Stomach", description: "Measure around natural waistline", unit: "inches" },
  { key: "hip", label: "Hip", description: "Measure around fullest part of hips", unit: "inches" },
  { key: "length", label: "Length", description: "Measure from back of neck to desired hem", unit: "inches" },
  { key: "shoulder", label: "Shoulder", description: "Measure from shoulder point to shoulder point", unit: "inches" },
  { key: "sleeve", label: "Sleeve", description: "Measure from shoulder to wrist", unit: "inches" },
]

const MEASUREMENT_SKETCHES = {
  shirt: [
    { id: "chest", name: "Chest Width", description: "Measure across chest at armpit level" },
    { id: "length", name: "Body Length", description: "From collar to bottom hem" },
    { id: "sleeve", name: "Sleeve Length", description: "From shoulder seam to cuff" },
    { id: "shoulder", name: "Shoulder Width", description: "From shoulder point to shoulder point" },
  ],
  jacket: [
    { id: "chest", name: "Chest Width", description: "Measure across chest at armpit level" },
    { id: "length", name: "Jacket Length", description: "From collar to bottom hem" },
    { id: "sleeve", name: "Sleeve Length", description: "From shoulder seam to cuff" },
    { id: "shoulder", name: "Shoulder Width", description: "From shoulder point to shoulder point" },
    { id: "waist", name: "Waist", description: "Measure at natural waistline" },
  ],
}

const VIDEO_TUTORIALS = [
  { id: "chest", title: "Chest Measurement", duration: "2:30", thumbnail: "/placeholder.svg?height=120&width=200" },
  { id: "neck", title: "Neck Measurement", duration: "1:45", thumbnail: "/placeholder.svg?height=120&width=200" },
  { id: "sleeve", title: "Sleeve Length", duration: "3:15", thumbnail: "/placeholder.svg?height=120&width=200" },
  { id: "shoulder", title: "Shoulder Width", duration: "2:00", thumbnail: "/placeholder.svg?height=120&width=200" },
  { id: "waist", title: "Waist Measurement", duration: "1:30", thumbnail: "/placeholder.svg?height=120&width=200" },
  { id: "length", title: "Body Length", duration: "2:45", thumbnail: "/placeholder.svg?height=120&width=200" },
]

export function MeasurementStep({
  sizeType,
  standardSize,
  fitType,
  customMeasurements,
  customMeasurementMethod,
  onUpdate,
}: MeasurementStepProps) {
  const [selectedSketch, setSelectedSketch] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isSketchModalOpen, setIsSketchModalOpen] = useState(false)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [isMethodSelectionOpen, setIsMethodSelectionOpen] = useState(true) // Auto-open method selection
  const [manualMeasurements, setManualMeasurements] = useState<MeasurementData>({
    neck: customMeasurements.neck?.toString() || "",
    chest: customMeasurements.chest?.toString() || "",
    stomach: customMeasurements.stomach?.toString() || "",
    hip: customMeasurements.hip?.toString() || "",
    length: customMeasurements.length?.toString() || "",
    shoulder: customMeasurements.shoulder?.toString() || "",
    sleeve: customMeasurements.sleeve?.toString() || "",
  })

  // Set custom measurement type by default
  React.useEffect(() => {
    if (sizeType !== "custom") {
      onUpdate({ sizeType: "custom" })
    }
  }, [sizeType, onUpdate])

  const handleMeasurementChange = (field: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    onUpdate({
      customMeasurements: {
        ...customMeasurements,
        [field]: numValue,
      },
    })

    setManualMeasurements((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const getCurrentSketches = () => {
    return MEASUREMENT_SKETCHES.shirt // Default to shirt, can be dynamic based on product type
  }

  const getSketchCount = () => {
    return getCurrentSketches().length
  }

  return (
    <>
      {/* Sidebar Content - Simple info message, popup opens automatically */}
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Ruler className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-green-800">Custom Measurements (Bespoke)</h3>
          </div>
          <p className="text-sm text-green-700">
            We only offer custom measurements tailored exactly to your body for the perfect fit.
          </p>
        </div>

        {/* Show current selection status */}
        {customMeasurementMethod ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs text-blue-600">Selected Method:</div>
            <div className="font-medium text-sm text-blue-900">
              {customMeasurementMethod === "videos" && "Video Tutorials"}
              {customMeasurementMethod === "sketches" && "Measurement Sketches"}
              {customMeasurementMethod === "manual" && "Manual Input"}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 w-full"
              onClick={() => {
                if (customMeasurementMethod === "videos") setIsVideoModalOpen(true)
                if (customMeasurementMethod === "sketches") setIsSketchModalOpen(true)
                if (customMeasurementMethod === "manual") setIsManualModalOpen(true)
              }}
            >
              Reopen {customMeasurementMethod === "videos" ? "Video Tutorials" : 
                      customMeasurementMethod === "sketches" ? "Guides" : "Input Form"}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="mt-1 w-full"
              onClick={() => {
                onUpdate({ customMeasurementMethod: undefined })
                setIsMethodSelectionOpen(true)
              }}
            >
              Change Method
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Ruler className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              Please select your measurement method in the popup that has opened.
            </p>
            <Button 
              onClick={() => setIsMethodSelectionOpen(true)}
              variant="outline"
            >
              Open Method Selection
            </Button>
          </div>
        )}
      </div>

      {/* Method Selection Modal - Opens automatically */}
      <Dialog open={isMethodSelectionOpen} onOpenChange={setIsMethodSelectionOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Choose Measurement Method
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              How would you like to provide your measurements?
            </p>

            {/* Method Selection Buttons */}
            <div className="space-y-3">
              {/* Video Tutorial Button */}
              <Button
                onClick={() => {
                  onUpdate({ customMeasurementMethod: "videos" })
                  setIsMethodSelectionOpen(false)
                  setIsVideoModalOpen(true)
                }}
                variant="outline"
                className="w-full h-auto p-4 justify-start hover:bg-blue-50 hover:border-blue-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Video className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Video Tutorials</div>
                    <div className="text-xs text-gray-600">
                      Watch step-by-step videos showing how to measure your body
                    </div>
                  </div>
                </div>
              </Button>

              {/* Measurement Sketches Button */}
              <Button
                onClick={() => {
                  onUpdate({ customMeasurementMethod: "sketches" })
                  setIsMethodSelectionOpen(false)
                  setIsSketchModalOpen(true)
                }}
                variant="outline"
                className="w-full h-auto p-4 justify-start hover:bg-green-50 hover:border-green-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Measurement Sketches</div>
                    <div className="text-xs text-gray-600">
                      Use visual guides to measure your favorite garments
                    </div>
                  </div>
                </div>
              </Button>

              {/* Manual Input Button */}
              <Button
                onClick={() => {
                  onUpdate({ customMeasurementMethod: "manual" })
                  setIsMethodSelectionOpen(false)
                  setIsManualModalOpen(true)
                }}
                variant="outline"
                className="w-full h-auto p-4 justify-start hover:bg-purple-50 hover:border-purple-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Manual Input</div>
                    <div className="text-xs text-gray-600">
                      Enter measurements directly if you already know them
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Tutorial Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Step-by-Step Video Tutorials
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Video Guidance:</strong> Follow our professional video tutorials to measure your body accurately. 
                You'll need a second person to help you and a measuring tape.
              </p>
            </div>

            <Alert className="border-amber-200 bg-amber-50">
              <Users className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>What you need:</strong> A friend to help, a measuring tape, and form-fitting clothes.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VIDEO_TUTORIALS.map((video, index) => (
                <Card
                  key={video.id}
                  className={`cursor-pointer hover:shadow-md transition-all €{
                    selectedVideo === video.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedVideo(video.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">Step {index + 1}</Badge>
                      <Badge className="bg-black/75 text-white text-xs">{video.duration}</Badge>
                    </div>
                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative">
                      <Play className="w-12 h-12 text-gray-400" />
                    </div>
                    <h5 className="font-medium text-sm mb-1">{video.title}</h5>
                    <Button size="sm" variant="outline" className="w-full">
                      <Play className="w-4 h-4 mr-1" />
                      Watch Tutorial
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setIsVideoModalOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={() => setIsVideoModalOpen(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Complete Video Tutorials
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Measurement Sketches Modal */}
      <Dialog open={isSketchModalOpen} onOpenChange={setIsSketchModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Measurement Sketches Guide
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Visual Guides:</strong> Use our detailed sketches to measure your favorite garment that fits you well. 
                This method is perfect if you have a similar garment at home.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCurrentSketches().map((sketch, index) => (
                <Card
                  key={sketch.id}
                  className={`cursor-pointer transition-all hover:shadow-md €{
                    selectedSketch === sketch.id ? "ring-2 ring-green-500" : ""
                  }`}
                  onClick={() => setSelectedSketch(sketch.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">Step {index + 1}</Badge>
                    </div>
                    <div className="w-full h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                      <Ruler className="w-6 h-6 text-gray-400" />
                    </div>
                    <h5 className="font-medium text-sm">{sketch.name}</h5>
                    <p className="text-xs text-gray-600 mb-2">{sketch.description}</p>
                    {selectedSketch === sketch.id && (
                      <Button size="sm" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Guide
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setIsSketchModalOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={() => setIsSketchModalOpen(false)}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Measurements
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Input Modal */}
      <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Manual Measurement Input
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>Direct Input:</strong> Enter your measurements directly if you already know them or have them
                from a professional tailor.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {MEASUREMENT_FIELDS.map((field, index) => (
                <Card key={field.key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">Step {index + 1}</Badge>
                          <Label htmlFor={field.key} className="font-medium">
                            {field.label}
                          </Label>
                        </div>
                        <p className="text-sm text-gray-600">{field.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          id={field.key}
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={manualMeasurements[field.key as keyof MeasurementData] || ""}
                          onChange={(e) => handleMeasurementChange(field.key, e.target.value)}
                          className="w-20 text-center"
                          placeholder="0"
                        />
                        <span className="text-sm text-gray-500">{field.unit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Measurement Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Measurement Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {MEASUREMENT_FIELDS.map((field) => (
                    <div key={field.key} className="flex justify-between">
                      <span className="text-gray-600">{field.label}:</span>
                      <span className="font-medium">
                        {manualMeasurements[field.key as keyof MeasurementData] || 0}"
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center font-medium">
                  <span>Bespoke Surcharge:</span>
                  <span className="text-green-600">+€25.00</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setIsManualModalOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={() => setIsManualModalOpen(false)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Save Measurements
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
