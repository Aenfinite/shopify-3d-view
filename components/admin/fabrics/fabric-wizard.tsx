"use client"

import { useState, useEffect, useRef, useMemo, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Palette,
  Hash,
  ChevronLeft,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SAMPLE_PRODUCTS_WITH_CUSTOMIZATION } from "@/data/sample-products-with-customization"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import * as THREE from "three"
import { applyFabricCustomization, preloadFabricPBR, preloadShirtPBR } from "@/lib/3d/customization-utils"
import {
  getAllProducts,
  PBR_PRESETS,
  type FabricRow,
  type Product,
} from "@/lib/supabase/service"
import { GarmentModel, CameraUpdater, CAMERA_PRESETS } from "./garment-canvas"

// Preload PBR textures as early as possible
if (typeof window !== "undefined") {
  preloadFabricPBR()
  preloadShirtPBR()
}

// ─── Constants ────────────────────────────────────────────────

const SWATCH_COLORS = [
  "#FFFFFF", "#F5F5F5", "#E0E0E0", "#BDBDBD", "#9E9E9E", "#757575", "#616161", "#212121",
  "#FFEBEE", "#FFCDD2", "#EF9A9A", "#E57373", "#EF5350", "#F44336", "#E53935", "#B71C1C",
  "#FFF3E0", "#FFE0B2", "#FFCC80", "#FFB74D", "#FFA726", "#FF9800", "#FB8C00", "#E65100",
  "#FFFDE7", "#FFF9C4", "#FFF59D", "#FFF176", "#FFEE58", "#FFEB3B", "#FDD835", "#F57F17",
  "#F1F8E9", "#DCEDC8", "#C5E1A5", "#AED581", "#9CCC65", "#8BC34A", "#7CB342", "#33691E",
  "#E8F5E9", "#C8E6C9", "#A5D6A7", "#81C784", "#66BB6A", "#4CAF50", "#43A047", "#1B5E20",
  "#E3F2FD", "#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3", "#1E88E5", "#0D47A1",
  "#EDE7F6", "#D1C4E9", "#B39DDB", "#9575CD", "#7E57C2", "#673AB7", "#5E35B1", "#311B92",
  "#FCE4EC", "#F8BBD0", "#F48FB1", "#F06292", "#EC407A", "#E91E63", "#D81B60", "#880E4F",
  "#EFEBE9", "#D7CCC8", "#BCAAA4", "#A1887F", "#8D6E63", "#795548", "#6D4C41", "#3E2723",
]

// Maps product-specific fabric type IDs to a PBR preset key
const PBR_TYPE_MAP: Record<string, string> = {
  cotton: "cotton",
  linen: "linen",
  polyester: "polyester",
  "wool-blend": "polyester",
  "premium-wool": "cotton",
  "washable-wool": "linen",
}

const PRODUCT_ICONS: Record<string, string> = {
  shirt: "👔",
  jacket: "🧥",
  pants: "👖",
  suit: "🤵",
  blazer: "🧥",
}

interface FabricWizardProps {
  editingFabric?: FabricRow | null
  onClose: () => void
  onSaved: () => void
}

