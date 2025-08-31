"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Play, Book, Ruler, ChevronLeft, ChevronRight, Users, UserCheck, Video, FileText } from "lucide-react"

// Measurement data interface
interface MeasurementData {
  neck: string
  chest: string
  stomach: string
  hip: string
  length: string
  shoulder: string
  sleeve: string
  waist: string
  inseam: string
  thigh: string
  knee: string
  outseam: string
  biceps: string
  back_length: string
  armhole: string
  front_width: string
  back_width: string
  forearm: string
  wrist: string
  hem: string
  front_length: string
  backmass: string
  sleeve_opening: string
  first_button: string
}

interface MeasurementStepProps {
  garmentType?: string
  onUpdate?: (measurements: any) => void
  sizeType?: "standard"
}

// Updated GARMENT_MEASUREMENTS with YOUR EXACT 12-step sequence and metric units
const GARMENT_MEASUREMENTS = {
  jacket: {
    measurements: [
      { 
        key: "chest", 
        label: "Chest", 
        description: "Measure around the fullest part of your chest.", 
        detailedGuide: "Stand upright with arms at your sides. Wrap the tape around the fullest part of your chest, under your arms. Keep the tape level and snug but not tight.",
        unit: "cm",
        videoUrl: "https://youtu.be/JFf0as-X7jA",
        sketchImage: "/images/jacket/chest.png"
      },
      { 
        key: "waist", 
        label: "Waist", 
        description: "Measure around your natural waistline.", 
        detailedGuide: "Find your natural waist (usually the narrowest part) and measure around it, keeping the tape snug but not tight.",
        unit: "cm",
        videoUrl: "https://youtu.be/3xVdy8Azqhs",
        sketchImage: "/images/jacket/waist.png"
      },
      { 
        key: "hem", 
        label: "Hem", 
        description: "Measure around the hem of the jacket.", 
        detailedGuide: "Measure around the bottom hem area of where the jacket would end.",
        unit: "cm",
        videoUrl: "https://youtu.be/DVy9E71T3cI",
        sketchImage: "/images/jacket/hem.png"
      },
      { 
        key: "front_length", 
        label: "Front Length", 
        description: "Measure from shoulder to desired front length.", 
        detailedGuide: "Measure from the high point of your shoulder down the front to where you want the jacket to end.",
        unit: "cm",
        videoUrl: "https://youtu.be/Yi1Zd1MigyM",
        sketchImage: "/images/jacket/front-length.png"
      },
      { 
        key: "first_button", 
        label: "FB (First Button)", 
        description: "Position of the first button.", 
        detailedGuide: "Measure from the base of the collar to where the first button should be positioned.",
        unit: "cm",
        videoUrl: "https://youtu.be/8eTJzzDZ-Ps",
        sketchImage: "/images/jacket/first-button.png"
      },
      { 
        key: "back_length", 
        label: "Back Length", 
        description: "Measure from neck to desired back length.", 
        detailedGuide: "Measure from the base of your neck down the back to where you want the jacket to end.",
        unit: "cm",
        videoUrl: "https://youtu.be/qJn27RFvNsk",
        sketchImage: "/images/jacket/back-length.png"
      },
      { 
        key: "shoulder", 
        label: "Shoulder", 
        description: "Measure across your shoulders.", 
        detailedGuide: "Measure from one shoulder point to the other across your back.",
        unit: "cm",
        videoUrl: "https://youtu.be/8bT5sg4-Q0o",
        sketchImage: "/images/jacket/shoulder.png"
      },
      { 
        key: "backmass", 
        label: "Backmass", 
        description: "Measure the back width.", 
        detailedGuide: "Measure across the back at the widest point.",
        unit: "cm",
        videoUrl: "https://youtu.be/ZeOSNRw9NRM",
        sketchImage: "/images/jacket/backmass.png"
      },
      { 
        key: "sleeve", 
        label: "Sleeve Length", 
        description: "Measure from shoulder to wrist.", 
        detailedGuide: "With arm slightly bent, measure from shoulder point down to your wrist.",
        unit: "cm",
        videoUrl: "https://youtu.be/D9StvHaSgM8",
        sketchImage: "/images/jacket/sleeve-length.png"
      },
      { 
        key: "armhole", 
        label: "Armhole", 
        description: "Measure around the armhole.", 
        detailedGuide: "Measure around your arm where the armhole of the jacket would sit.",
        unit: "cm",
        videoUrl: "https://youtu.be/p3SCb2WsP2M",
        sketchImage: "/images/jacket/armhole.png"
      },
      { 
        key: "biceps", 
        label: "Biceps", 
        description: "Measure around the largest part of your upper arm.", 
        detailedGuide: "With arms relaxed, wrap the tape around the fullest part of your upper arm without tensing the muscles. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/h5GvZbTVSH8",
        sketchImage: "/images/jacket/biceps.png"
      },
      { 
        key: "wrist", 
        label: "Wrist", 
        description: "Measure around your wrist bone.", 
        detailedGuide: "Wrap the tape around the widest point of your wrist, over the carpal bone. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/9fgnZ0YQ2Mk",
        sketchImage: "/images/jacket/sleeve-opening.png"
      }
    ]
  }
}

