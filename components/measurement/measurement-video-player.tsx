"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react"

interface MeasurementVideo {
  id: number
  title: string
  description: string
  bodyPart: string
  instructions: string[]
  duration: string
  videoUrl?: string
  embedCode?: string
}

interface MeasurementVideoPlayerProps {
  selectedVideo?: number
  onVideoSelect: (videoId: number) => void
}

export function MeasurementVideoPlayer({ selectedVideo, onVideoSelect }: MeasurementVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // 14 Measurement Videos for Jacket
  const measurementVideos: MeasurementVideo[] = [
    {
      id: 1,
      title: "Chest Circumference",
      description: "How to measure your chest properly",
      bodyPart: "Chest",
      duration: "2:30",
      instructions: [
        "Stand straight with arms relaxed at your sides",
        "Wrap measuring tape around the fullest part of your chest",
        "Keep tape parallel to the floor",
        "Breathe normally and record measurement"
      ]
    },
    {
      id: 2,
      title: "Waist Circumference", 
      description: "Measuring your natural waistline",
      bodyPart: "Waist",
      duration: "2:15",
      instructions: [
        "Find your natural waistline (narrowest part)",
        "Wrap tape around your waist",
        "Keep tape snug but not tight",
        "Record measurement while standing straight"
      ]
    },
    {
      id: 3,
      title: "Hip Circumference",
      description: "Measuring around your hips",
      bodyPart: "Hips", 
      duration: "2:00",
      instructions: [
        "Stand with feet together",
        "Measure around the widest part of your hips",
        "Keep tape level and parallel to floor",
        "Record the measurement"
      ]
    },
    {
      id: 4,
      title: "Shoulder Width",
      description: "Measuring from shoulder point to shoulder point",
      bodyPart: "Shoulders",
      duration: "2:45",
      instructions: [
        "Stand straight with shoulders relaxed",
        "Measure from shoulder point to shoulder point",
        "Keep tape across your back, not around",
        "Have someone help you for accuracy"
      ]
    },
    {
      id: 5,
      title: "Arm Length",
      description: "From shoulder to wrist measurement",
      bodyPart: "Arm",
      duration: "3:00",
      instructions: [
        "Keep arm slightly bent at natural position",
        "Measure from shoulder point to wrist bone",
        "Follow the outside of your arm",
        "Record with arm in natural position"
      ]
    },
    {
      id: 6,
      title: "Jacket Length",
      description: "Preferred jacket length measurement",
      bodyPart: "Torso",
      duration: "2:20",
      instructions: [
        "Measure from base of neck (back)",
        "To desired jacket hem length", 
        "Typically covers bottom curve of seat",
        "Consider your preference and style"
      ]
    },
    {
      id: 7,
      title: "Neck Circumference",
      description: "Around the base of your neck",
      bodyPart: "Neck",
      duration: "1:45",
      instructions: [
        "Wrap tape around base of neck",
        "Keep one finger width of ease",
        "This is for collar fit",
        "Not too tight or too loose"
      ]
    },
    {
      id: 8,
      title: "Bicep Circumference",
      description: "Around the largest part of upper arm",
      bodyPart: "Bicep",
      duration: "2:10",
      instructions: [
        "Flex your bicep slightly",
        "Measure around the largest part",
        "Keep tape perpendicular to arm",
        "Record with slight muscle tension"
      ]
    },
    {
      id: 9,
      title: "Forearm Circumference",
      description: "Around the largest part of forearm",
      bodyPart: "Forearm",
      duration: "1:55",
      instructions: [
        "Keep arm relaxed",
        "Measure around largest part of forearm",
        "Usually about 1/3 down from elbow",
        "Keep tape snug but not tight"
      ]
    },
    {
      id: 10,
      title: "Wrist Circumference",
      description: "Around your wrist bone",
      bodyPart: "Wrist",
      duration: "1:30",
      instructions: [
        "Measure around wrist bone",
        "This is for cuff fit",
        "Keep tape snug",
        "Add ease for cuff style preference"
      ]
    },
    {
      id: 11,
      title: "Back Width",
      description: "Across your shoulder blades",
      bodyPart: "Back",
      duration: "2:35",
      instructions: [
        "Stand with arms at sides",
        "Measure across shoulder blades",
        "From armpit to armpit across back",
        "Keep tape straight across"
      ]
    },
    {
      id: 12,
      title: "Front Length",
      description: "From neck to waist (front)",
      bodyPart: "Front Torso",
      duration: "2:25",
      instructions: [
        "Measure from hollow of neck",
        "Down to natural waist (front)",
        "Keep tape straight down center",
        "Stand in natural posture"
      ]
    },
    {
      id: 13,
      title: "Back Length", 
      description: "From neck to waist (back)",
      bodyPart: "Back Torso",
      duration: "2:30",
      instructions: [
        "Measure from base of neck (back)",
        "Down to natural waist",
        "Keep tape straight down spine",
        "Have someone help you"
      ]
    },
    {
      id: 14,
      title: "Trouser Waist",
      description: "Where you wear your trousers",
      bodyPart: "Trouser Waist",
      duration: "2:00",
      instructions: [
        "Measure where you normally wear pants",
        "Usually slightly below natural waist",
        "Consider your preference",
        "This affects jacket length proportion"
      ]
    }
  ]

  const currentVideo = selectedVideo ? measurementVideos.find(v => v.id === selectedVideo) : null

  return (
    <div className="space-y-6">
      {/* Video Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {measurementVideos.map((video) => (
          <Card
            key={video.id}
            className={`cursor-pointer transition-all hover:shadow-md €{
              selectedVideo === video.id 
                ? "border-blue-500 bg-blue-50 shadow-md" 
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onVideoSelect(video.id)}
          >
            <CardContent className="p-3">
              <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
                <Play className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-xs font-medium mb-1">{video.title}</div>
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-xs">
                  Video {video.id}
                </Badge>
                <span className="text-xs text-gray-500">{video.duration}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Video Player */}
      {currentVideo && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="default">Video {currentVideo.id}</Badge>
                  {currentVideo.title}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{currentVideo.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Maximize className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Video Player */}
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border">
              <div className="text-center">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  {currentVideo.title} - {currentVideo.duration}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Video will be embedded here when integrated with your video hosting
                </p>
              </div>
            </div>

            {/* Video Controls */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="text-sm text-gray-500">
                Measuring: <span className="font-medium">{currentVideo.bodyPart}</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Measurement Instructions:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                {currentVideo.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> All measurements should be in centimeters (cm). 
                Have someone assist you for the most accurate measurements. 
                These are body measurements - we'll add the necessary ease for comfort.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      {!selectedVideo && (
        <Card>
          <CardHeader>
            <CardTitle>How to Take Body Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Follow our comprehensive 14-video guide to take accurate body measurements. 
                Each video provides step-by-step instructions for measuring different parts of your body.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What You'll Need:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Measuring tape (flexible)</li>
                    <li>• Someone to help you</li>
                    <li>• Well-fitting undergarments</li>
                    <li>• Good lighting</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Important Tips:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Stand naturally, don't suck in</li>
                    <li>• Keep tape snug, not tight</li>
                    <li>• Measure in centimeters (cm)</li>
                    <li>• Take measurements twice for accuracy</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={() => onVideoSelect(1)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start with Video 1: Chest Measurement
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