export default function FabricWizard({ editingFabric, onClose, onSaved }: FabricWizardProps) {
  const { toast } = useToast()
  const isEditing = !!editingFabric
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Products
  const [products, setProducts] = useState<Product[]>([])

  // Step tracking
  const [currentStep, setCurrentStep] = useState(isEditing ? 4 : 0)

  // Form state
  const [productId, setProductId] = useState(editingFabric?.product_id || "")
  const [fabricType, setFabricType] = useState<"cotton" | "linen" | "polyester">(
    (editingFabric?.fabric_type as "cotton" | "linen" | "polyester") || "cotton"
  )
  const [inputMode, setInputMode] = useState<"swatch" | "hex" | "upload">(
    (editingFabric?.input_mode as "swatch" | "hex" | "upload") || "swatch"
  )
  const [colorHex, setColorHex] = useState(editingFabric?.color_hex || "#FFFFFF")
  const [imageUrl, setImageUrl] = useState<string | null>(editingFabric?.image_url || null)
  const [previewFile, setPreviewFile] = useState<string | null>(null)
  const [name, setName] = useState(editingFabric?.name || "")
  const [price, setPrice] = useState(editingFabric?.price ? Number(editingFabric.price) : 0)
  const [isPrinted, setIsPrinted] = useState(editingFabric?.is_printed || false)
  const [pbrSettings, setPbrSettings] = useState(
    editingFabric?.pbr_settings || PBR_PRESETS.cotton
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewZoom, setPreviewZoom] = useState(1.0)

  // Load products
  useEffect(() => {
    getAllProducts().then(setProducts)
  }, [])

  // Update PBR when fabric type changes (only for new fabrics)
  useEffect(() => {
    if (!isEditing && fabricType) {
      setPbrSettings(PBR_PRESETS[fabricType] || PBR_PRESETS.cotton)
    }
  }, [fabricType, isEditing])

  // Derived values
  const selectedProduct = products.find((p) => p.id === productId)
  const productType = selectedProduct?.type || "shirt"

  // Pull the real fabric-type options for the selected product from sample data
  const productFabricTypes = useMemo(() => {
    const opts = SAMPLE_PRODUCTS_WITH_CUSTOMIZATION[productId as keyof typeof SAMPLE_PRODUCTS_WITH_CUSTOMIZATION]
    if (!opts) return [
      { id: "cotton",    name: "Cotton",    value: "cotton",    price: 0, thumbnail: undefined as string | undefined },
      { id: "linen",     name: "Linen",     value: "linen",     price: 0, thumbnail: undefined as string | undefined },
      { id: "polyester", name: "Polyester", value: "polyester", price: 0, thumbnail: undefined as string | undefined },
    ]
    const step = opts.find((o: any) => o.id === "fabric-type")
    return (step?.values || []) as { id: string; name: string; value: string; price: number; thumbnail?: string }[]
  }, [productId])

  // Existing color swatches for the selected fabric type category (from sample data)
  const existingColorsForType = useMemo(() => {
    const opts = SAMPLE_PRODUCTS_WITH_CUSTOMIZATION[productId as keyof typeof SAMPLE_PRODUCTS_WITH_CUSTOMIZATION]
    if (!opts || !fabricType) return [] as { id: string; name: string; thumbnail?: string; color?: string }[]
    const step = opts.find((o: any) => o.id === "fabric-color")
    if (!step) return [] as { id: string; name: string; thumbnail?: string; color?: string }[]
    return (step.values as any[]).filter((v: any) => v.fabricType === fabricType) as { id: string; name: string; thumbnail?: string; color?: string }[]
  }, [productId, fabricType])

  const fabricColorForPreview = inputMode === "upload" ? null : colorHex
  const fabricImageForPreview = inputMode === "upload" ? (previewFile || imageUrl) : null

  // Step definitions
  const steps = [
    { label: "Product", description: "Select product" },
    { label: "Material Type", description: "Choose material" },
    { label: "Fabric Style", description: "Pick style" },
    { label: "Input", description: "Color or texture" },
    { label: "Details", description: "Name, price & save" },
  ]

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!productId
      case 1: return !!fabricType
      case 2: return !!fabricType
      case 3:
        if (inputMode === "upload") return !!(imageUrl || previewFile)
        return !!colorHex
      case 4: return !!name.trim()
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceed()) {
      setCurrentStep((s) => s + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !productId) return

    // Show local preview immediately (data URL) so the 3D preview updates instantly
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewFile(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("productId", productId)

      const res = await fetch("/api/admin/fabrics/upload", { method: "POST", body: form })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || "Upload failed")
      }
      const { url } = await res.json()
      setImageUrl(url)
      toast({ title: "Uploaded", description: "Fabric image uploaded successfully." })
    } catch (err: any) {
      console.error("Upload error:", err)
      toast({ title: "Upload failed", description: err?.message || "Could not upload image.", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const updatePbr = (key: string, val: number) => {
    setPbrSettings((prev) => ({ ...prev, [key]: val }))
  }

  const handleSave = async () => {
    if (!name.trim() || !productId) return

    setSaving(true)
    try {
      const fabricData = {
        product_id: productId,
        name: name.trim(),
        fabric_type: fabricType,
        input_mode: inputMode,
        color_hex: inputMode === "upload" ? null : colorHex,
        image_url: inputMode === "upload" ? imageUrl : null,
        thumbnail_url: inputMode === "upload" ? imageUrl : null,
        price,
        is_printed: isPrinted,
        pbr_settings: pbrSettings,
        sort_order: 0,
      }

      if (isEditing && editingFabric) {
        const res = await fetch(`/api/admin/fabrics/${editingFabric.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fabricData),
        })
        if (!res.ok) {
          const { error } = await res.json()
          throw new Error(error || "Update failed")
        }
        toast({ title: "Updated", description: "Fabric updated successfully." })
      } else {
        const res = await fetch(`/api/admin/fabrics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fabricData),
        })
        if (!res.ok) {
          const { error } = await res.json()
          throw new Error(error || "Create failed")
        }
        toast({ title: "Created", description: "Fabric added successfully." })
      }

      onSaved()
    } catch (err: any) {
      console.error("Save fabric error:", err)
      toast({ title: "Error", description: err?.message || "Failed to save fabric.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  // ─── Step Renderers ─────────────────────────────────────────

  const renderProductStep = () => {
    // Group products by type
    const grouped: Record<string, Product[]> = {}
    for (const p of products) {
      if (!grouped[p.type]) grouped[p.type] = []
      grouped[p.type].push(p)
    }

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Select Product</h3>
          <p className="text-sm text-muted-foreground">Which product is this fabric for?</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(grouped).map(([type, prods]) => (
            <div key={type} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {PRODUCT_ICONS[type] || "📦"} {type}s
              </p>
              <div className="grid grid-cols-1 gap-2">
                {prods.map((p) => (
                  <Card
                    key={p.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      productId === p.id
                        ? "ring-2 ring-primary border-primary bg-primary/5"
                        : "hover:border-gray-400"
                    }`}
                    onClick={() => setProductId(p.id)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <span className="text-2xl">{PRODUCT_ICONS[p.type] || "📦"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">${p.basePrice}</p>
                      </div>
                      {productId === p.id && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderFabricTypeStep = () => {
    const MATERIAL_TYPES: Array<{
      id: "cotton" | "linen" | "polyester"
      name: string
      subtitle: string
      description: string
      icon: string
      sampleBg: string
      badge: string
    }> = [
      {
        id: "cotton",
        name: "Cotton",
        subtitle: "Poplin / Oxford / Twill",
        description: "Fine, smooth weave with a soft hand-feel. Breathable and crisp. Ideal for shirts and lightweight tailoring.",
        icon: "🪡",
        sampleBg: "from-white to-gray-100",
        badge: "bg-blue-100 text-blue-800",
      },
      {
        id: "linen",
        name: "Linen",
        subtitle: "Natural / Washed / Blended",
        description: "Visible grain with a coarser, textured hand. Natural material variation gives each piece character.",
        icon: "🌾",
        sampleBg: "from-amber-50 to-yellow-100",
        badge: "bg-amber-100 text-amber-800",
      },
      {
        id: "polyester",
        name: "Polyester",
        subtitle: "Synthetic / Blend / Microfiber",
        description: "Smooth, uniform surface with low roughness and subtle sheen. Wrinkle-resistant construction.",
        icon: "✨",
        sampleBg: "from-blue-50 to-indigo-100",
        badge: "bg-purple-100 text-purple-800",
      },
    ]

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Material Type</h3>
          <p className="text-sm text-muted-foreground">
            Choose the fabric material — sets the 3D surface texture and PBR defaults.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {MATERIAL_TYPES.map((mt) => (
            <Card
              key={mt.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                fabricType === mt.id
                  ? "ring-2 ring-primary border-primary bg-primary/5"
                  : "hover:border-gray-400"
              }`}
              onClick={() => setFabricType(mt.id)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${mt.sampleBg} flex items-center justify-center text-2xl flex-shrink-0 border`}>
                  {mt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold">{mt.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${mt.badge}`}>{mt.subtitle}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{mt.description}</p>
                </div>
                {fabricType === mt.id && (
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderFabricStyleStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Fabric Style</h3>
        <p className="text-sm text-muted-foreground">
          Pick the specific fabric style for <span className="font-medium">{selectedProduct?.name || "this product"}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {productFabricTypes.map((ft) => (
          <Card
            key={ft.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              fabricType === ft.id
                ? "ring-2 ring-primary border-primary bg-primary/5"
                : "hover:border-gray-400"
            }`}
            onClick={() => setFabricType(ft.id as "cotton" | "linen" | "polyester")}
          >
            <CardContent className="p-3 flex items-center gap-3">
              {ft.thumbnail ? (
                <img
                  src={ft.thumbnail}
                  alt={ft.name}
                  className="w-14 h-14 rounded-lg object-cover border flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-100 border flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{ft.name}</p>
                {ft.price > 0 && (
                  <p className="text-xs text-muted-foreground">+${ft.price}</p>
                )}
              </div>
              {fabricType === ft.id && (
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderInputStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Fabric Input</h3>
        <p className="text-sm text-muted-foreground">Choose how to define the fabric appearance</p>
      </div>

      {/* Mode Selector Cards */}
      <div className="grid grid-cols-3 gap-2">
        {([
          { mode: "swatch" as const, icon: Palette, label: "Swatches" },
          { mode: "hex" as const, icon: Hash, label: "Hex Code" },
          { mode: "upload" as const, icon: Upload, label: "Upload" },
        ]).map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setInputMode(mode)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
              inputMode === mode
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 hover:border-gray-400 text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Mode Content */}
      <div className="mt-4">
        {inputMode === "swatch" && (
          <div className="space-y-3">
            <div className="grid grid-cols-8 gap-2">
              {SWATCH_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                    colorHex === color
                      ? "border-blue-600 ring-2 ring-blue-300 scale-110"
                      : "border-gray-300"
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
          </div>
        )}

        {inputMode === "hex" && (
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
            <div className="w-10 h-10 rounded border" style={{ backgroundColor: colorHex }} />
          </div>
        )}

        {inputMode === "upload" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch checked={isPrinted} onCheckedChange={setIsPrinted} id="printed" />
              <Label htmlFor="printed">Printed fabric (pattern/design)</Label>
            </div>

            {/* Upload dropzone */}
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewFile || imageUrl ? (
                <div className="space-y-2">
                  <img
                    src={previewFile || imageUrl!}
                    alt="Fabric"
                    className="max-h-24 mx-auto rounded object-contain"
                  />
                  <p className="text-xs text-green-600 font-medium">✓ Uploaded — click to replace</p>
                </div>
              ) : (
                <>
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload (JPG, PNG, WebP)
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
            {uploading && (
              <p className="text-sm text-blue-600 flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
              </p>
            )}

            {/* Siblings preview — shows existing swatches for this category + new one */}
            {(existingColorsForType.length > 0 || previewFile || imageUrl) && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  How it looks in the category
                </p>
                <div className="flex flex-wrap gap-2">
                  {existingColorsForType.map((c) => (
                    <div key={c.id} className="flex flex-col items-center gap-1">
                      {c.thumbnail ? (
                        <img
                          src={c.thumbnail}
                          alt={c.name}
                          className="w-12 h-12 rounded border-2 border-gray-200 object-cover"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded border-2 border-gray-200"
                          style={{ backgroundColor: c.color || "#ccc" }}
                        />
                      )}
                      <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-[52px] truncate">{c.name}</span>
                    </div>
                  ))}
                  {(previewFile || imageUrl) && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative">
                        <img
                          src={previewFile || imageUrl!}
                          alt="New"
                          className="w-12 h-12 rounded border-2 border-primary object-cover ring-2 ring-primary/30"
                        />
                        <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold px-1 rounded-full leading-tight">NEW</span>
                      </div>
                      <span className="text-[10px] text-primary font-medium text-center leading-tight max-w-[52px] truncate">{name || "New"}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderDetailsStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Details & Save</h3>
        <p className="text-sm text-muted-foreground">Name your fabric and adjust material settings</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="fabric-name">Fabric Name</Label>
          <Input
            id="fabric-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. White Oxford Cotton"
          />
        </div>

        <div className="space-y-1.5">
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

      {/* PBR Settings */}
      <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-sm">Material Settings (PBR)</h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Roughness ({pbrSettings.roughness.toFixed(2)})</Label>
            <Slider
              min={0} max={1} step={0.01}
              value={[pbrSettings.roughness]}
              onValueChange={([v]) => updatePbr("roughness", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sheen ({pbrSettings.sheen.toFixed(2)})</Label>
            <Slider
              min={0} max={0.5} step={0.01}
              value={[pbrSettings.sheen]}
              onValueChange={([v]) => updatePbr("sheen", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Normal ({pbrSettings.normal_scale.toFixed(2)})</Label>
            <Slider
              min={0} max={1} step={0.01}
              value={[pbrSettings.normal_scale]}
              onValueChange={([v]) => updatePbr("normal_scale", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Bump ({pbrSettings.bump_scale.toFixed(2)})</Label>
            <Slider
              min={0} max={0.5} step={0.01}
              value={[pbrSettings.bump_scale]}
              onValueChange={([v]) => updatePbr("bump_scale", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Repeat X ({pbrSettings.repeat_x})</Label>
            <Slider
              min={1} max={16} step={1}
              value={[pbrSettings.repeat_x]}
              onValueChange={([v]) => updatePbr("repeat_x", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Repeat Y ({pbrSettings.repeat_y})</Label>
            <Slider
              min={1} max={16} step={1}
              value={[pbrSettings.repeat_y]}
              onValueChange={([v]) => updatePbr("repeat_y", v)}
            />
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">Darkness ({pbrSettings.darkness.toFixed(2)})</Label>
            <Slider
              min={-0.5} max={0.5} step={0.01}
              value={[pbrSettings.darkness]}
              onValueChange={([v]) => updatePbr("darkness", v)}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const stepRenderers = [renderProductStep, renderFabricTypeStep, renderFabricStyleStep, renderInputStep, renderDetailsStep]

  // ─── Layout ─────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" />
          Back to Fabrics
        </Button>
        <div className="flex items-center gap-3">
          {selectedProduct && (
            <Badge variant="secondary">
              {PRODUCT_ICONS[productType]} {selectedProduct.name}
            </Badge>
          )}
          {fabricType && currentStep > 0 && (
            <Badge variant="outline" className="capitalize">{fabricType}</Badge>
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => i < currentStep && setCurrentStep(i)}
              disabled={i > currentStep}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all w-full ${
                i === currentStep
                  ? "bg-primary text-primary-foreground font-medium"
                  : i < currentStep
                  ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i < currentStep ? "bg-primary text-white" : i === currentStep ? "bg-white/20" : ""
              }`}>
                {i < currentStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <div className="text-left hidden md:block">
                <p className="leading-tight">{step.label}</p>
              </div>
            </button>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-4 flex-shrink-0 ${i < currentStep ? "bg-primary" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Main Content: Step + 3D Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 min-h-[500px]">
        {/* Left: Step Content */}
        <div className="overflow-y-auto pr-2">
          {stepRenderers[currentStep]()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="gap-1.5">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={saving || !canProceed()}
                className="gap-1.5"
              >
                {saving ? "Saving..." : isEditing ? "Update Fabric" : "Save Fabric"}
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Right: 3D Preview */}
        <div className="rounded-xl border bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden relative flex flex-col">
          {/* Top badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-xs">
              3D Preview — {productType || "shirt"}
            </Badge>
          </div>

          {/* Canvas — grows to fill the panel */}
          <div className="h-[620px]">
            <Canvas
              shadows
              camera={{
                position: (CAMERA_PRESETS[productType] || CAMERA_PRESETS.shirt).position,
                fov: (CAMERA_PRESETS[productType] || CAMERA_PRESETS.shirt).fov,
              }}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
              <Suspense fallback={null}>
                <color attach="background" args={["#f5f5f5"]} />
                <CameraUpdater productType={productType} />

                {/* Studio lighting matching the real website */}
                <ambientLight intensity={0.55} />
                <directionalLight
                  position={[3, 8, 4]}
                  intensity={0.8}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <directionalLight position={[-3, 5, 2]} intensity={0.45} />
                <directionalLight position={[0, 4, -4]} intensity={0.20} />
                <hemisphereLight args={["#f4efe8", "#3a3a3a", 0.28]} />
                <Environment preset="studio" environmentIntensity={0.15} />

                <GarmentModel
                  productType={productType}
                  fabricColor={fabricColorForPreview}
                  fabricImageUrl={fabricImageForPreview}
                  repeatX={pbrSettings.repeat_x}
                  repeatY={pbrSettings.repeat_y}
                  zoomMultiplier={previewZoom}
                  pbrSettings={{ ...pbrSettings, fabricMaterialType: fabricType }}
                />

                <OrbitControls
                  enablePan={false}
                  enableZoom={true}
                  minDistance={0.8}
                  maxDistance={10}
                  maxPolarAngle={Math.PI / 1.4}
                  minPolarAngle={Math.PI / 8}
                  target={new THREE.Vector3(...(CAMERA_PRESETS[productType] || CAMERA_PRESETS.shirt).target)}
                  autoRotate
                  autoRotateSpeed={0.8}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Zoom control bar */}
          <div className="px-4 py-3 bg-white/90 backdrop-blur-sm border-t flex items-center gap-3">
            <button
              onClick={() => setPreviewZoom((z) => Math.max(0.2, parseFloat((z - 0.1).toFixed(2))))}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <Slider
              min={0.2}
              max={3.0}
              step={0.05}
              value={[previewZoom]}
              onValueChange={([v]) => setPreviewZoom(v)}
              className="flex-1"
            />
            <button
              onClick={() => setPreviewZoom((z) => Math.min(3.0, parseFloat((z + 0.1).toFixed(2))))}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-gray-600 w-10 text-center flex-shrink-0">
              {previewZoom.toFixed(2)}×
            </span>
            <button
              onClick={() => setPreviewZoom(1.0)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0"
              title="Reset zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs text-muted-foreground hidden sm:block flex-shrink-0">
              Drag to rotate · Scroll to zoom
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
