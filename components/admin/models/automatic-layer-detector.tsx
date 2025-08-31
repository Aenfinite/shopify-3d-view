"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, Eye, EyeOff } from "lucide-react"
import { ModelAnalyzer, type ModelAnalysis } from "@/lib/3d/model-analyzer"

interface LayerAssignment {
  layerName: string
  category: string
  optionName: string
  isDefault: boolean
}

interface AutomaticLayerDetectorProps {
  onLayersDetected: (assignments: LayerAssignment[]) => void
}

export function AutomaticLayerDetector({ onLayersDetected }: AutomaticLayerDetectorProps) {
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ModelAnalysis | null>(null)
  const [assignments, setAssignments] = useState<LayerAssignment[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setModelFile(file)
      setError(null)
    }
  }

  const analyzeModel = async () => {
    if (!modelFile) return

    setAnalyzing(true)
    setError(null)

    try {
      // Create a temporary URL for the file
      const modelUrl = URL.createObjectURL(modelFile)
      const analyzer = new ModelAnalyzer()
      const result = await analyzer.analyzeModel(modelUrl)

      setAnalysis(result)

      // Create initial assignments with suggested categories
      const initialAssignments: LayerAssignment[] = result.layers
        .filter((layer) => layer.hasGeometry) // Only include layers with geometry
        .map((layer) => ({
          layerName: layer.name,
          category: ModelAnalyzer.suggestCategory(layer.name),
          optionName: layer.name
            .replace(/_/g, " ")
            .replace(/([A-Z])/g, " €1")
            .trim(),
          isDefault: layer.visible,
        }))

      setAssignments(initialAssignments)

      // Clean up the temporary URL
      URL.revokeObjectURL(modelUrl)
    } catch (err) {
      console.error("Error analyzing model:", err)
      setError("Failed to analyze the 3D model. Please make sure it's a valid GLB/GLTF file.")
    } finally {
      setAnalyzing(false)
    }
  }

  const updateAssignment = (index: number, field: keyof LayerAssignment, value: string | boolean) => {
    const newAssignments = [...assignments]
    newAssignments[index] = { ...newAssignments[index], [field]: value }
    setAssignments(newAssignments)
  }

  const groupedAssignments = assignments.reduce(
    (acc, assignment, index) => {
      if (!acc[assignment.category]) {
        acc[assignment.category] = []
      }
      acc[assignment.category].push({ ...assignment, index })
      return acc
    },
    {} as Record<string, (LayerAssignment & { index: number })[]>,
  )

  const handleSaveAssignments = () => {
    onLayersDetected(assignments)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automatic Layer Detection</CardTitle>
        <CardDescription>
          Upload your 3D model and we'll automatically detect all layers for you to assign to customization options.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="model-upload">Upload 3D Model (GLB/GLTF)</Label>
          <div className="flex gap-2">
            <Input id="model-upload" type="file" accept=".glb,.gltf" onChange={handleFileUpload} className="flex-1" />
            <Button onClick={analyzeModel} disabled={!modelFile || analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>

        {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded text-center">
                <div className="text-2xl font-bold text-blue-600">{analysis.totalObjects}</div>
                <div className="text-sm text-blue-800">Total Objects</div>
              </div>
              <div className="bg-green-50 p-3 rounded text-center">
                <div className="text-2xl font-bold text-green-600">{analysis.meshCount}</div>
                <div className="text-sm text-green-800">Meshes</div>
              </div>
              <div className="bg-purple-50 p-3 rounded text-center">
                <div className="text-2xl font-bold text-purple-600">{analysis.materialCount}</div>
                <div className="text-sm text-purple-800">Materials</div>
              </div>
              <div className="bg-orange-50 p-3 rounded text-center">
                <div className="text-2xl font-bold text-orange-600">{analysis.textureCount}</div>
                <div className="text-sm text-orange-800">Textures</div>
              </div>
            </div>

            {/* Layer Assignments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Assign Layers to Customization Options</h3>

              <Tabs defaultValue={Object.keys(groupedAssignments)[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {Object.keys(groupedAssignments).map((category) => (
                    <TabsTrigger key={category} value={category} className="capitalize">
                      {category} ({groupedAssignments[category].length})
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(groupedAssignments).map(([category, categoryAssignments]) => (
                  <TabsContent key={category} value={category} className="space-y-3">
                    {categoryAssignments.map((assignment) => (
                      <div key={assignment.index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{assignment.layerName}</Badge>
                            {assignment.isDefault ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={assignment.isDefault}
                              onCheckedChange={(checked) =>
                                updateAssignment(assignment.index, "isDefault", checked as boolean)
                              }
                            />
                            <Label className="text-sm">Default Visible</Label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm">Category</Label>
                            <Select
                              value={assignment.category}
                              onValueChange={(value) => updateAssignment(assignment.index, "category", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="collar">Collar</SelectItem>
                                <SelectItem value="buttons">Buttons</SelectItem>
                                <SelectItem value="cuffs">Cuffs</SelectItem>
                                <SelectItem value="back">Back</SelectItem>
                                <SelectItem value="pockets">Pockets</SelectItem>
                                <SelectItem value="lapels">Lapels</SelectItem>
                                <SelectItem value="lining">Lining</SelectItem>
                                <SelectItem value="base">Base</SelectItem>
                                <SelectItem value="style">Style</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm">Option Name</Label>
                            <Input
                              value={assignment.optionName}
                              onChange={(e) => updateAssignment(assignment.index, "optionName", e.target.value)}
                              placeholder="e.g., Spread Collar"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>

              <Button onClick={handleSaveAssignments} className="w-full" size="lg">
                Save Layer Assignments
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