export function MeasurementStep({
  garmentType = "jacket",
  onUpdate,
}: MeasurementStepProps) {
  const [isMethodSelectionOpen, setIsMethodSelectionOpen] = useState(false)
  const [isStepByStepOpen, setIsStepByStepOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentMeasurement, setCurrentMeasurement] = useState("")
  const [currentMethod, setCurrentMethod] = useState<"videos" | "sketches">("videos")
  const [savedMeasurements, setSavedMeasurements] = useState<Record<string, string>>({})
  const [manualMeasurements, setManualMeasurements] = useState<MeasurementData>({
    neck: "", chest: "", stomach: "", hip: "", length: "", shoulder: "", sleeve: "",
    waist: "", inseam: "", thigh: "", knee: "", outseam: "", biceps: "", back_length: "",
    armhole: "", front_width: "", back_width: "", forearm: "", wrist: "", hem: "",
    front_length: "", backmass: "", sleeve_opening: "", first_button: ""
  })

  // Auto-open method selection on mount
  useEffect(() => {
    setIsMethodSelectionOpen(true)
  }, [])

  const garmentConfig = (GARMENT_MEASUREMENTS as any)[garmentType] || GARMENT_MEASUREMENTS.jacket

  const handleMethodSelect = (method: "videos" | "sketches") => {
    setCurrentMethod(method)
    setIsMethodSelectionOpen(false)
    setIsStepByStepOpen(true)
    setCurrentStep(0)
    if (garmentConfig.measurements.length > 0) {
      setCurrentMeasurement(garmentConfig.measurements[0].key)
    }
  }

  const handleNextStep = () => {
    if (currentStep < garmentConfig.measurements.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      setCurrentMeasurement(garmentConfig.measurements[nextStep].key)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      setCurrentMeasurement(garmentConfig.measurements[prevStep].key)
    }
  }

  const handleMeasurementSave = (value: string) => {
    const newMeasurements = { ...savedMeasurements, [currentMeasurement]: value }
    setSavedMeasurements(newMeasurements)
    
    // Update manual measurements as well
    setManualMeasurements(prev => ({
      ...prev,
      [currentMeasurement]: value
    }))

    if (onUpdate) {
      onUpdate(newMeasurements)
    }
  }

  const currentMeasurementData = garmentConfig.measurements[currentStep]

  if (isMethodSelectionOpen) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Measurement Method</h2>
          <p className="text-gray-600">Select how you'd like to measure your {garmentType}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
            onClick={() => handleMethodSelect("videos")}
          >
            <CardContent className="p-6 text-center">
              <Video className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Video Assistance</h3>
              <p className="text-gray-600 mb-4">Follow along with detailed video tutorials for each measurement</p>
              <Badge variant="secondary">Recommended</Badge>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500"
            onClick={() => handleMethodSelect("sketches")}
          >
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Garment Sketches</h3>
              <p className="text-gray-600 mb-4">Use detailed sketches and diagrams to measure your favorite garment</p>
              <Badge variant="outline">Traditional Method</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isStepByStepOpen) {
    return (
      <div className="p-6 space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            Step {currentStep + 1} of {garmentConfig.measurements.length}
          </h2>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `€{((currentStep + 1) / garmentConfig.measurements.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / garmentConfig.measurements.length) * 100)}%
            </span>
          </div>
        </div>

        {/* Current measurement */}
        {currentMeasurementData && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {currentMeasurementData.label}
              </h3>
              <p className="text-gray-600">
                {currentMeasurementData.description}
              </p>
            </div>

            {/* Measurement media */}
            <div className="flex justify-center">
              {currentMethod === "videos" ? (
                <div className="w-full max-w-lg">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <Play className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Video tutorial for {currentMeasurementData.label}
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-lg">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <img 
                      src={currentMeasurementData.sketchImage} 
                      alt={`€{currentMeasurementData.label} measurement guide`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Measurement guide for {currentMeasurementData.label}
                  </p>
                </div>
              )}
            </div>

            {/* Detailed instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How to measure:</h4>
              <p className="text-blue-800 text-sm">
                {currentMeasurementData.detailedGuide}
              </p>
            </div>

            {/* Input field */}
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <Label htmlFor="measurement-input" className="text-base font-medium">
                  Enter measurement in {currentMeasurementData.unit}
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="measurement-input"
                    type="number"
                    placeholder={`e.g., 42`}
                    value={savedMeasurements[currentMeasurement] || ""}
                    onChange={(e) => handleMeasurementSave(e.target.value)}
                    className="text-lg"
                  />
                  <span className="flex items-center px-3 bg-gray-100 rounded-md text-gray-600">
                    {currentMeasurementData.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <Button
                onClick={handleNextStep}
                disabled={currentStep === garmentConfig.measurements.length - 1}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      <p>Measurement step component loaded</p>
    </div>
  )
}
