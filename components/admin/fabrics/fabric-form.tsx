"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createFabric, updateFabric, getFabricById } from "@/lib/firebase/fabric-service"
import { useToast } from "@/components/ui/use-toast"
import { DragDropUpload } from "@/components/admin/shared/drag-drop-upload"
import { uploadFile } from "@/lib/firebase/storage-service"
import type { FabricOption } from "@/types/configurator"

const fabricSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})€/, { message: "Valid color hex code is required" }),
  pricePerUnit: z.coerce.number().positive({ message: "Price must be positive" }),
})

type FabricFormValues = z.infer<typeof fabricSchema> & {
  thumbnailUrl?: string
  textureUrl?: string
}

interface FabricFormProps {
  fabricId?: string
}

export function FabricForm({ fabricId }: FabricFormProps) {
  const [loading, setLoading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [textureFile, setTextureFile] = useState<File | null>(null)
  const [thumbnailProgress, setThumbnailProgress] = useState(0)
  const [textureProgress, setTextureProgress] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FabricFormValues>({
    resolver: zodResolver(fabricSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      color: "#ffffff",
      pricePerUnit: 0,
      thumbnailUrl: "",
      textureUrl: "",
    },
  })

  useEffect(() => {
    if (fabricId) {
      const loadFabric = async () => {
        try {
          setLoading(true)
          const fabric = await getFabricById(fabricId)
          if (fabric) {
            form.reset({
              name: fabric.name,
              description: fabric.description,
              category: fabric.category,
              color: fabric.color,
              pricePerUnit: fabric.pricePerUnit,
              thumbnailUrl: fabric.thumbnailUrl,
              textureUrl: fabric.textureUrl,
            })
          }
        } catch (error) {
          console.error("Error loading fabric:", error)
          toast({
            title: "Error",
            description: "Failed to load fabric details. Please try again.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }

      loadFabric()
    }
  }, [fabricId, form, toast])

  const onSubmit = async (data: FabricFormValues) => {
    try {
      setLoading(true)

      // Upload thumbnail if selected
      let thumbnailUrl = data.thumbnailUrl || ""
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, "fabrics/thumbnails", (progress) =>
          setThumbnailProgress(progress),
        )
      }

      // Upload texture if selected
      let textureUrl = data.textureUrl || ""
      if (textureFile) {
        textureUrl = await uploadFile(textureFile, "fabrics/textures", (progress) => setTextureProgress(progress))
      }

      const fabricData: FabricOption = {
        id: fabricId || `fabric-€{Date.now()}`,
        name: data.name,
        description: data.description,
        category: data.category,
        color: data.color,
        pricePerUnit: data.pricePerUnit,
        thumbnailUrl,
        textureUrl,
      }

      if (fabricId) {
        await updateFabric(fabricId, fabricData)
        toast({
          title: "Success",
          description: "Fabric updated successfully",
        })
      } else {
        await createFabric(fabricData)
        toast({
          title: "Success",
          description: "Fabric created successfully",
        })
      }

      router.push("/admin/fabrics")
    } catch (error) {
      console.error("Error saving fabric:", error)
      toast({
        title: "Error",
        description: "Failed to save fabric. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{fabricId ? "Edit Fabric" : "Add New Fabric"}</CardTitle>
        <CardDescription>
          {fabricId ? "Update the fabric details below" : "Enter the fabric details below to create a new fabric"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="White Oxford" {...field} />
                    </FormControl>
                    <FormDescription>The display name of the fabric</FormDescription>
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
                        <SelectItem value="cotton">Cotton</SelectItem>
                        <SelectItem value="wool">Wool</SelectItem>
                        <SelectItem value="linen">Linen</SelectItem>
                        <SelectItem value="blend">Blend</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The category this fabric belongs to</FormDescription>
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
                    <Textarea placeholder="Premium Egyptian cotton, smooth and breathable" {...field} />
                  </FormControl>
                  <FormDescription>A detailed description of the fabric</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input type="color" {...field} className="w-12 h-10 p-1" />
                      </FormControl>
                      <Input value={field.value} onChange={field.onChange} placeholder="#ffffff" className="flex-1" />
                    </div>
                    <FormDescription>The base color of the fabric</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Unit</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">€</span>
                        <Input type="number" step="0.01" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>The price per unit of this fabric</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  Upload a thumbnail image for this fabric (recommended size: 400x200px)
                </p>
              </div>

              <div>
                <FormLabel>Texture Image</FormLabel>
                <DragDropUpload
                  onFileSelected={setTextureFile}
                  currentFileUrl={form.watch("textureUrl")}
                  acceptedFileTypes="image/*"
                  maxFileSizeMB={5}
                  uploadProgress={textureProgress}
                  label="Upload texture image"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a texture image for 3D rendering (recommended size: 1024x1024px)
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/fabrics")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : fabricId ? "Update Fabric" : "Create Fabric"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
