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
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { applyFabricCustomization, preloadFabricPBR, preloadShirtPBR, type PBROverride } from "@/lib/3d/customization-utils"
import type { GarmentType } from "@/lib/3d/customization-utils"
import {
  uploadFabricImage,
  getAllProducts,
  PBR_PRESETS,
  type FabricRow,
  type Product,
} from "@/lib/supabase/service"

// Preload PBR textures as early as possible
if (typeof window !== "undefined") {
  preloadFabricPBR()
  preloadShirtPBR()
}

// ─── Constants ────────────────────────────────────────────────

const SWATCH_COLORS = [
  "#FFFFFF", "#F5F5DC", "#FAF0E6", "#FFE4C4", "#D2B48C", "#C4A882",
  "#8B7355", "#6B4226", "#3C1414", "#1A1A1A", "#000000",
  "#1565C0", "#1E3A8A", "#0D47A1", "#283593", "#1A237E",
  "#2E7D32", "#388E3C", "#1B5E20", "#4A6741",
  "#B71C1C", "#C62828", "#8E24AA", "#6A1B9A",
  "#F5E6D3", "#E8D5B7", "#D4C5A9", "#C0B090",
  "#9E9E9E", "#757575", "#616161", "#424242",
]

const FABRIC_TYPE_INFO: Record<string, { label: string; description: string }> = {
  cotton: { label: "Cotton (Poplin)", description: "Smooth, breathable, classic weave" },
  linen: { label: "Linen", description: "Textured, natural, relaxed feel" },
  polyester: { label: "Polyester", description: "Smooth, shiny, wrinkle-resistant" },
}

const PRODUCT_ICONS: Record<string, string> = {
  shirt: "👔",
  jacket: "🧥",
  pants: "👖",
}

// Default GLTF model paths per product type — loads the same models as the real website
// Keep the count reasonable to avoid WebGL context loss on lower-end GPUs
const DEFAULT_MODEL_PATHS: Record<string, string[]> = {
  shirt: [
    "/models/shirts/Front/boxplacket.gltf",
    "/models/shirts/Collar/kentcollar.gltf",
    "/models/shirts/Cuffs/roundedcuff.gltf",
    "/models/shirts/Pocket/pocket.gltf",
  ],
  jacket: [
    // Front body + buttons
    "/models/jackets/Front/Bottom/2Button/Curved.gltf",
    "/models/jackets/Front/Button/2Button/S4.gltf",
    // Lapels
    "/models/jackets/Lapel/Regular/Upper/2Button/CL2.gltf",
    "/models/jackets/Lapel/Regular/Lower/2Button/CL2.gltf",
    // Sleeves
    "/models/jackets/Sleeve/Sleeve.gltf",
    "/models/jackets/Sleeve/Working/4Button/S4.gltf",
    // Vent (back)
    "/models/jackets/Vent/NoVent.gltf",
    // Pockets
    "/models/jackets/Pocket/PK-1.gltf",
    "/models/jackets/Pocket/ChestPocket.gltf",
  ],
  pants: [
    "/models/pants/FrontStyle/NoPleats.gltf",
    "/models/pants/BeltLoops/01.gltf",
    "/models/pants/Backandbasebeltarea/Basemodel.gltf",
    "/models/pants/Pockets/Slanted.gltf",
    "/models/pants/BackPockets/Buttonedweltpocket.gltf",
  ],
}

// Mesh/material names that are NOT fabric — skip fabric color on these.
// Includes both singular and plural Italian forms from the GLTF models.
const NON_FABRIC_NAMES = [
  "bottoni", "bottone", "filobottoni", "filobottone",
  "asola", "asole",
  "gemelli", "ricamo",
]

// Camera presets per product type
const CAMERA_PRESETS: Record<string, { position: [number, number, number]; target: [number, number, number]; fov: number }> = {
  shirt:  { position: [0, 0.4, 2.9], target: [0, -0.1, 0], fov: 45 },
  jacket: { position: [0, 0.8, 7.0], target: [0, 0.5, 0], fov: 45 },
  pants:  { position: [0, 0.4, 2.9], target: [0, -0.1, 0], fov: 45 },
}

// Per-product texture repeat scale factors.
// Jacket is the visual reference (1.0). Shirt and pants have a closer camera
// (z=2.9 vs z=7.0) and tighter UV unwraps, so the same repeat count tiles
// the pattern far too small. Scaling down makes them match the jacket visually.
const TEXTURE_REPEAT_SCALE: Record<string, number> = {
  jacket: 1.0,
  shirt:  0.18,
  pants:  0.22,
}

