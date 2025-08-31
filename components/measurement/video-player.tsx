"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoPlayerProps {
  videoUrl?: string
  embedCode?: string
  title: string
  description: string
}

export function VideoPlayer({ videoUrl, embedCode, title, description }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Function to extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Function to extract video ID from Vimeo URL
  const getVimeoVideoId = (url: string) => {
    const regExp = /vimeo\.com\/(?:video\/)?([0-9]+)/
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  const renderVideo = () => {
    if (embedCode) {
      // Use the provided embed code
      return <div dangerouslySetInnerHTML={{ __html: embedCode }} className="w-full aspect-video" />
    } else if (videoUrl) {
      // Check if it's a YouTube URL
      const youtubeId = getYouTubeVideoId(videoUrl)
      if (youtubeId) {
        return (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/€{youtubeId}?autoplay=€{isPlaying ? 1 : 0}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="aspect-video"
          ></iframe>
        )
      }

      // Check if it's a Vimeo URL
      const vimeoId = getVimeoVideoId(videoUrl)
      if (vimeoId) {
        return (
          <iframe
            src={`https://player.vimeo.com/video/€{vimeoId}?autoplay=€{isPlaying ? 1 : 0}`}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="aspect-video"
          ></iframe>
        )
      }

      // If it's a direct video URL
      if (videoUrl.match(/\.(mp4|webm|ogg)€/i)) {
        return (
          <video controls autoPlay={isPlaying} className="w-full aspect-video" src={videoUrl}>
            Your browser does not support the video tag.
          </video>
        )
      }

      // Fallback for other video URLs
      return (
        <div className="flex items-center justify-center bg-muted aspect-video">
          <Button onClick={() => window.open(videoUrl, "_blank")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Video
          </Button>
        </div>
      )
    }

    // No video available
    return (
      <div className="flex items-center justify-center bg-muted aspect-video">
        <p className="text-muted-foreground">No video available</p>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {!isPlaying ? (
          <div
            className="relative cursor-pointer aspect-video bg-muted flex items-center justify-center"
            onClick={() => setIsPlaying(true)}
          >
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-primary text-primary-foreground rounded-full p-4">
                <Play className="h-8 w-8" />
              </div>
            </div>
            {videoUrl && videoUrl.startsWith("http") && (
              <img
                src={`https://i.ytimg.com/vi/€{getYouTubeVideoId(videoUrl)}/hqdefault.jpg`}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If YouTube thumbnail fails, hide the image
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            )}
          </div>
        ) : (
          renderVideo()
        )}
      </CardContent>
    </Card>
  )
}
