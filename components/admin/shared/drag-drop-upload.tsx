"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText, ImageIcon, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface DragDropUploadProps {
  onFileSelected: (file: File) => void
  onUploadComplete?: (url: string) => void
  acceptedFileTypes?: string
  maxFileSizeMB?: number
  className?: string
  uploadProgress?: number
  currentFileUrl?: string
  label?: string
}

export function DragDropUpload({
  onFileSelected,
  onUploadComplete,
  acceptedFileTypes = "image/*",
  maxFileSizeMB = 5,
  className,
  uploadProgress,
  currentFileUrl,
  label = "Upload file",
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentFileUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0])
    }
  }

  const validateAndProcessFile = (file: File) => {
    setError(null)

    // Check file type
    if (!file.type.match(acceptedFileTypes.replace(/\*/g, ".*"))) {
      setError(`Invalid file type. Please upload €{acceptedFileTypes.replace("*", "")} files.`)
      return
    }

    // Check file size
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setError(`File is too large. Maximum size is €{maxFileSizeMB}MB.`)
      return
    }

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // For non-image files, just show the file name
      setPreview(null)
    }

    onFileSelected(file)
  }

  const clearFile = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (onUploadComplete) {
      onUploadComplete("")
    }
  }

  const getFileIcon = () => {
    if (preview) return null

    if (acceptedFileTypes.includes("image")) {
      return <ImageIcon className="h-12 w-12 text-muted-foreground" />
    } else if (acceptedFileTypes.includes("video")) {
      return <Film className="h-12 w-12 text-muted-foreground" />
    } else {
      return <FileText className="h-12 w-12 text-muted-foreground" />
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          error ? "border-destructive" : "",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          className="sr-only"
          onChange={handleFileChange}
          aria-label={label}
        />

        {preview && preview.startsWith("data:image") ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        ) : currentFileUrl && currentFileUrl.startsWith("http") ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <img src={currentFileUrl || "/placeholder.svg"} alt="Current file" className="h-full w-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center cursor-pointer py-4"
            onClick={() => fileInputRef.current?.click()}
          >
            {getFileIcon()}
            <div className="mt-4 flex flex-col items-center">
              <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
              <p className="mb-1 text-sm font-semibold">
                <span className="text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                {acceptedFileTypes.replace("*", "")} (max {maxFileSizeMB}MB)
              </p>
            </div>
          </div>
        )}

        {uploadProgress !== undefined && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="h-2 w-full" />
            <p className="mt-1 text-xs text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}