// ─── Real GLTF Model Preview ─────────────────────────────────

/** Updates camera position/target when product type changes (since we don't use key= on Canvas) */
function CameraUpdater({ productType }: { productType: string }) {
  const { camera } = useThree()
  useEffect(() => {
    const preset = CAMERA_PRESETS[productType] || CAMERA_PRESETS.shirt
    camera.position.set(...preset.position)
    camera.lookAt(...preset.target)
    camera.updateProjectionMatrix()
  }, [productType, camera])
  return null
}

/** Recursively dispose all geometries and materials in a scene tree */
function disposeScene(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose()
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((m) => {
        if (m instanceof THREE.Material) {
          Object.values(m).forEach((val) => {
            if (val instanceof THREE.Texture) val.dispose()
          })
          m.dispose()
        }
      })
    }
  })
}

function GarmentModel({
  productType,
  fabricColor,
  fabricImageUrl,
  repeatX = 6,
  repeatY = 6,
  zoomMultiplier = 1,
  pbrSettings,
}: {
  productType: string
  fabricColor: string | null
  fabricImageUrl: string | null
  repeatX?: number
  repeatY?: number
  zoomMultiplier?: number
  pbrSettings?: { roughness: number; normal_scale: number; bump_scale: number; sheen: number }
}) {
  const [loadedScenes, setLoadedScenes] = useState<THREE.Group[]>([])
  const [modelScale, setModelScale] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const garmentType: GarmentType = productType === "pants" ? "trousers" : (productType as GarmentType)

  // Create GLTF loader with DRACO support (same pattern as working customer-facing viewers)
  const loader = useMemo(() => {
    const gltfLoader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("/draco/")
    gltfLoader.setDRACOLoader(dracoLoader)
    return gltfLoader
  }, [])

  // Load model parts when product type changes
  useEffect(() => {
    const paths = DEFAULT_MODEL_PATHS[productType] || DEFAULT_MODEL_PATHS.shirt

    // Dispose old scenes before loading new ones to free GPU memory
    setIsLoading(true)

    let cancelled = false

    const loadPromises = paths.map(
      (path) =>
        new Promise<THREE.Group>((resolve) => {
          loader.load(
            path,
            (gltf) => resolve(gltf.scene.clone()),
            undefined,
            (err) => {
              console.error("GLTF load error:", path, err)
              resolve(new THREE.Group())
            }
          )
        })
    )

    Promise.all(loadPromises).then((loaded) => {
      if (cancelled) {
        loaded.forEach(disposeScene)
        return
      }

      // Compute scale from bounding box height (same approach as working shirt/pants viewers)
      const tempGroup = new THREE.Group()
      loaded.forEach((s) => tempGroup.add(s.clone()))
      const bbox = new THREE.Box3().setFromObject(tempGroup)
      const size = bbox.getSize(new THREE.Vector3())
      const desiredHeight = 2.6
      const computedScale = size.y > 0.001 ? desiredHeight / size.y : 1

      // Clean up temp clones used only for measurement
      tempGroup.children.forEach((c) => disposeScene(c))

      setModelScale(computedScale)
      setLoadedScenes((prev) => {
        prev.forEach(disposeScene)
        return loaded
      })
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [productType, loader])

  // Dispose on unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setLoadedScenes((prev) => {
        prev.forEach(disposeScene)
        return []
      })
    }
  }, [])

  // Apply fabric color/texture to all fabric meshes
  useEffect(() => {
    if (loadedScenes.length === 0) return

    // Derive PBROverride from wizard slider values so roughness/sheen/normal/bump
    // actually affect the 3D preview instead of always using hardcoded defaults.
    const pbrOverride: PBROverride | undefined = pbrSettings
      ? {
          roughness:   pbrSettings.roughness,
          normalScale: pbrSettings.normal_scale,
          bumpScale:   pbrSettings.bump_scale,
          sheen:       pbrSettings.sheen,
        }
      : undefined

    loadedScenes.forEach((scene) => {
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh) || !child.material) return

        const meshName = (child.name || "").toLowerCase()
        const mats = Array.isArray(child.material)
          ? (child.material as THREE.Material[])
          : [child.material as THREE.Material]
        const matNames = mats.map((m) => m.name.toLowerCase())

        const isNonFabric = NON_FABRIC_NAMES.some(
          (s) => meshName.includes(s) || matNames.some((n) => n.includes(s))
        )
        if (isNonFabric) return

        if (fabricImageUrl) {
          // Route ALL image URLs (data:, https:, /...) through applyFabricCustomization
          // so the cotton poplin PBR normal/bump maps are always applied.
          // White base color (0xffffff) ensures printed patterns show true colours.
          // Apply per-product repeat scale so the pattern appears the same visual
          // size on shirt/pants as it does on the jacket (which is the reference).
          const scale = TEXTURE_REPEAT_SCALE[productType] ?? 1.0
          applyFabricCustomization(child, fabricImageUrl, 0xffffff, garmentType, repeatX * scale, repeatY * scale, pbrOverride)
        } else {
          const color = fabricColor || "#eeeeee"
          const scale = TEXTURE_REPEAT_SCALE[productType] ?? 1.0
          applyFabricCustomization(child, color, undefined, garmentType, repeatX * scale, repeatY * scale, pbrOverride)
        }
      })
    })
  }, [loadedScenes, fabricColor, fabricImageUrl, garmentType, repeatX, repeatY, pbrSettings])

  if (isLoading) {
    return (
      <Html center>
        <div className="flex flex-col items-center gap-3 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-gray-700">Loading model...</p>
        </div>
      </Html>
    )
  }

  if (loadedScenes.length === 0) return null

  // Render each scene as an individual <primitive> inside a scaled <group>
  // This matches the exact pattern used by the working customer-facing viewers
  const finalScale = modelScale * zoomMultiplier
  return (
    <group position={[0, 0, 0]} scale={[finalScale, finalScale, finalScale]}>
      {loadedScenes.map((scene, i) => (
        <primitive key={`part-${i}`} object={scene} position={[0, 0, 0]} />
      ))}
    </group>
  )
}

