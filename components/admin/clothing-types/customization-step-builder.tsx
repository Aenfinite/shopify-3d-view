"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, GripVertical, Palette, Shirt, Settings, Ruler, Hash } from "lucide-react"

interface CustomizationStep {
  id: string
  title: string
  type: "fabric" | "colors" | "style" | "details" | "sizing" | "custom"
  required: boolean
  order: number
  options: CustomizationOption[]
}

interface CustomizationOption {
  id: string
  name: string
  description?: string
  price: number
  color?: string
  image?: string
  materialMapping?: string
}

const STEP_TYPES = [
  { value: "fabric", label: "Fabric Selection", icon: Shirt, description: "Choose fabric types and textures" },
  { value: "colors", label: "Color Selection", icon: Palette, description: "Pick colors and patterns" },
  { value: "style", label: "Style Options", icon: Settings, description: "Collar, cuffs, buttons, etc." },
  { value: "details", label: "Detail Options", icon: Hash, description: "Monograms, pockets, etc." },
  { value: "sizing", label: "Size & Fit", icon: Ruler, description: "Size selection and measurements" },
  { value: "custom", label: "Custom Step", icon: Plus, description: "Create your own step type" },
]

interface CustomizationStepBuilderProps {
  clothingTypeId: string
}

export function CustomizationStepBuilder({ clothingTypeId }: CustomizationStepBuilderProps) {
  const [steps, setSteps] = useState<CustomizationStep[]>([
    {
      id: "step-1",
      title: "Select Fabric",
      type: "fabric",
      required: true,
      order: 1,
      options: [
        {
          id: "cotton",
          name: "Premium Cotton",
          description: "Soft, breathable cotton fabric",
          price: 0,
          materialMapping: "fabric_main",
        },
        {
          id: "linen",
          name: "Linen Blend",
          description: "Lightweight linen for summer",
          price: 25,
          materialMapping: "fabric_main",
        },
      ],
    },
    {
      id: "step-2",
      title: "Choose Colors",
      type: "colors",
      required: true,
      order: 2,
      options: [
        {
          id: "white",
          name: "Classic White",
          price: 0,
          color: "#FFFFFF",
          materialMapping: "fabric_main",
        },
        {
          id: "navy",
          name: "Navy Blue",
          price: 5,
          color: "#000080",
          materialMapping: "fabric_main",
        },
      ],
    },
  ])

  const [activeStep, setActiveStep] = useState<string>("step-1")

  const addStep = () => {
    const newStep: CustomizationStep = {
      id: `step-€{Date.now()}`,
      title: "New Step",
      type: "custom",
      required: false,
      order: steps.length + 1,
      options: [],
    }
    setSteps([...steps, newStep])
    setActiveStep(newStep.id)
  }

  const updateStep = (stepId: string, updates: Partial<CustomizationStep>) => {
    setSteps(steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)))
  }

  const deleteStep = (stepId: string) => {
    setSteps(steps.filter((step) => step.id !== stepId))
    if (activeStep === stepId && steps.length > 1) {
      setActiveStep(steps.find((s) => s.id !== stepId)?.id || "")
    }
  }

  const addOption = (stepId: string) => {
    const newOption: CustomizationOption = {
      id: `option-€{Date.now()}`,
      name: "New Option",
      price: 0,
    }

    updateStep(stepId, {
      options: [...(steps.find((s) => s.id === stepId)?.options || []), newOption],
    })
  }

  const updateOption = (stepId: string, optionId: string, updates: Partial<CustomizationOption>) => {
    const step = steps.find((s) => s.id === stepId)
    if (step) {
      updateStep(stepId, {
        options: step.options.map((opt) => (opt.id === optionId ? { ...opt, ...updates } : opt)),
      })
    }
  }

  const deleteOption = (stepId: string, optionId: string) => {
    const step = steps.find((s) => s.id === stepId)
    if (step) {
      updateStep(stepId, {
        options: step.options.filter((opt) => opt.id !== optionId),
      })
    }
  }

  const currentStep = steps.find((s) => s.id === activeStep)

  return (
    <div className="space-y-6">
      {/* Step Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customization Steps ({steps.length})</h3>
          <p className="text-sm text-muted-foreground">
            These steps will appear in order during the customization process
          </p>
        </div>
        <Button onClick={addStep}>
          <Plus className="mr-2 h-4 w-4" />
          Add Step
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Step List */}
        <div className="space-y-2">
          <Label>Steps</Label>
          <div className="space-y-2">
            {steps.map((step, index) => {
              const StepIcon = STEP_TYPES.find((t) => t.value === step.type)?.icon || Settings
              return (
                <Card
                  key={step.id}
                  className={`cursor-pointer transition-colors €{activeStep === step.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setActiveStep(step.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <StepIcon className="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{step.title}</div>
                        <div className="text-xs text-muted-foreground">{step.options.length} options</div>
                      </div>
                      {step.required && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Step Configuration */}
        <div className="lg:col-span-3">
          {currentStep ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Configure Step: {currentStep.title}</CardTitle>
                    <CardDescription>Set up options and pricing for this customization step</CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteStep(currentStep.id)}
                    disabled={steps.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                    <TabsTrigger value="options">Options ({currentStep.options.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Step Title</Label>
                        <Input
                          value={currentStep.title}
                          onChange={(e) => updateStep(currentStep.id, { title: e.target.value })}
                          placeholder="e.g., Select Fabric"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Step Type</Label>
                        <Select
                          value={currentStep.type}
                          onValueChange={(value: any) => updateStep(currentStep.id, { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STEP_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="h-4 w-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Required Step</Label>
                        <p className="text-sm text-muted-foreground">Customers must complete this step to proceed</p>
                      </div>
                      <Switch
                        checked={currentStep.required}
                        onCheckedChange={(checked) => updateStep(currentStep.id, { required: checked })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="options" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Customization Options</h4>
                        <p className="text-sm text-muted-foreground">Add options that customers can choose from</p>
                      </div>
                      <Button onClick={() => addOption(currentStep.id)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Option
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {currentStep.options.map((option) => (
                        <Card key={option.id}>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Option Name</Label>
                                <Input
                                  value={option.name}
                                  onChange={(e) => updateOption(currentStep.id, option.id, { name: e.target.value })}
                                  placeholder="e.g., Premium Cotton"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Price Adjustment (€)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={option.price}
                                  onChange={(e) =>
                                    updateOption(currentStep.id, option.id, {
                                      price: Number.parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  placeholder="0.00"
                                />
                              </div>
                              {currentStep.type === "colors" && (
                                <div className="space-y-2">
                                  <Label>Color</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="color"
                                      value={option.color || "#000000"}
                                      onChange={(e) =>
                                        updateOption(currentStep.id, option.id, { color: e.target.value })
                                      }
                                      className="w-16 h-10 p-1"
                                    />
                                    <Input
                                      value={option.color || ""}
                                      onChange={(e) =>
                                        updateOption(currentStep.id, option.id, { color: e.target.value })
                                      }
                                      placeholder="#000000"
                                      className="flex-1"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 space-y-2">
                              <Label>Description (Optional)</Label>
                              <Textarea
                                value={option.description || ""}
                                onChange={(e) =>
                                  updateOption(currentStep.id, option.id, { description: e.target.value })
                                }
                                placeholder="Describe this option..."
                                rows={2}
                              />
                            </div>

                            <div className="mt-4 space-y-2">
                              <Label>3D Material Mapping (Optional)</Label>
                              <Input
                                value={option.materialMapping || ""}
                                onChange={(e) =>
                                  updateOption(currentStep.id, option.id, { materialMapping: e.target.value })
                                }
                                placeholder="e.g., fabric_main, collar, buttons"
                              />
                              <p className="text-xs text-muted-foreground">
                                Material name in the 3D model that this option should affect
                              </p>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteOption(currentStep.id, option.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {currentStep.options.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Settings className="mx-auto h-8 w-8 mb-2" />
                          <p>No options added yet</p>
                          <p className="text-sm">Click "Add Option" to create customization choices</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Select a step to configure its options</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
