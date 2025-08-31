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
            <div className="grid grid-cols-1 gap-4">
              {/* Video Tutorials Option */}
              <Card 
                className="cursor-pointer border-2 hover:border-blue-300 transition-colors"
                onClick={() => {
                  onUpdate({ customMeasurementMethod: "videos" })
                  setIsMethodSelectionOpen(false)
                  setIsVideoModalOpen(true)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Video className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-medium">Video Tutorials</h3>
                      <p className="text-sm text-gray-600">Step-by-step video guides for accurate measurements</p>
                    </div>
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Measurement Sketches Option */}
              <Card 
                className="cursor-pointer border-2 hover:border-green-300 transition-colors"
                onClick={() => {
                  onUpdate({ customMeasurementMethod: "sketches" })
                  setIsMethodSelectionOpen(false)
                  setIsSketchModalOpen(true)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Edit3 className="w-8 h-8 text-green-600" />
                    <div className="flex-1">
                      <h3 className="font-medium">Measurement Sketches</h3>
                      <p className="text-sm text-gray-600">Visual guides and diagrams for each measurement</p>
                    </div>
                    <Badge variant="outline">{getSketchCount()} guides</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Manual Input Option */}
              <Card 
                className="cursor-pointer border-2 hover:border-purple-300 transition-colors"
                onClick={() => {
                  onUpdate({ customMeasurementMethod: "manual" })
                  setIsMethodSelectionOpen(false)
                  setIsManualModalOpen(true)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Ruler className="w-8 h-8 text-purple-600" />
                    <div className="flex-1">
                      <h3 className="font-medium">Manual Input</h3>
                      <p className="text-sm text-gray-600">Enter measurements directly if you know them</p>
                    </div>
                    <Badge variant="outline">Quick</Badge>
                  </div>
                </CardContent>
              </Card>
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
              Video Measurement Tutorials
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Watch these tutorials to learn how to take accurate measurements. You'll need a measuring tape and preferably someone to help you.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VIDEO_TUTORIALS.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <Button 
                        size="sm" 
                        className="bg-white text-black hover:bg-gray-100"
                        onClick={() => setSelectedVideo(video.id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Play
                      </Button>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-black text-white">
                      {video.duration}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm">{video.title}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsVideoModalOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={() => setIsVideoModalOpen(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Complete Video Training
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Measurement Sketches Modal */}
      <Dialog open={isSketchModalOpen} onOpenChange={setIsSketchModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Measurement Guide Sketches
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Alert>
              <Ruler className="h-4 w-4" />
              <AlertDescription>
                Follow these visual guides to take precise measurements. Each sketch shows exactly where and how to measure.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getCurrentSketches().map((sketch, index) => (
                <Card 
                  key={sketch.id} 
                  className={`cursor-pointer border-2 transition-colors €{
                    selectedSketch === sketch.id ? 'border-green-500 bg-green-50' : 'hover:border-green-300'
                  }`}
                  onClick={() => setSelectedSketch(sketch.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{sketch.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{sketch.description}</p>
                        {selectedSketch === sketch.id && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <img 
                              src={`/placeholder.svg?height=200&width=300&text=€{sketch.name}`} 
                              alt={sketch.name}
                              className="w-full h-40 object-contain border rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsSketchModalOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={() => setIsSketchModalOpen(false)}
                className="bg-green-600 hover:bg-green-700"
              >
                Understood - Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Measurement Input Modal */}
      <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Enter Your Measurements
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Alert>
              <Edit3 className="h-4 w-4" />
              <AlertDescription>
                Enter your measurements in inches. If you're unsure about any measurement, use our video tutorials or sketches for guidance.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MEASUREMENT_FIELDS.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="text-sm font-medium">
                    {field.label} ({field.unit})
                  </Label>
                  <Input
                    id={field.key}
                    type="number"
                    step="0.25"
                    min="0"
                    placeholder={`Enter €{field.label.toLowerCase()}`}
                    value={manualMeasurements[field.key as keyof MeasurementData]}
                    onChange={(e) => handleMeasurementChange(field.key, e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">{field.description}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between">
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
