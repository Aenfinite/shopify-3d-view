"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { DragDropUpload } from "@/components/admin/shared/drag-drop-upload"
import { uploadFile } from "@/lib/firebase/storage-service"
import { saveMeasurementVideo } from "@/lib/firebase/measurement-service"

const videoSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  measurementType: z.string().min(1, { message: "Measurement type is required" }),
  videoUrl: z.string().url().optional().or(z.literal("")),
  embedCode: z.string().optional(),
  isActive: z.boolean().default(true),
})

type VideoFormValues = z.infer<typeof videoSchema> & {
  thumbnailUrl?: string
}

interface MeasurementVideoFormProps {
  videoId?: string
}

export function MeasurementVideoForm({ videoId }: MeasurementVideoFormProps) {
  const [loading, setLoading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailProgress, setThumbnailProgress] = useState(0)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoProgress, setVideoProgress] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "",
      description: "",
      measurementType: "",
      videoUrl: "",
      embedCode: "",
      isActive: true,
      thumbnailUrl: "",
    },
  })

  const onSubmit = async (data: VideoFormValues) => {
    try {
      setLoading(true)

      // Upload thumbnail if selected
      let thumbnailUrl = data.thumbnailUrl || ""
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, "measurements/thumbnails", (progress) =>
          setThumbnailProgress(progress),
        )
      }

      // Upload video if selected
      let videoUrl = data.videoUrl || ""
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, "measurements/videos", (progress) => setVideoProgress(progress))
      }

      const videoData = {
        id: videoId || `video-€{Date.now()}`,
        title: data.title,
        description: data.description,
        measurementType: data.measurementType,
        videoUrl,
        embedCode: data.embedCode || "",
        thumbnailUrl,
        isActive: data.isActive,
        createdAt: new Date().toISOString(),
      }

      await saveMeasurementVideo(videoData)

      toast({
        title: "Success",
        description: videoId ? "Video updated successfully" : "Video created successfully",
      })

      router.push("/admin/guides")
    } catch (error) {
      console.error("Error saving video:", error)
      toast({
        title: "Error",
        description: "Failed to save video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{videoId ? "Edit Measurement Video" : "Add New Measurement Video"}</CardTitle>
        <CardDescription>
          {videoId
            ? "Update the measurement video details below"
            : "Enter the details below to create a new measurement video guide"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="How to Measure Chest Size" {...field} />
                    </FormControl>
                    <FormDescription>The title of this measurement video</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="measurementType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurement Type</FormLabel>
                    <FormControl>
                      <Input placeholder="chest" {...field} />
                    </FormControl>
                    <FormDescription>The type of measurement (e.g., chest, waist, sleeve)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Learn how to properly measure your chest for a perfect fit..." {...field} />
                  </FormControl>
                  <FormDescription>A detailed description of this measurement video</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormLabel>Thumbnail Image</FormLabel>
                <DragDropUpload
                  onFileSelected={setThumbnailFile}
                  currentFileUrl={form.watch("thumbnailUrl")}
                  acceptedFileTypes="image/*"
                  maxFileSizeMB={2}
                  uploadProgress={thumbnailProgress}
                  label="Upload thumbnail image"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a thumbnail image for this video (recommended size: 16:9 ratio)
                </p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormDescription>Enter a YouTube or Vimeo URL, or upload your own video</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Upload Video (Optional)</FormLabel>
                  <DragDropUpload
                    onFileSelected={setVideoFile}
                    acceptedFileTypes="video/*"
                    maxFileSizeMB={50}
                    uploadProgress={videoProgress}
                    label="Upload video file"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload your own video file (MP4 format recommended, max 50MB)
                  </p>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="embedCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embed Code (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="<iframe src='...'></iframe>" {...field} />
                  </FormControl>
                  <FormDescription>
                    If you have a custom embed code from YouTube, Vimeo, or another platform, paste it here
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>When checked, this video will be visible to customers</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/guides")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : videoId ? "Update Video" : "Create Video"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