// ─── Main Wizard Component ────────────────────────────────────

interface FabricWizardProps {
  editingFabric?: FabricRow | null
  onClose: () => void
  onSaved: () => void
}

export function FabricWizard({ editingFabric, onClose, onSaved }: FabricWizardProps) {
  const isEditing = !!editingFabric
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Products
  const [products, setProducts] = useState<Product[]>([])

  // Step tracking
  const [currentStep, setCurrentStep] = useState(isEditing ? 3 : 0)

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
    if (!isEditing) {
      setPbrSettings(PBR_PRESETS[fabricType] || PBR_PRESETS.cotton)
    }
  }, [fabricType, isEditing])

  // Derived values
  const selectedProduct = products.find((p) => p.id === productId)
  const productType = selectedProduct?.type || "shirt"

  const fabricColorForPreview = inputMode === "upload" ? null : colorHex
  const fabricImageForPreview = inputMode === "upload" ? (previewFile || imageUrl) : null

  // Step definitions
  const steps = [
    { label: "Product", description: "Select product" },
    { label: "Fabric Type", description: "Choose material" },
    { label: "Input", description: "Color or texture" },
    { label: "Details", description: "Name, price & save" },
  ]

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!productId
      case 1: return !!fabricType
      case 2:
        if (inputMode === "upload") return !!(imageUrl || previewFile)
        return !!colorHex
      case 3: return !!name.trim()
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

    const reader = new FileReader()
    reader.onload = (ev) => setPreviewFile(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const url = await uploadFabricImage(file, productId)
      if (url) {
        setImageUrl(url)
        toast({ title: "Uploaded", description: "Fabric image uploaded." })
      } else {
        toast({ title: "Upload failed", description: "Could not upload image.", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Upload failed.", variant: "destructive" })
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

  const renderFabricTypeStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Fabric Type</h3>
        <p className="text-sm text-muted-foreground">Choose the material category</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(FABRIC_TYPE_INFO).map(([type, info]) => (
          <Card
            key={type}
            className={`cursor-pointer transition-all hover:shadow-md ${
              fabricType === type
                ? "ring-2 ring-primary border-primary bg-primary/5"
                : "hover:border-gray-400"
            }`}
            onClick={() => setFabricType(type as "cotton" | "linen" | "polyester")}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl">
                {type === "cotton" ? "🧵" : type === "linen" ? "🌿" : "✨"}
              </div>
              <div className="flex-1">
                <p className="font-medium">{info.label}</p>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
              {fabricType === type && (
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
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch checked={isPrinted} onCheckedChange={setIsPrinted} id="printed" />
              <Label htmlFor="printed">Printed fabric (pattern/design)</Label>
            </div>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewFile || imageUrl ? (
                <img
                  src={previewFile || imageUrl!}
                  alt="Fabric"
                  className="max-h-24 mx-auto rounded object-contain"
                />
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
            {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
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

  const stepRenderers = [renderProductStep, renderFabricTypeStep, renderInputStep, renderDetailsStep]

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
                  pbrSettings={pbrSettings}
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
