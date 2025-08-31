"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ClothingTypeFormData {
  name: string
  description: string
  category: string
  basePrice: number
  isActive: boolean
  allowMTM: boolean
  allowMTO: boolean
}

const CLOTHING_CATEGORIES = [
  { value: "tops", label: "Tops (Shirts, Blouses, T-shirts)" },
  { value: "bottoms", label: "Bottoms (Pants, Skirts, Shorts)" },
  { value: "outerwear", label: "Outerwear (Jackets, Coats, Blazers)" },
  { value: "dresses", label: "Dresses & Gowns" },
  { value: "suits", label: "Suits & Sets" },
  { value: "accessories", label: "Accessories (Ties, Scarves)" },
  { value: "underwear", label: "Underwear & Intimates" },
  { value: "activewear", label: "Activewear & Sportswear" },
]

export function ClothingTypeForm() {
  const [formData, setFormData] = useState<ClothingTypeFormData>({
    name: "",
    description: "",
    category: "",
    basePrice: 0,
    isActive: true,
    allowMTM: true,
    allowMTO: false,
  })

  const [modelFile, setModelFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (field: keyof ClothingTypeFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (type: "model" | "thumbnail", file: File | null) => {
    if (type === "model") {
      setModelFile(file)
    } else {
      setThumbnailFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In real implementation, this would:
      // 1. Upload files to Firebase Storage
      // 2. Create clothing type in Firestore
      // 3. Generate default customization steps

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Success!",
        description: `€{formData.name} has been created and added to your clothing types.`,
      })

      // Redirect to customization setup
      router.push(`/admin/clothing-types/new-item-€{Date.now()}/customization`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create clothing type. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This new clothing type will be added alongside your existing mock items (shirts, jackets, pants). All items
          will be available in the customer configurator.
        </AlertDescription>
      </Alert>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Core details about your new clothing type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Clothing Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Polo Shirt, Evening Dress, Casual Blazer"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CLOTHING_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the clothing item, its features, and customization options..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="basePrice">Base Price (€) *</Label>
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="99.99"
              value={formData.basePrice || ""}
              onChange={(e) => handleInputChange("basePrice", Number.parseFloat(e.target.value) || 0)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* 3D Model Upload */}
      <Card>
        <CardHeader>
          <CardTitle>3D Model & Images</CardTitle>
          <CardDescription>Upload the 3D model and thumbnail for this clothing type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 3D Model Upload */}
            <div className="space-y-2">
              <Label>3D Model File (GLB/GLTF)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {modelFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="secondary">{modelFile.name}</Badge>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleFileUpload("model", null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{(modelFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div>
                      <Button type="button" variant="outline" asChild>
                        <label htmlFor="model-upload" className="cursor-pointer">
                          Upload 3D Model
                        </label>
                      </Button>
                      <input
                        id="model-upload"
                        type="file"
                        accept=".glb,.gltf"
                        className="hidden"
                        onChange={(e) => handleFileUpload("model", e.target.files?.[0] || null)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">GLB or GLTF format, max 50MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Thumbnail Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {thumbnailFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="secondary">{thumbnailFile.name}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileUpload("thumbnail", null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{(thumbnailFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div>
                      <Button type="button" variant="outline" asChild>
                        <label htmlFor="thumbnail-upload" className="cursor-pointer">
                          Upload Thumbnail
                        </label>
                      </Button>
                      <input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload("thumbnail", e.target.files?.[0] || null)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG, or WebP, max 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Configure availability and customization options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Make this clothing type available to customers immediately
              </p>
            </div>
            <Switch checked={formData.isActive} onCheckedChange={(checked) => handleInputChange("isActive", checked)} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Made-to-Measure (MTM)</Label>
              <p className="text-sm text-muted-foreground">Allow customers to provide custom measurements</p>
            </div>
            <Switch checked={formData.allowMTM} onCheckedChange={(checked) => handleInputChange("allowMTM", checked)} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Made-to-Order (MTO)</Label>
              <p className="text-sm text-muted-foreground">Allow pre-orders for this clothing type</p>
            </div>
            <Switch checked={formData.allowMTO} onCheckedChange={(checked) => handleInputChange("allowMTO", checked)} />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.name || !formData.category}>
          {isSubmitting ? "Creating..." : "Create & Configure Customization"}
        </Button>
      </div>
    </form>
  )
}
