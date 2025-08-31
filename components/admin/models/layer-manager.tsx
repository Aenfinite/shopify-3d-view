"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Eye, EyeOff } from "lucide-react"

interface Layer {
  id: string
  name: string
  visible: boolean
  category: string
}

interface LayerManagerProps {
  modelId: string
  onLayersChange: (layers: Layer[]) => void
}

export function LayerManager({ modelId, onLayersChange }: LayerManagerProps) {
  const [layers, setLayers] = useState<Layer[]>([
    // Sample layers for demonstration
    { id: "shirt_body", name: "Shirt Body", visible: true, category: "base" },
    { id: "shirt_collar_spread", name: "Spread Collar", visible: true, category: "collar" },
    { id: "shirt_collar_button_down", name: "Button Down Collar", visible: false, category: "collar" },
    { id: "shirt_collar_cutaway", name: "Cutaway Collar", visible: false, category: "collar" },
    { id: "shirt_buttons_standard", name: "Standard Buttons", visible: true, category: "buttons" },
    { id: "shirt_buttons_hidden", name: "Hidden Placket", visible: false, category: "buttons" },
    { id: "shirt_buttons_contrast", name: "Contrast Buttons", visible: false, category: "buttons" },
    { id: "shirt_back_plain", name: "Plain Back", visible: true, category: "back" },
    { id: "shirt_back_plate_pleated", name: "Pleated Back Plate", visible: false, category: "back" },
    { id: "shirt_back_plate_yoke", name: "Yoke Back Plate", visible: false, category: "back" },
  ])

  const [newLayerName, setNewLayerName] = useState("")
  const [newLayerCategory, setNewLayerCategory] = useState("")

  const addLayer = () => {
    if (newLayerName && newLayerCategory) {
      const newLayer: Layer = {
        id: `€{newLayerCategory}_€{newLayerName.toLowerCase().replace(/\s+/g, "_")}`,
        name: newLayerName,
        visible: false,
        category: newLayerCategory,
      }
      const updatedLayers = [...layers, newLayer]
      setLayers(updatedLayers)
      onLayersChange(updatedLayers)
      setNewLayerName("")
      setNewLayerCategory("")
    }
  }

  const toggleLayerVisibility = (layerId: string) => {
    const updatedLayers = layers.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer))
    setLayers(updatedLayers)
    onLayersChange(updatedLayers)
  }

  const removeLayer = (layerId: string) => {
    const updatedLayers = layers.filter((layer) => layer.id !== layerId)
    setLayers(updatedLayers)
    onLayersChange(updatedLayers)
  }

  const groupedLayers = layers.reduce(
    (acc, layer) => {
      if (!acc[layer.category]) {
        acc[layer.category] = []
      }
      acc[layer.category].push(layer)
      return acc
    },
    {} as Record<string, Layer[]>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>3D Model Layer Manager</CardTitle>
        <CardDescription>
          Manage the layers in your 3D model. Each layer can be shown or hidden based on customization options.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Layer */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="layer-name">Layer Name</Label>
            <Input
              id="layer-name"
              placeholder="e.g., French Cuff"
              value={newLayerName}
              onChange={(e) => setNewLayerName(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="layer-category">Category</Label>
            <Input
              id="layer-category"
              placeholder="e.g., cuffs"
              value={newLayerCategory}
              onChange={(e) => setNewLayerCategory(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addLayer}>
              <Plus className="h-4 w-4 mr-2" />
              Add Layer
            </Button>
          </div>
        </div>

        <Separator />

        {/* Layer Categories */}
        <Tabs defaultValue={Object.keys(groupedLayers)[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {Object.keys(groupedLayers).map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(groupedLayers).map(([category, categoryLayers]) => (
            <TabsContent key={category} value={category} className="space-y-2">
              <div className="text-sm font-medium mb-2">
                {category.charAt(0).toUpperCase() + category.slice(1)} Layers
              </div>

              {categoryLayers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => toggleLayerVisibility(layer.id)}>
                      {layer.visible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <div>
                      <div className="font-medium">{layer.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {layer.id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={layer.visible ? "default" : "secondary"}>
                      {layer.visible ? "Visible" : "Hidden"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLayer(layer.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">How to Structure Your 3D Model:</h4>
          <ul className="text-sm space-y-1 text-blue-800">
            <li>• Name each part in your 3D software with descriptive names</li>
            <li>• Use underscores: shirt_collar_spread, shirt_buttons_hidden</li>
            <li>• Group similar parts: all collar variations, all button styles</li>
            <li>• Export as GLB/GLTF with all layers included</li>
            <li>• Only one layer per category should be visible at a time</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
