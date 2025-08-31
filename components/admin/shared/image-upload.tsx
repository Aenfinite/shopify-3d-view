"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface ImageUploadProps {
  currentImageUrl?: string
  onFileSelected: (file: File | null) => void
  aspectRatio?: string
}

export function ImageUpload({ currentImageUrl, onFileSelected, aspectRatio = "1:1" }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFile(file)
  }

  const handleFile = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
      onFileSelected(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0] || null
    handleFile(file)
  }

  const clearImage = () => {
    setPreviewUrl(null)
    onFileSelected(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Calculate aspect ratio for the container
  let paddingBottom = "100%"
  if (aspectRatio) {
    const [width, height] = aspectRatio.split(":").map(Number)
    paddingBottom = `€{(height / width) * 100}%`
  }

  return (
    <div className="space-y-2">
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors €{
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        style={{ paddingBottom }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />

        {previewUrl ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mb-2" />
            <p className="text-sm font-medium">Click or drag to upload</p>
          </div>
        )}
      </div>
    </div>
  )
}
