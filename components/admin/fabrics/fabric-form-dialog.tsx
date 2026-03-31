"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Palette, Hash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  createFabric,
  updateFabric,
  uploadFabricImage,
  PBR_PRESETS,
  type FabricRow,
  type Product,
} from "@/lib/supabase/service"

// Common fabric swatch colors
const SWATCH_COLORS = [
  "#FFFFFF", "#F5F5DC", "#FAF0E6", "#FFE4C4", "#D2B48C", "#C4A882",
  "#8B7355", "#6B4226", "#3C1414", "#1A1A1A", "#000000",
  "#1565C0", "#1E3A8A", "#0D47A1", "#283593", "#1A237E",
  "#2E7D32", "#388E3C", "#1B5E20", "#4A6741",
  "#B71C1C", "#C62828", "#8E24AA", "#6A1B9A",
  "#F5E6D3", "#E8D5B7", "#D4C5A9", "#C0B090",
  "#9E9E9E", "#757575", "#616161", "#424242",
]

interface FabricFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fabric: FabricRow | null
  products: Product[]
  onSaved: () => void
}

const DEFAULT_PBR = PBR_PRESETS.cotton

export function FabricFormDialog({ open, onOpenChange, fabric, products, onSaved }: FabricFormDialogProps) {
  const isEditing = !!fabric
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [name, setName] = useState("")
  const [productId, setProductId] = useState("")
  const [fabricType, setFabricType] = useState<"cotton" | "linen" | "polyester">("cotton")
  const [inputMode, setInputMode] = useState<"swatch" | "hex" | "upload">("swatch")
  const [colorHex, setColorHex] = useState("#FFFFFF")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [price, setPrice] = useState(0)
  const [isPrinted, setIsPrinted] = useState(false)
  const [pbrSettings, setPbrSettings] = useState(DEFAULT_PBR)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewFile, setPreviewFile] = useState<string | null>(null)

  // Load editing data
  useEffect(() => {
    if (fabric) {
      setName(fabric.name)
      setProductId(fabric.product_id)
      setFabricType(fabric.fabric_type as "cotton" | "linen" | "polyester")
      setInputMode(fabric.input_mode as "swatch" | "hex" | "upload")
      setColorHex(fabric.color_hex || "#FFFFFF")
      setImageUrl(fabric.image_url)
      setThumbnailUrl(fabric.thumbnail_url)
      setPrice(Number(fabric.price))
      setIsPrinted(fabric.is_printed)
      setPbrSettings(fabric.pbr_settings)
    } else {
      resetForm()
    }
  }, [fabric, open])

  const resetForm = () => {
    setName("")
    setProductId(products[0]?.id || "")
    setFabricType("cotton")
    setInputMode("swatch")
    setColorHex("#FFFFFF")
    setImageUrl(null)
    setThumbnailUrl(null)
    setPrice(0)
    setIsPrinted(false)
    setPbrSettings(DEFAULT_PBR)
    setPreviewFile(null)
  }

  // When fabric type changes, update PBR defaults
  useEffect(() => {
    if (!isEditing) {
      setPbrSettings(PBR_PRESETS[fabricType] || DEFAULT_PBR)
    }
  }, [fabricType, isEditing])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !productId) return

    // Preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewFile(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const url = await uploadFabricImage(file, productId)
      if (url) {
        setImageUrl(url)
        setThumbnailUrl(url)
        toast({ title: "Uploaded", description: "Fabric image uploaded successfully." })
      } else {
        toast({ title: "Upload failed", description: "Could not upload image.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({ title: "Error", description: "Upload failed.", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const updatePbr = (key: string, val: number) => {
    setPbrSettings((prev) => ({ ...prev, [key]: val }))
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Validation", description: "Name is required.", variant: "destructive" })
      return
    }
    if (!productId) {
      toast({ title: "Validation", description: "Select a product.", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const fabricData = {
        product_id: productId,
        name: name.trim(),
        fabric_type: fabricType,
        input_mode: inputMode,
        color_hex: inputMode === "upload" ? null : colorHex,
        image_url: inputMode === "upload" ? imageUrl : null,
        thumbnail_url: inputMode === "upload" ? thumbnailUrl : null,
        price,
        is_printed: isPrinted,
        pbr_settings: pbrSettings,
        sort_order: 0,
      }

      if (isEditing && fabric) {
        await updateFabric(fabric.id, fabricData)
        toast({ title: "Updated", description: "Fabric updated successfully." })
      } else {
        await createFabric(fabricData)
        toast({ title: "Created", description: "Fabric added successfully." })
      }

      onSaved()
    } catch (error) {
      console.error("Save error:", error)
      toast({ title: "Error", description: "Failed to save fabric.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Fabric" : "Add New Fabric"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update fabric settings and appearance." : "Configure a new fabric for your products."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fabric-name">Fabric Name</Label>
              <Input
                id="fabric-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. White Oxford"
              />
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fabric Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fabric Type</Label>
              <Select value={fabricType} onValueChange={(v) => setFabricType(v as typeof fabricType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cotton">Cotton (Poplin)</SelectItem>
                  <SelectItem value="linen">Linen</SelectItem>
                  <SelectItem value="polyester">Polyester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fabric-price">Price Surcharge ($)</Label>
              <Input
                id="fabric-price"
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Input Mode Tabs */}
          <div className="space-y-2">
            <Label>Color / Fabric Input</Label>
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as typeof inputMode)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="swatch" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Swatches
                </TabsTrigger>
                <TabsTrigger value="hex" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" /> Hex Code
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Upload
                </TabsTrigger>
              </TabsList>

              {/* Swatch Picker */}
              <TabsContent value="swatch" className="space-y-3">
                <div className="grid grid-cols-8 gap-2">
                  {SWATCH_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                        colorHex === color ? "border-blue-600 ring-2 ring-blue-300 scale-110" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setColorHex(color)}
                      type="button"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded border" style={{ backgroundColor: colorHex }} />
                  <span className="text-sm text-muted-foreground">Selected: {colorHex}</span>
                </div>
              </TabsContent>

              {/* Hex Code Input */}
              <TabsContent value="hex" className="space-y-3">
                <div className="flex items-center gap-3">
                  <Input
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    placeholder="#FFFFFF"
                    className="max-w-[180px] font-mono"
                  />
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <div
                    className="w-10 h-10 rounded border"
                    style={{ backgroundColor: colorHex }}
                  />
                </div>
              </TabsContent>

              {/* Upload */}
              <TabsContent value="upload" className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isPrinted}
                    onCheckedChange={setIsPrinted}
                    id="printed-toggle"
                  />
                  <Label htmlFor="printed-toggle">Printed fabric (pattern/design)</Label>
                </div>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewFile || imageUrl ? (
                    <img
                      src={previewFile || imageUrl!}
                      alt="Fabric preview"
                      className="max-h-32 mx-auto rounded object-contain"
                    />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload fabric image (JPG, PNG, WebP)
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
              </TabsContent>
            </Tabs>
          </div>

          {/* PBR Settings */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm">Material Settings (PBR)</h4>
            <p className="text-xs text-muted-foreground">
              Adjust how the fabric looks on the 3D model. Defaults are set based on fabric type.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Normal Scale ({pbrSettings.normal_scale.toFixed(2)})</Label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[pbrSettings.normal_scale]}
                  onValueChange={([v]) => updatePbr("normal_scale", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Roughness ({pbrSettings.roughness.toFixed(2)})</Label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[pbrSettings.roughness]}
                  onValueChange={([v]) => updatePbr("roughness", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bump Scale ({pbrSettings.bump_scale.toFixed(2)})</Label>
                <Slider
                  min={0}
                  max={0.5}
                  step={0.01}
                  value={[pbrSettings.bump_scale]}
                  onValueChange={([v]) => updatePbr("bump_scale", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sheen ({pbrSettings.sheen.toFixed(2)})</Label>
                <Slider
                  min={0}
                  max={0.5}
                  step={0.01}
                  value={[pbrSettings.sheen]}
                  onValueChange={([v]) => updatePbr("sheen", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Repeat X ({pbrSettings.repeat_x})</Label>
                <Slider
                  min={1}
                  max={16}
                  step={1}
                  value={[pbrSettings.repeat_x]}
                  onValueChange={([v]) => updatePbr("repeat_x", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Repeat Y ({pbrSettings.repeat_y})</Label>
                <Slider
                  min={1}
                  max={16}
                  step={1}
                  value={[pbrSettings.repeat_y]}
                  onValueChange={([v]) => updatePbr("repeat_y", v)}
                />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Darkness ({pbrSettings.darkness.toFixed(2)})</Label>
                <Slider
                  min={-0.5}
                  max={0.5}
                  step={0.01}
                  value={[pbrSettings.darkness]}
                  onValueChange={([v]) => updatePbr("darkness", v)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Update Fabric" : "Add Fabric"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
