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
  Lock,
  Unlock,
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
  LINING_PBR_PRESETS,
  getFabricCategory,
  type FabricRow,
  type Product,
} from "@/lib/supabase/service"
import { GarmentModel, CameraUpdater, CAMERA_PRESETS } from "./garment-canvas"
import MotifCalibrator from "./motif-calibrator"
import {
  getGarmentDimensionsCm,
  getDefaultGarmentDimensionsCm,
  saveGarmentDimensionsOverride,
  resetGarmentDimensions,
  type GarmentKey,
} from "@/lib/3d/garment-dimensions"

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

  // Step tracking — 6 steps total (0-5); editing jumps straight to step 5
  const [currentStep, setCurrentStep] = useState(isEditing ? 5 : 0)

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
  const [uploadedImagePixels, setUploadedImagePixels] = useState<{ w: number; h: number } | null>(null)
  const [fabricSizeUnit, setFabricSizeUnit] = useState<"cm" | "in">("in")
  const [fabricDpi, setFabricDpi] = useState<number | null>(null)
  const [name, setName] = useState(editingFabric?.name || "")
  const [price, setPrice] = useState(editingFabric?.price ? Number(editingFabric.price) : 0)
  const [isPrinted, setIsPrinted] = useState(editingFabric?.is_printed || false)
  // Material category: 'outer' = shell/outer fabric (default), 'lining' = interior lining.
  // Drives which PBR preset set is used and which category filter the fabric shows up under.
  const [materialCategory, setMaterialCategory] = useState<"outer" | "lining">(
    editingFabric ? getFabricCategory(editingFabric) : "outer",
  )
  const [pbrSettings, setPbrSettings] = useState(() => {
    // Merge existing settings with defaults to ensure new cm fields exist
    const initialCategory = editingFabric ? getFabricCategory(editingFabric) : "outer"
    const base = initialCategory === "lining" ? LINING_PBR_PRESETS.silk : PBR_PRESETS.cotton
    const existing = editingFabric?.pbr_settings
    return existing
      ? {
          ...base,
          ...existing,
          repeat_width_cm: existing.repeat_width_cm ?? 0,
          repeat_height_cm: existing.repeat_height_cm ?? 0,
          fine_tune: existing.fine_tune ?? 5,
          fabric_category: existing.fabric_category ?? initialCategory,
        }
      : { ...base, repeat_width_cm: 0, repeat_height_cm: 0, fine_tune: 5, fabric_category: initialCategory }
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewZoom, setPreviewZoom] = useState(1.0)
  const [arLocked, setArLocked] = useState(true)

  // Load products
  useEffect(() => {
    getAllProducts().then(setProducts)
  }, [])

  // When editing an existing fabric (no fresh upload), read the stored image's
  // pixel dimensions so the motif calibrator and aspect logic still work.
  useEffect(() => {
    if (uploadedImagePixels || previewFile || !imageUrl || typeof window === "undefined") return
    const img = new window.Image()
    img.onload = () => setUploadedImagePixels({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = imageUrl
  }, [imageUrl, previewFile, uploadedImagePixels])

  // Update PBR when fabric type or material category changes (only for new fabrics)
  useEffect(() => {
    if (!isEditing && fabricType) {
      const preset =
        materialCategory === "lining"
          ? LINING_PBR_PRESETS[fabricType] || LINING_PBR_PRESETS.silk
          : PBR_PRESETS[fabricType] || PBR_PRESETS.cotton
      setPbrSettings((prev) => ({
        ...preset,
        // Keep any cm values the admin already entered
        repeat_width_cm: prev.repeat_width_cm ?? 0,
        repeat_height_cm: prev.repeat_height_cm ?? 0,
        fine_tune: prev.fine_tune ?? 5,
        fabric_category: materialCategory,
      }))
    }
  }, [fabricType, isEditing, materialCategory])

  // Derived values
  const selectedProduct = products.find((p) => p.id === productId)
  const productType = selectedProduct?.type || "shirt"

  // Reset lining category to outer whenever a non-jacket product is selected
  useEffect(() => {
    if (productType !== "jacket") setMaterialCategory("outer")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType])

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
    { label: "Product",      description: "Select product" },
    { label: "Fabric For",   description: "Outer or lining" },
    { label: "Material Type",description: "Choose material" },
    { label: "Fabric Style", description: "Pick style" },
    { label: "Input",        description: "Color or texture" },
    { label: "Details",      description: "Name, price & save" },
  ]

  // Step 1 ('Fabric For') is jacket-only — skip it for all other products
  const isJacket = productType === "jacket"

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!productId
      case 1: return isJacket                                     // only reachable for jackets
      case 2: return !!fabricType
      case 3: return !!fabricType
      case 4:
        if (inputMode === "upload") return !!(imageUrl || previewFile)
        return !!colorHex
      case 5: return !!name.trim()
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceed()) {
      const next = currentStep + 1
      // Skip 'Fabric For' step for non-jacket products
      setCurrentStep(next === 1 && !isJacket ? 2 : next)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1
      // Skip 'Fabric For' step backwards for non-jacket products
      setCurrentStep(prev === 1 && !isJacket ? 0 : prev)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !productId) return

    // Show local preview immediately (data URL) so the 3D preview updates instantly
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setPreviewFile(dataUrl)
      // Read pixel dimensions so we can auto-derive height from aspect ratio
      const img = new Image()
      img.onload = () => setUploadedImagePixels({ w: img.naturalWidth, h: img.naturalHeight })
      img.src = dataUrl
    }
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

  const renderInputStep = () => {
    const _gDims = getGarmentDimensionsCm((productType || "shirt").toLowerCase() as GarmentKey)
    const _wCm = pbrSettings.repeat_width_cm ?? 0
    const _hCm = pbrSettings.repeat_height_cm ?? 0
    const _cmActive = _wCm > 0 && _hCm > 0
    return (
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

            {/* ── Printed Fabric Physical Size ── shown after image is uploaded */}
            {(previewFile || imageUrl) && (
              <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-blue-900">Printed Fabric Physical Size</p>
                    <p className="text-[11px] text-blue-700 leading-tight mt-0.5">
                      Enter the real print dimensions of this file (e.g. the filename says "60in" → enter 60).
                      The 3D shirt will show exactly how this fabric looks cut and sewn.
                    </p>
                  </div>
                  {/* Unit toggle */}
                  <div className="flex rounded border border-blue-300 overflow-hidden flex-shrink-0 text-[11px] font-medium">
                    <button type="button" onClick={() => setFabricSizeUnit("in")}
                      className={`px-2 py-1 ${fabricSizeUnit === "in" ? "bg-blue-600 text-white" : "bg-white text-blue-700 hover:bg-blue-50"}`}>
                      in
                    </button>
                    <button type="button" onClick={() => setFabricSizeUnit("cm")}
                      className={`px-2 py-1 ${fabricSizeUnit === "cm" ? "bg-blue-600 text-white" : "bg-white text-blue-700 hover:bg-blue-50"}`}>
                      cm
                    </button>
                  </div>
                </div>

                {/* DPI calculator — only shown when we know the pixel dims */}
                {uploadedImagePixels && (
                  <div className="bg-white border border-blue-200 rounded p-2 space-y-1.5">
                    <p className="text-[10px] font-semibold text-blue-800">
                      Quick-fill from DPI
                      <span className="font-normal text-blue-600 ml-1">
                        — image is {uploadedImagePixels.w} × {uploadedImagePixels.h} px
                      </span>
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[72, 96, 150, 300].map((dpi) => {
                        const wIn = uploadedImagePixels.w / dpi
                        const hIn = uploadedImagePixels.h / dpi
                        return (
                          <button
                            key={dpi}
                            type="button"
                            onClick={() => {
                              setFabricDpi(dpi)
                              setFabricSizeUnit("in")
                              const wCm = wIn * 2.54
                              const hCm = hIn * 2.54
                              setPbrSettings((prev) => ({
                                ...prev,
                                repeat_width_cm: wCm,
                                repeat_height_cm: hCm,
                                // Manual/DPI entry replaces any motif calibration
                                scale_cm_per_px: undefined,
                                motif_calibration: undefined,
                              }))
                            }}
                            className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                              fabricDpi === dpi
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            {dpi} dpi → {wIn.toFixed(1)}″×{hIn.toFixed(1)}″
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[10px] text-blue-500">
                      Pick the DPI your designer used, or type the size manually below.
                    </p>
                  </div>
                )}

                {/* Manual width / height inputs */}
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Width ({fabricSizeUnit})</Label>
                    <Input
                      type="number"
                      min={0}
                      step={fabricSizeUnit === "in" ? 0.5 : 1}
                      value={fabricSizeUnit === "in" ? ((_wCm / 2.54) || "") : (_wCm || "")}
                      placeholder={fabricSizeUnit === "in" ? "e.g. 60" : "e.g. 152"}
                      onChange={(e) => {
                        const raw = parseFloat(e.target.value) || 0
                        const newWCm = fabricSizeUnit === "in" ? raw * 2.54 : raw
                        let newHCm = _hCm
                        if (arLocked && newWCm > 0 && _wCm > 0) {
                          newHCm = newWCm * (_hCm / _wCm)
                        } else if (arLocked && uploadedImagePixels) {
                          newHCm = newWCm * (uploadedImagePixels.h / uploadedImagePixels.w)
                        }
                        setFabricDpi(null)
                        setPbrSettings((prev) => ({
                          ...prev,
                          repeat_width_cm: newWCm,
                          repeat_height_cm: newHCm,
                          scale_cm_per_px: undefined,
                          motif_calibration: undefined,
                        }))
                      }}
                    />
                  </div>
                  {/* AR lock toggle */}
                  <button
                    type="button"
                    title={arLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                    onClick={() => setArLocked((v) => !v)}
                    className={`mb-0.5 p-2 rounded border transition-colors ${
                      arLocked
                        ? "border-blue-400 bg-blue-50 text-blue-600"
                        : "border-gray-300 bg-white text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {arLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </button>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Height ({fabricSizeUnit})</Label>
                    <Input
                      type="number"
                      min={0}
                      step={fabricSizeUnit === "in" ? 0.5 : 1}
                      disabled={arLocked}
                      value={fabricSizeUnit === "in" ? ((_hCm / 2.54) || "") : (_hCm || "")}
                      placeholder={fabricSizeUnit === "in" ? "e.g. 23.5" : "e.g. 60"}
                      className={arLocked ? "bg-gray-50 cursor-not-allowed" : ""}
                      onChange={(e) => {
                        const raw = parseFloat(e.target.value) || 0
                        const newHCm = fabricSizeUnit === "in" ? raw * 2.54 : raw
                        setFabricDpi(null)
                        setPbrSettings((prev) => ({ ...prev, repeat_height_cm: newHCm, scale_cm_per_px: undefined, motif_calibration: undefined }))
                      }}
                    />
                  </div>
                </div>

                {_cmActive ? (
                  <p className="text-[11px] text-green-700 bg-green-50 border border-green-200 rounded p-1.5">
                    ✓ {(_wCm / 2.54).toFixed(1)}″ × {(_hCm / 2.54).toFixed(1)}″ ({_wCm.toFixed(1)} × {_hCm.toFixed(1)} cm)
                    {" — "}{productType} ({_gDims.width}×{_gDims.height} cm) shows{" "}
                    <strong>{(_gDims.width / _wCm).toFixed(2)}×</strong>
                    {" h / "}
                    <strong>{(_gDims.height / _hCm).toFixed(2)}×</strong>
                    {" v repeats"}
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-1.5">
                    ⚠ Enter the fabric dimensions above (or pick a DPI) — the 3D preview will be wrong until you do.
                  </p>
                )}
              </div>
            )}

            {/* ── Motif calibration ── most accurate scaling: anchor to a real motif */}
            {(previewFile || imageUrl) && uploadedImagePixels && (
              <MotifCalibrator
                imageSrc={(previewFile || imageUrl)!}
                imagePixels={uploadedImagePixels}
                value={pbrSettings.motif_calibration ?? null}
                onApply={({ cmPerPx, repeatWidthCm, repeatHeightCm, calibration }) => {
                  setFabricDpi(null)
                  setFabricSizeUnit("cm")
                  setArLocked(true)
                  setPbrSettings((prev) => ({
                    ...prev,
                    repeat_width_cm: repeatWidthCm,
                    repeat_height_cm: repeatHeightCm,
                    scale_cm_per_px: cmPerPx,
                    motif_calibration: calibration,
                  }))
                  toast({
                    title: "Scale calibrated",
                    description: `Repeat set to ${repeatWidthCm.toFixed(1)} × ${repeatHeightCm.toFixed(1)} cm from the motif.`,
                  })
                }}
              />
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
  }

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

      {/* Real-CM Scaling — production-accurate pattern size */}
      <CmScalingSection
        productType={productType}
        repeatWidthCm={pbrSettings.repeat_width_cm ?? 0}
        repeatHeightCm={pbrSettings.repeat_height_cm ?? 0}
        fineTune={pbrSettings.fine_tune ?? 5}
        arLocked={arLocked}
        onChangeRepeat={(w, h) => {
          setPbrSettings((prev) => ({
            ...prev,
            repeat_width_cm: w,
            repeat_height_cm: h,
            scale_cm_per_px: undefined,
            motif_calibration: undefined,
          }))
        }}
        onChangeFineTune={(v) => setPbrSettings((prev) => ({ ...prev, fine_tune: v }))}
        onToggleLock={() => setArLocked((v) => !v)}
      />

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
            <Label className="text-xs">
              Fine-tune X ({pbrSettings.repeat_x})
              <span className="text-[10px] text-gray-500"> — legacy/±</span>
            </Label>
            <Slider
              min={1} max={16} step={1}
              value={[pbrSettings.repeat_x]}
              onValueChange={([v]) => updatePbr("repeat_x", v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">
              Fine-tune Y ({pbrSettings.repeat_y})
              <span className="text-[10px] text-gray-500"> — legacy/±</span>
            </Label>
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

  const renderFabricUseStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">What is this fabric for?</h3>
        <p className="text-sm text-muted-foreground">
          Choose whether this fabric appears as the outer jacket surface or as the interior lining.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <button
          type="button"
          onClick={() => setMaterialCategory("outer")}
          className={`rounded-xl border-2 p-5 text-left transition-all ${
            materialCategory === "outer"
              ? "border-primary bg-primary/5 ring-2 ring-primary/30"
              : "border-gray-200 bg-white hover:border-gray-400"
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🧥</span>
            <div>
              <p className="font-semibold text-base">Jacket Outer Fabric</p>
              <p className="text-sm text-muted-foreground leading-snug mt-0.5">
                The visible shell of the jacket — wool, linen, tweed, etc.
              </p>
            </div>
            {materialCategory === "outer" && (
              <Check className="h-5 w-5 text-primary ml-auto flex-shrink-0" />
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMaterialCategory("lining")}
          className={`rounded-xl border-2 p-5 text-left transition-all ${
            materialCategory === "lining"
              ? "border-primary bg-primary/5 ring-2 ring-primary/30"
              : "border-gray-200 bg-white hover:border-gray-400"
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">🧵</span>
            <div>
              <p className="font-semibold text-base">Jacket Lining Fabric</p>
              <p className="text-sm text-muted-foreground leading-snug mt-0.5">
                The interior lining — shown in half-lining and full-lining views simultaneously.
              </p>
            </div>
            {materialCategory === "lining" && (
              <Check className="h-5 w-5 text-primary ml-auto flex-shrink-0" />
            )}
          </div>
        </button>
      </div>
    </div>
  )

  const stepRenderers = [renderProductStep, renderFabricUseStep, renderFabricTypeStep, renderFabricStyleStep, renderInputStep, renderDetailsStep]

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
          <div key={i} className={`flex items-center gap-2 flex-1 ${i === 1 && !isJacket ? "hidden" : ""}`}>
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
              {materialCategory === "lining" && productType === "jacket"
                ? "3D Lining Preview — Full & Half"
                : `3D Preview — ${productType || "shirt"}`}
            </Badge>
          </div>

          {/* Canvas area */}
          {materialCategory === "lining" && productType === "jacket" ? (
            // ── Dual lining preview: full lining (top) + half lining (bottom) ──
            <div className="flex flex-col h-[620px]">
              {(["full", "half"] as const).map((mode) => (
                <div key={mode} className="flex-1 relative">
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-[11px] font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full">
                      {mode === "full" ? "Full Lining" : "Half Lining"}
                    </span>
                  </div>
                  <Canvas
                    shadows
                    camera={{ position: [0, 0.8, 7.0], fov: 45 }}
                    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                  >
                    <Suspense fallback={null}>
                      <color attach="background" args={["#f0eeec"]} />
                      <ambientLight intensity={0.55} />
                      <directionalLight position={[3, 8, 4]} intensity={0.8} castShadow />
                      <directionalLight position={[-3, 5, 2]} intensity={0.45} />
                      <directionalLight position={[0, 4, -4]} intensity={0.20} />
                      <hemisphereLight args={["#f4efe8", "#3a3a3a", 0.28]} />
                      <Environment preset="studio" environmentIntensity={0.10} />
                      <GarmentModel
                        productType="jacket"
                        fabricColor={fabricColorForPreview}
                        fabricImageUrl={fabricImageForPreview}
                        repeatWidthCm={pbrSettings.repeat_width_cm}
                        repeatHeightCm={pbrSettings.repeat_height_cm}
                        fineTune={pbrSettings.fine_tune ?? 5}
                        zoomMultiplier={previewZoom}
                        liningMode={mode}
                      />
                      <OrbitControls
                        enablePan={false}
                        enableZoom={true}
                        minDistance={2}
                        maxDistance={12}
                        maxPolarAngle={Math.PI / 1.4}
                        minPolarAngle={Math.PI / 8}
                        target={new THREE.Vector3(0, 0.5, 0)}
                        autoRotate
                        autoRotateSpeed={0.6}
                      />
                    </Suspense>
                  </Canvas>
                </div>
              ))}
            </div>
          ) : (
            // ── Standard single preview ──
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
                    repeatWidthCm={pbrSettings.repeat_width_cm}
                    repeatHeightCm={pbrSettings.repeat_height_cm}
                    fineTune={pbrSettings.fine_tune ?? 5}
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
          )}

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

// ─── CmScalingSection ────────────────────────────────────────────────
// Admin UI for production-accurate cm-based fabric scaling.
// Two inputs for fabric repeat size (cm) + collapsible editor for
// overriding the current garment's own width/height (persisted in
// localStorage via lib/3d/garment-dimensions.ts).

function CmScalingSection({
  productType,
  repeatWidthCm,
  repeatHeightCm,
  fineTune,
  arLocked,
  onChangeRepeat,
  onChangeFineTune,
  onToggleLock,
}: {
  productType: string
  repeatWidthCm: number
  repeatHeightCm: number
  fineTune: number
  arLocked: boolean
  onChangeRepeat: (w: number, h: number) => void
  onChangeFineTune: (v: number) => void
  onToggleLock: () => void
}) {
  const productKey = (productType || "shirt").toLowerCase() as GarmentKey
  const [garmentW, setGarmentW] = useState(() => getGarmentDimensionsCm(productKey).width)
  const [garmentH, setGarmentH] = useState(() => getGarmentDimensionsCm(productKey).height)
  const [showGarmentEditor, setShowGarmentEditor] = useState(false)

  // Reload current garment dims whenever the product type changes
  useEffect(() => {
    const d = getGarmentDimensionsCm(productKey)
    setGarmentW(d.width)
    setGarmentH(d.height)
  }, [productKey])

  const cmActive = repeatWidthCm > 0 && repeatHeightCm > 0
  const safeScale = Math.max(0.1, fineTune)
  const repeatsX = cmActive ? (garmentW / (repeatWidthCm * safeScale)).toFixed(2) : "—"
  const repeatsY = cmActive ? (garmentH / (repeatHeightCm * safeScale)).toFixed(2) : "—"

  const handleSaveGarment = () => {
    if (garmentW > 0 && garmentH > 0) {
      saveGarmentDimensionsOverride(productKey, { width: garmentW, height: garmentH })
    }
  }

  const handleResetGarment = () => {
    resetGarmentDimensions(productKey)
    const d = getDefaultGarmentDimensionsCm(productKey)
    setGarmentW(d.width)
    setGarmentH(d.height)
  }

  return (
    <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div>
        <h4 className="font-semibold text-sm text-blue-900">Real-CM Scaling (production-accurate)</h4>
        <p className="text-[11px] text-blue-700 leading-tight mt-0.5">
          Enter the fabric&apos;s real repeat size in cm. The 3D viewer will tile the
          pattern so 1 cm in the design = 1 cm on the garment.
        </p>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label className="text-xs">Repeat Width (cm)</Label>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={repeatWidthCm || ""}
            placeholder="e.g. 8"
            onChange={(e) => {
              const newW = parseFloat(e.target.value) || 0
              let newH = repeatHeightCm
              if (arLocked && newW > 0 && repeatWidthCm > 0) {
                newH = newW * (repeatHeightCm / repeatWidthCm)
              }
              onChangeRepeat(newW, newH)
            }}
          />
        </div>
        {/* AR lock toggle */}
        <button
          type="button"
          title={arLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
          onClick={() => onToggleLock()}
          className={`mb-0.5 p-2 rounded border transition-colors ${
            arLocked
              ? "border-blue-400 bg-blue-50 text-blue-600"
              : "border-gray-300 bg-white text-gray-400 hover:text-gray-600"
          }`}
        >
          {arLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </button>
        <div className="flex-1 space-y-1">
          <Label className="text-xs">Repeat Height (cm)</Label>
          <Input
            type="number"
            min={0}
            step={0.1}
            disabled={arLocked}
            value={repeatHeightCm || ""}
            placeholder="e.g. 8"
            className={arLocked ? "bg-gray-50 cursor-not-allowed" : ""}
            onChange={(e) => onChangeRepeat(repeatWidthCm, parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Visual Scale slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-blue-900">
            Visual Scale — {safeScale.toFixed(2)}×
            <span className="text-[10px] font-normal text-blue-600 ml-1">
              (1× = true size · 2× = 2× larger on garment)
            </span>
          </Label>
          <button
            type="button"
            onClick={() => onChangeFineTune(5)}
            className="text-[10px] text-blue-600 hover:underline"
          >
            Reset to 5×
          </button>
        </div>
        <Slider
          min={0.25}
          max={8}
          step={0.25}
          value={[safeScale]}
          onValueChange={([v]) => onChangeFineTune(v)}
        />
        <div className="flex justify-between text-[10px] text-blue-500">
          <span>0.25× (tiny)</span>
          <span>1× (real)</span>
          <span>2× (default)</span>
          <span>8× (huge)</span>
        </div>
      </div>

      <div className="text-xs text-blue-800 bg-white/60 rounded p-2 border border-blue-100">
        <div className="flex items-center justify-between">
          <span className="font-medium capitalize">{productKey} dimensions:</span>
          <button
            type="button"
            onClick={() => setShowGarmentEditor((v) => !v)}
            className="text-[11px] text-blue-600 hover:underline"
          >
            {showGarmentEditor ? "Hide" : "Edit"}
          </button>
        </div>
        <div className="mt-0.5">
          {garmentW} cm × {garmentH} cm
          {cmActive && (
            <span className="ml-2 text-gray-600">
              → will tile <strong>{repeatsX}</strong> × <strong>{repeatsY}</strong> times at {safeScale}× scale
            </span>
          )}
        </div>

        {showGarmentEditor && (
          <div className="mt-3 space-y-2 pt-2 border-t border-blue-200">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px]">Garment Width (cm)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={garmentW}
                  onChange={(e) => setGarmentW(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Garment Height (cm)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={garmentH}
                  onChange={(e) => setGarmentH(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={handleSaveGarment} className="flex-1 h-7 text-xs">
                Save for {productKey}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetGarment}
                className="h-7 text-xs"
              >
                Reset
              </Button>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">
              Saved locally on this browser. Applies to all fabrics on {productKey}s.
            </p>
          </div>
        )}
      </div>

      {!cmActive && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          ⚠ Both cm values must be &gt; 0 to enable cm-based scaling. Fabric will use the
          legacy multiplier sliders below until set.
        </p>
      )}
    </div>
  )
}
