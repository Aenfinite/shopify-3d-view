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
import { Upload, Plus } from "lucide-react"
import { createModel, updateModel } from "@/lib/firebase/model-service"

const modelSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  basePrice: z.coerce.number().positive({ message: "Base price must be positive" }),
  customizationOptions: z.array(z.string()).default([]),
})

type ModelFormValues = z.infer<typeof modelSchema> & {
  thumbnailUrl?: string
  modelUrl?: string
}

interface ModelFormProps {
  modelId?: string
  initialData?: ModelFormValues
}

export function ModelForm({ modelId, initialData }: ModelFormProps) {
  const [loading, setLoading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      category: "",
      basePrice: 99.99,
      customizationOptions: [],
      thumbnailUrl: "",
      modelUrl: "",
    },
  })

  const onSubmit = async (data: ModelFormValues) => {
    try {
      setLoading(true)

      if (modelId) {
        // Update existing model
        await updateModel(modelId, data, modelFile || undefined, thumbnailFile || undefined)
        toast({
          title: "Success",
          description: "3D model updated successfully",
        })
      } else {
        // Create new model
        await createModel(data, modelFile || undefined, thumbnailFile || undefined)
        toast({
          title: "Success",
          description: "3D model created successfully",
        })
      }

      router.push("/admin/models")
    } catch (error) {
      console.error("Error saving 3D model:", error)
      toast({
        title: "Error",
        description: "Failed to save 3D model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="files">3D Model & Thumbnail</TabsTrigger>
            <TabsTrigger value="customization">Customization Options</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details for this 3D model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Classic Oxford Shirt Model" {...field} />
                        </FormControl>
                        <FormDescription>The display name of the 3D model</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="shirt">Shirt</SelectItem>
                            <SelectItem value="pants">Pants</SelectItem>
                            <SelectItem value="jacket">Jacket</SelectItem>
                            <SelectItem value="suit">Suit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>The category this 3D model belongs to</FormDescription>
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
                        <Textarea
                          placeholder="A detailed 3D model of a classic Oxford shirt with customizable features..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>A detailed description of the 3D model</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5">€</span>
                          <Input type="number" step="0.01" className="pl-7" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>The starting price for this model</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>3D Model & Thumbnail</CardTitle>
                <CardDescription>Upload the 3D model file and thumbnail image</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <FormLabel>Thumbnail Image</FormLabel>
                  <ImageUpload
                    currentImageUrl={form.watch("thumbnailUrl")}
                    onFileSelected={setThumbnailFile}
                    aspectRatio="1:1"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload a thumbnail image for this 3D model (recommended size: 800x800px)
                  </p>
                </div>

                <div>
                  <FormLabel>3D Model (GLB/GLTF)</FormLabel>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".glb,.gltf"
                      onChange={(e) => setModelFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="model-upload"
                    />
                    <label htmlFor="model-upload" className="flex flex-col items-center justify-center cursor-pointer">
                      <div className="rounded-full bg-muted p-4 mb-4">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium mb-1">
                        {modelFile
                          ? modelFile.name
                          : form.watch("modelUrl")
                            ? "Replace 3D model"
                            : "Click to upload 3D model"}
                      </p>
                      <p className="text-xs text-muted-foreground">GLB or GLTF format, max 10MB</p>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customization Options Tab */}
          <TabsContent value="customization" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Customization Options</CardTitle>
                <CardDescription>Define the customization options for this 3D model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  After creating the 3D model, you'll be able to add customization options such as colors, textures, and
                  style variations.
                </p>

                {modelId && (
                  <Button variant="outline" onClick={() => router.push(`/admin/models/€{modelId}/customization`)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Customization Options
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.push("/admin/models")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : modelId ? "Update 3D Model" : "Create 3D Model"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
