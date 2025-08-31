"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Video, Ruler, Info } from "lucide-react"
import { VideoPlayer } from "../measurement/video-player"

interface MeasurementVideo {
  id: string
  title: string
  description: string
  videoUrl?: string
  thumbnailUrl?: string
  measurementType: "body"
  unit: "cm"
}

interface BodyMeasurementGuideProps {
  onMeasurementsComplete: (measurements: Record<string, number>) => void
}

export function BodyMeasurementGuide({ onMeasurementsComplete }: BodyMeasurementGuideProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [measurements, setMeasurements] = useState<Record<string, number>>({})

  // 14 video measurement guides for jacket body measurements
  const measurementVideos: MeasurementVideo[] = [
    {
      id: "chest-circumference",
      title: "1. Chest Circumference",
      description: "Measure around the fullest part of your chest, under your arms",
      measurementType: "body",
      unit: "cm",
      // videoUrl: "https://youtube.com/watch?v=VIDEO_ID_1" // Add your video URLs
    },
    {
      id: "waist-circumference", 
      title: "2. Waist Circumference",
      description: "Measure around your natural waistline",
      measurementType: "body",
      unit: "cm",
    },
    {
      id: "hip-circumference",
      title: "3. Hip Circumference", 
      description: "Measure around the fullest part of your hips",
      measurementType: "body",
      unit: "cm",
    },
    {
      id: "shoulder-width",
      title: "4. Shoulder Width",
      description: "Measure from shoulder point to shoulder point across your back",
      measurementType: "body",
      unit: "cm",
    },
    {
      id: "arm-length",
      title: "5. Arm Length",
      description: "Measure from shoulder point to wrist with arm slightly bent",
      measurementType: "body", 
      unit: "cm",
    },
    {
      id: "jacket-length",
      title: "6. Jacket Length",
      description: "Measure from base of neck to desired jacket length",
      measurementType: "body",
      unit: "cm",
    },
    {
      id: "neck-circumference",
      title: "7. Neck Circumference",
      description: "Measure around your neck where the collar will sit",
      measurementType: "body",
      unit: "cm",
    },
    {
      id: "bicep-circumference",
      title: "8. Bicep Circumference",
      description: "Measure around the fullest part of your upper arm",
      measurementType: "body",
      unit: "cm",
    },
    {
      id: "forearm-circumference",
      title: "9. Forearm Circumference", 
      description: "Measure around the fullest part of your forearm",
      measurementType: "body",
      unit: "cm",
    },
    {
      id: "wrist-circumference",
      title: "10. Wrist Circumference",
      description: "Measure around your wrist where the cuff will sit",
      measurementType: "body",
      unit: "cm",
    },
    {
      id: "back-width",
      title: "11. Back Width",
      description: "Measure across your back from armpit to armpit",
      measurementType: "body",
      unit: "cm",
    },
    {
      id: "front-length",
      title: "12. Front Length",
      description: "Measure from shoulder to waist down the front",
      measurementType: "body",
      unit: "cm",
    },
    {
      id: "back-length",
      title: "13. Back Length", 
      description: "Measure from base of neck to waist down the back",
      measurementType: "body",
      unit: "cm",
    },
    {
      id: "armhole-circumference",
      title: "14. Armhole Circumference",
      description: "Measure around your armhole where the sleeve will attach",
      measurementType: "body",
      unit: "cm",
    }
  ]

  const handleMeasurementInput = (videoId: string, value: number) => {
    const newMeasurements = { ...measurements, [videoId]: value }
    setMeasurements(newMeasurements)
  }

  const isComplete = measurementVideos.every(video => measurements[video.id] > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Body Measurement Guide</h2>
        <div className="flex items-center justify-center gap-4 mb-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Video className="w-4 h-4 mr-2" />
            14 Video Guides
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Ruler className="w-4 h-4 mr-2" />
            Measurements in CM
          </Badge>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Follow our detailed video guides to take accurate body measurements. 
          These measurements will be used with proper ease allowances for the perfect fit.
        </p>
      </div>

      {/* Important Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-900">Important Notice on Body Measurements</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 text-sm text-amber-800">
            <p>
              <strong>Body Measurements:</strong> These are measurements of your actual body dimensions. 
              We will automatically apply the necessary overmeasurements (ease) to ensure proper fit and comfort.
            </p>
            <p>
              <strong>Example:</strong> If your chest circumference is 95 cm, we will add 5-6 cm of overmeasurement 
              so the jacket has enough fabric for ease of movement and comfortable wear.
            </p>
            <p className="font-medium">
              Providing accurate body measurements is essential, as it directly determines 
              the fit of your finished garment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {measurementVideos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{video.title}</CardTitle>
              <p className="text-sm text-gray-600">{video.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Thumbnail/Player */}
              <div 
                className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors"
                onClick={() => setSelectedVideo(video.id)}
              >
                <div className="text-center">
                  <Play className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Watch Guide</p>
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
                    value={measurements[video.id] || ""}
                    onChange={(e) => handleMeasurementInput(video.id, parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                  />
                  <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                    cm
                  </span>
                </div>
                {measurements[video.id] > 0 && (
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

      {/* Progress and Action */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">
                Progress: {Object.keys(measurements).filter(key => measurements[key] > 0).length} / {measurementVideos.length}
              </h4>
              <p className="text-sm text-gray-600">
                Complete all measurements to proceed with your order
              </p>
            </div>
            <Button 
              onClick={() => onMeasurementsComplete(measurements)}
              disabled={!isComplete}
              className="px-6"
            >
              Complete Body Measurements
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {measurementVideos.find(v => v.id === selectedVideo)?.title}
                </h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedVideo(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              <VideoPlayer
                title={measurementVideos.find(v => v.id === selectedVideo)?.title || ""}
                description={measurementVideos.find(v => v.id === selectedVideo)?.description || ""}
                videoUrl={measurementVideos.find(v => v.id === selectedVideo)?.videoUrl}
              />
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Watch the video carefully and follow the exact positioning shown. 
                  Use a flexible measuring tape and have someone help you for the most accurate measurements.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
