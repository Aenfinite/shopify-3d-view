"use client"

import { useState, Suspense } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import type { FabricRow, Product } from "@/lib/supabase/service"
import { GarmentModel, CameraUpdater, CAMERA_PRESETS } from "./garment-canvas"

interface FabricPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fabric: FabricRow
  products: Product[]
  onSave?: (settings: FabricRow["pbr_settings"]) => void
}

export function FabricPreviewDialog({
  open,
  onOpenChange,
  fabric,
  products,
  onSave,
}: FabricPreviewDialogProps) {
  const [localPbr, setLocalPbr] = useState(fabric.pbr_settings)
  const productName = products.find((p) => p.id === fabric.product_id)?.name || fabric.product_id
  const productType = products.find((p) => p.id === fabric.product_id)?.type || "shirt"

  const updatePbr = (key: string, val: number) => {
    setLocalPbr((prev) => ({ ...prev, [key]: val }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            3D Preview: {fabric.name}
            <Badge variant="outline" className="capitalize">{fabric.fabric_type}</Badge>
            <Badge variant="secondary">{productName}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[1fr_280px] gap-4">
          {/* 3D Canvas — real garment model */}
          <div className="h-[500px] bg-gray-100 rounded-lg overflow-hidden">
            <Canvas
              camera={{
                position: (CAMERA_PRESETS[productType] ?? CAMERA_PRESETS.shirt).position,
                fov: (CAMERA_PRESETS[productType] ?? CAMERA_PRESETS.shirt).fov,
              }}
            >
              <Suspense fallback={null}>
                <CameraUpdater productType={productType} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[3, 8, 4]} intensity={0.8} />
                <directionalLight position={[-3, 5, 2]} intensity={0.45} />
                <Environment preset="studio" environmentIntensity={0.1} />
                <GarmentModel
                  productType={productType}
                  fabricColor={fabric.color_hex}
                  fabricImageUrl={fabric.image_url}
                  repeatX={localPbr.repeat_x}
                  repeatY={localPbr.repeat_y}
                  pbrSettings={{ ...localPbr, fabricMaterialType: fabric.fabric_type }}
                />
                <OrbitControls
                  enablePan={false}
                  minDistance={1}
                  maxDistance={20}
                  autoRotate
                  autoRotateSpeed={1}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Controls Panel */}
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
            <h4 className="font-semibold text-sm">Fabric Controls</h4>

            {/* Color preview */}
            <div className="flex items-center gap-2">
              {fabric.image_url ? (
                <img src={fabric.image_url} alt="" className="w-10 h-10 rounded border object-cover" />
              ) : fabric.color_hex ? (
                <div className="w-10 h-10 rounded border" style={{ backgroundColor: fabric.color_hex }} />
              ) : null}
              <div>
                <p className="text-sm font-medium">{fabric.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{fabric.input_mode}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Texture Scale X ({localPbr.repeat_x})</Label>
                <Slider
                  min={1}
                  max={16}
                  step={1}
                  value={[localPbr.repeat_x]}
                  onValueChange={([v]) => updatePbr("repeat_x", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Texture Scale Y ({localPbr.repeat_y})</Label>
                <Slider
                  min={1}
                  max={16}
                  step={1}
                  value={[localPbr.repeat_y]}
                  onValueChange={([v]) => updatePbr("repeat_y", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Roughness ({localPbr.roughness.toFixed(2)})</Label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[localPbr.roughness]}
                  onValueChange={([v]) => updatePbr("roughness", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Normal Intensity ({localPbr.normal_scale.toFixed(2)})</Label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[localPbr.normal_scale]}
                  onValueChange={([v]) => updatePbr("normal_scale", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bump ({localPbr.bump_scale.toFixed(2)})</Label>
                <Slider
                  min={0}
                  max={0.5}
                  step={0.01}
                  value={[localPbr.bump_scale]}
                  onValueChange={([v]) => updatePbr("bump_scale", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sheen ({localPbr.sheen.toFixed(2)})</Label>
                <Slider
                  min={0}
                  max={0.5}
                  step={0.01}
                  value={[localPbr.sheen]}
                  onValueChange={([v]) => updatePbr("sheen", v)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Darkness ({localPbr.darkness.toFixed(2)})</Label>
                <Slider
                  min={-0.5}
                  max={0.5}
                  step={0.01}
                  value={[localPbr.darkness]}
                  onValueChange={([v]) => updatePbr("darkness", v)}
                />
              </div>
            </div>

            {onSave && (
              <Button className="w-full" onClick={() => onSave(localPbr)}>
                Save Settings
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
