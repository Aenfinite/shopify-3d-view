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
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/admin/shared/image-upload"
import { useToast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload } from "lucide-react"

const garmentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  basePrice: z.coerce.number().positive({ message: "Base price must be positive" }),
  isActive: z.boolean().default(true),
  shopifyProductId: z.string().optional(),
  shopifyVariantId: z.string().optional(),
  availableForMTM: z.boolean().default(true),
  availableForMTO: z.boolean().default(true),
  defaultFabricId: z.string().optional(),
  allowedFabricCategories: z.array(z.string()).optional(),
  allowedStyleCategories: z.array(z.string()).optional(),
  requiredMeasurements: z.array(z.string()).optional(),
})

type GarmentFormValues = z.infer<typeof garmentSchema> & {
  thumbnailUrl?: string
  modelUrl?: string
}

interface GarmentFormProps {
  garmentId?: string
}

export function GarmentForm({ garmentId }: GarmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Mock data for dropdowns
  const fabricCategories = ["cotton", "wool", "linen", "blend"]
  const styleCategories = ["collar", "cuff", "placket", "pocket", "back", "monogram"]
  const measurementTypes = ["chest", "waist", "shoulder", "sleeve", "neck", "hip"]

  const form = useForm<GarmentFormValues>({
    resolver: zodResolver(garmentSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      basePrice: 99.99,
      isActive: true,
      shopifyProductId: "",
      shopifyVariantId: "",
      availableForMTM: true,
      availableForMTO: true,
      defaultFabricId: "",
      allowedFabricCategories: [],
      allowedStyleCategories: [],
      requiredMeasurements: [],
      thumbnailUrl: "",
      modelUrl: "",
    },
  })

  const onSubmit = async (data: GarmentFormValues) => {
    try {
      setLoading(true)

      // In a real implementation, you would upload the files to Firebase Storage
      // and save the garment data to Firestore

      console.log("Saving garment:", data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: garmentId ? "Garment updated successfully" : "Garment created successfully",
      })

      router.push("/admin/garments")
    } catch (error) {
      console.error("Error saving garment:", error)
      toast({
        title: "Error",
        description: "Failed to save garment. Please try again.",
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="customization">Customization</TabsTrigger>
            <TabsTrigger value="images">Images & 3D Model</TabsTrigger>
            <TabsTrigger value="shopify">Shopify Integration</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details for this garment</CardDescription>
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
                          <Input placeholder="Classic Oxford Shirt" {...field} />
                        </FormControl>
                        <FormDescription>The display name of the garment</FormDescription>
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
                        <FormDescription>The category this garment belongs to</FormDescription>
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
                          placeholder="A classic Oxford shirt with customizable features..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>A detailed description of the garment</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <FormDescription>The starting price for this garment</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active Status</FormLabel>
                          <FormDescription>Whether this garment is available for customers to purchase</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="availableForMTM"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Available for MTM</FormLabel>
                          <FormDescription>Whether this garment is available for Made-to-Measure</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availableForMTO"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Available for MTO</FormLabel>
                          <FormDescription>Whether this garment is available for Made-to-Order</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customization Tab */}
          <TabsContent value="customization" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Customization Options</CardTitle>
                <CardDescription>Configure which customization options are available for this garment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="fabrics">
                    <AccordionTrigger>Fabric Options</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="defaultFabricId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Fabric</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a default fabric" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="fabric-1">White Oxford</SelectItem>
                                <SelectItem value="fabric-2">Blue Poplin</SelectItem>
                                <SelectItem value="fabric-3">Charcoal Wool</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>The default fabric for this garment</FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allowedFabricCategories"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel>Allowed Fabric Categories</FormLabel>
                              <FormDescription>
                                Select which fabric categories are available for this garment
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {fabricCategories.map((category) => (
                                <FormField
                                  key={category}
                                  control={form.control}
                                  name="allowedFabricCategories"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={category}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(category)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...(field.value || []), category])
                                                : field.onChange(
                                                    field.value?.filter((value) => value !== category) || [],
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal capitalize">{category}</FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="styles">
                    <AccordionTrigger>Style Options</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="allowedStyleCategories"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel>Allowed Style Categories</FormLabel>
                              <FormDescription>
                                Select which style categories are available for this garment
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {styleCategories.map((category) => (
                                <FormField
                                  key={category}
                                  control={form.control}
                                  name="allowedStyleCategories"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={category}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(category)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...(field.value || []), category])
                                                : field.onChange(
                                                    field.value?.filter((value) => value !== category) || [],
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal capitalize">{category}</FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="measurements">
                    <AccordionTrigger>Measurement Requirements</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="requiredMeasurements"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel>Required Measurements</FormLabel>
                              <FormDescription>Select which measurements are required for this garment</FormDescription>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {measurementTypes.map((measurement) => (
                                <FormField
                                  key={measurement}
                                  control={form.control}
                                  name="requiredMeasurements"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={measurement}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(measurement)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...(field.value || []), measurement])
                                                : field.onChange(
                                                    field.value?.filter((value) => value !== measurement) || [],
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal capitalize">{measurement}</FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images & 3D Model Tab */}
          <TabsContent value="images" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Images & 3D Model</CardTitle>
                <CardDescription>Upload images and 3D model for this garment</CardDescription>
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
                    Upload a thumbnail image for this garment (recommended size: 800x800px)
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
                        {modelFile ? modelFile.name : "Click to upload 3D model"}
                      </p>
                      <p className="text-xs text-muted-foreground">GLB or GLTF format, max 10MB</p>
                    </label>
                  </div>
                </div>

                <div>
                  <FormLabel>Additional Images</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="border-2 border-dashed rounded-lg p-4 text-center">
                        <div className="flex flex-col items-center justify-center h-32 cursor-pointer">
                          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground">Upload image</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shopify Integration Tab */}
          <TabsContent value="shopify" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Shopify Integration</CardTitle>
                <CardDescription>Connect this garment to your Shopify store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="shopifyProductId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shopify Product ID</FormLabel>
                      <FormControl>
                        <Input placeholder="gid://shopify/Product/1234567890" {...field} />
                      </FormControl>
                      <FormDescription>The Shopify Product ID for this garment</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shopifyVariantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shopify Variant ID</FormLabel>
                      <FormControl>
                        <Input placeholder="gid://shopify/ProductVariant/1234567890" {...field} />
                      </FormControl>
                      <FormDescription>The Shopify Variant ID for this garment</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.push("/admin/garments")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : garmentId ? "Update Garment" : "Create Garment"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
