"use client"

import { useState, useMemo, Suspense } from "react"
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
import { OrbitControls, Environment, useGLTF, Center } from "@react-three/drei"
import * as THREE from "three"
import type { FabricRow, Product } from "@/lib/supabase/service"

interface FabricPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fabric: FabricRow
  products: Product[]
  onSave?: (settings: FabricRow["pbr_settings"]) => void
}

function PreviewModel({
  productType,
  fabricColor,
  fabricImageUrl,
  pbrSettings,
}: {
  productType: string
  fabricColor: string | null
  fabricImageUrl: string | null
  pbrSettings: FabricRow["pbr_settings"]
}) {
  // Use a simple sphere/torus as universal preview geometry
  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      roughness: pbrSettings.roughness,
      metalness: 0,
      sheenColor: new THREE.Color(0xffffff),
      sheen: pbrSettings.sheen,
      clearcoat: 0,
    })

    if (fabricImageUrl) {
      const loader = new THREE.TextureLoader()
      const tex = loader.load(fabricImageUrl)
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(pbrSettings.repeat_x, pbrSettings.repeat_y)
      tex.colorSpace = THREE.SRGBColorSpace
      mat.map = tex
    } else if (fabricColor) {
      mat.color = new THREE.Color(fabricColor)
    }

    // Adjust brightness via darkness param
    if (pbrSettings.darkness !== 0) {
      const hsl = { h: 0, s: 0, l: 0 }
      mat.color.getHSL(hsl)
      hsl.l = Math.max(0, Math.min(1, hsl.l - pbrSettings.darkness))
      mat.color.setHSL(hsl.h, hsl.s, hsl.l)
    }

    return mat
  }, [fabricColor, fabricImageUrl, pbrSettings])

  return (
    <group>
      {/* Sphere preview to show fabric appearance */}
      <mesh material={material} castShadow receiveShadow>
        <sphereGeometry args={[1.5, 64, 64]} />
      </mesh>
      {/* Flat plane behind for reference */}
      <mesh position={[0, 0, -2]} material={material}>
        <planeGeometry args={[3, 3]} />
      </mesh>
    </group>
  )
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
          {/* 3D Canvas */}
          <div className="h-[500px] bg-gray-100 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[3, 8, 4]} intensity={0.8} />
                <directionalLight position={[-3, 5, 2]} intensity={0.45} />
                <Environment preset="studio" environmentIntensity={0.1} />
                <Center>
                  <PreviewModel
                    productType={productType}
                    fabricColor={fabric.color_hex}
                    fabricImageUrl={fabric.image_url}
                    pbrSettings={localPbr}
                  />
                </Center>
                <OrbitControls
                  enablePan={false}
                  minDistance={2}
                  maxDistance={8}
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
