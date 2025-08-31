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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/admin/shared/image-upload"
import { useToast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

const Icons = {
  spinner: Loader2,
}

const guideSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  measurementType: z.string().min(1, { message: "Measurement type is required" }),
  videoUrl: z.string().url().optional().or(z.literal("")),
  showInMTM: z.boolean().default(true),
  showInMTO: z.boolean().default(false),
  steps: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
})

type GuideFormValues = z.infer<typeof guideSchema> & {
  imageUrl?: string
  stepImages?: string[]
}

interface MeasurementGuideFormProps {
  guideId?: string
}

export function MeasurementGuideForm({ guideId }: MeasurementGuideFormProps) {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [stepImageFiles, setStepImageFiles] = useState<(File | null)[]>([null, null, null])
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<GuideFormValues>({
    resolver: zodResolver(guideSchema),
    defaultValues: {
      name: "",
      description: "",
      measurementType: "",
      videoUrl: "",
      imageUrl: "",
      showInMTM: true,
      showInMTO: false,
      steps: [
        { title: "Step 1", description: "" },
        { title: "Step 2", description: "" },
        { title: "Step 3", description: "" },
      ],
      stepImages: ["", "", ""],
    },
  })

  const onSubmit = async (data: GuideFormValues) => {
    try {
      setLoading(true)

      // In a real implementation, you would upload the images to Firebase Storage
      // and save the guide data to Firestore

      console.log("Saving guide:", data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: guideId ? "Guide updated successfully" : "Guide created successfully",
      })

      router.push("/admin/guides")
    } catch (error) {
      console.error("Error saving guide:", error)
      toast({
        title: "Error",
        description: "Failed to save guide. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStepImageChange = (index: number, file: File | null) => {
    const newStepImageFiles = [...stepImageFiles]
    newStepImageFiles[index] = file
    setStepImageFiles(newStepImageFiles)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="steps">Measurement Steps</TabsTrigger>
            <TabsTrigger value="media">Images & Video</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details for this measurement guide</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guide Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Chest Measurement" {...field} />
                        </FormControl>
                        <FormDescription>The name of this measurement guide</FormDescription>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a measurement type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="chest">Chest</SelectItem>
                            <SelectItem value="waist">Waist</SelectItem>
                            <SelectItem value="shoulder">Shoulder</SelectItem>
                            <SelectItem value="sleeve">Sleeve</SelectItem>
                            <SelectItem value="neck">Neck</SelectItem>
                            <SelectItem value="hip">Hip</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>The type of measurement this guide is for</FormDescription>
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
                        <Textarea placeholder="Detailed description of the measurement" {...field} />
                      </FormControl>
                      <FormDescription>Provide a detailed explanation of how to take this measurement</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Visibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Visibility Settings</CardTitle>
                <CardDescription>Control where this guide is displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="showInMTM"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium leading-none">Show in MTM</FormLabel>
                        <FormDescription>Display this guide in the Made-to-Measure section</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showInMTO"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium leading-none">Show in MTO</FormLabel>
                        <FormDescription>Display this guide in the Made-to-Order section</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Measurement Steps Tab */}
          <TabsContent value="steps" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Measurement Steps</CardTitle>
                <CardDescription>Define the steps required to take this measurement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="multiple" collapsible>
                  {form.watch("steps")?.map((step, index) => (
                    <AccordionItem value={`step-€{index}`} key={index}>
                      <AccordionTrigger>
                        Step {index + 1}: {step.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`steps.€{index}.title` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Step Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter step title" {...field} />
                                </FormControl>
                                <FormDescription>A brief title for this step</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`steps.€{index}.description` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Step Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Detailed description of the step" {...field} />
                                </FormControl>
                                <FormDescription>Provide a detailed explanation of this step</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images & Video Tab */}
          <TabsContent value="media" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Images & Video</CardTitle>
                <CardDescription>Add images and a video to help explain the measurement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ" {...field} />
                      </FormControl>
                      <FormDescription>A link to a video explaining the measurement (optional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Guide Image</FormLabel>
                  <ImageUpload
                    currentImageUrl={form.watch("imageUrl")}
                    onFileSelected={setImageFile}
                    aspectRatio="16:9"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    A representative image for this measurement guide
                  </p>
                </div>

                {/* Step Images */}
                {form.watch("steps")?.map((step, index) => (
                  <div key={index}>
                    <FormLabel>Step {index + 1} Image</FormLabel>
                    <ImageUpload
                      currentImageUrl={form.watch(`stepImages.€{index}`)}
                      onFileSelected={(file) => handleStepImageChange(index, file)}
                      aspectRatio="16:9"
                    />
                    <p className="text-sm text-muted-foreground mt-2">An image illustrating step {index + 1}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {guideId ? "Update Guide" : "Create Guide"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
