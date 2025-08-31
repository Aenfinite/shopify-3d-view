"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, ShoppingCart, Settings, Check, X } from "lucide-react"
import { ModelViewer } from "@/components/3d-model-viewer"
import { motion, AnimatePresence } from "framer-motion"

interface ConfiguratorState {
  fabricType: string
  fabricColor: string
  sleeveStyle: string
  collarStyle: string
  cuffStyle: string
  buttonStyle: string
  buttonColor: string
  monogramText: string
  monogramColor: string
  monogramPosition: string
  size: string
  quantity: number
}

const CUSTOMIZATION_STEPS = [
  {
    id: 1,
    title: "Select Fabric",
    key: "fabric",
    options: [
      {
        id: "cotton-poplin",
        name: "Cotton Poplin",
        price: 0,
        color: "#FFFFFF",
        image: "/placeholder.svg?height=80&width=80&text=Cotton",
      },
      {
        id: "premium-cotton",
        name: "Premium Cotton",
        price: 15,
        color: "#F8F8FF",
        image: "/placeholder.svg?height=80&width=80&text=Premium",
      },
      {
        id: "linen-blend",
        name: "Linen Blend",
        price: 25,
        color: "#FAF0E6",
        image: "/placeholder.svg?height=80&width=80&text=Linen",
      },
      {
        id: "silk-blend",
        name: "Silk Blend",
        price: 45,
        color: "#FFF8DC",
        image: "/placeholder.svg?height=80&width=80&text=Silk",
      },
    ],
    colors: [
      { id: "white", name: "White", hex: "#FFFFFF" },
      { id: "light-blue", name: "Light Blue", hex: "#87CEEB" },
      { id: "navy", name: "Navy", hex: "#000080" },
      { id: "pink", name: "Pink", hex: "#FFB6C1" },
      { id: "gray", name: "Gray", hex: "#808080" },
      { id: "cream", name: "Cream", hex: "#F5F5DC" },
      { id: "lavender", name: "Lavender", hex: "#E6E6FA" },
      { id: "mint", name: "Mint", hex: "#98FB98" },
    ],
  },
  {
    id: 2,
    title: "Choose Style",
    key: "style",
    fits: [
      {
        id: "classic-fit",
        name: "Classic Fit",
        price: 0,
        image: "/placeholder.svg?height=100&width=80&text=Classic",
        description: "Traditional relaxed fit",
      },
      {
        id: "slim-fit",
        name: "Slim Fit",
        price: 5,
        image: "/placeholder.svg?height=100&width=80&text=Slim",
        description: "Modern tailored fit",
      },
      {
        id: "tailored-fit",
        name: "Tailored Fit",
        price: 10,
        image: "/placeholder.svg?height=100&width=80&text=Tailored",
        description: "Custom fitted silhouette",
      },
    ],
    sleeves: [
      {
        id: "regular-sleeve",
        name: "Regular Sleeve",
        price: 0,
        image: "/placeholder.svg?height=80&width=80&text=Regular",
      },
      {
        id: "french-cuff",
        name: "French Cuff",
        price: 10,
        image: "/placeholder.svg?height=80&width=80&text=French",
      },
      {
        id: "rolled-sleeve",
        name: "Rolled Sleeve",
        price: 5,
        image: "/placeholder.svg?height=80&width=80&text=Rolled",
      },
    ],
    collars: [
      {
        id: "spread",
        name: "Spread Collar",
        price: 0,
        image: "/placeholder.svg?height=80&width=80&text=Spread",
      },
      {
        id: "button-down",
        name: "Button Down",
        price: 0,
        image: "/placeholder.svg?height=80&width=80&text=Button",
      },
      {
        id: "cutaway",
        name: "Cutaway",
        price: 8,
        image: "/placeholder.svg?height=80&width=80&text=Cutaway",
      },
      {
        id: "band",
        name: "Band Collar",
        price: 5,
        image: "/placeholder.svg?height=80&width=80&text=Band",
      },
    ],
  },
  {
    id: 3,
    title: "Color Contrast",
    key: "contrast",
    contrasts: [
      { id: "collar-outside", name: "Collar Outside", price: 12 },
      { id: "collar-inside", name: "Collar Inside", price: 12 },
      { id: "cuff-outside", name: "Cuff Outside", price: 12 },
      { id: "cuff-inside", name: "Cuff Inside", price: 12 },
      { id: "placket-inside", name: "Inside Placket", price: 12 },
      { id: "placket-outside", name: "Outside Placket", price: 12 },
    ],
    colors: [
      { id: "white", name: "White", hex: "#FFFFFF" },
      { id: "navy", name: "Navy", hex: "#000080" },
      { id: "light-blue", name: "Light Blue", hex: "#87CEEB" },
      { id: "pink", name: "Pink", hex: "#FFB6C1" },
      { id: "gray", name: "Gray", hex: "#808080" },
    ],
  },
  {
    id: 4,
    title: "Buttons & Monogram",
    key: "details",
    buttons: [
      {
        id: "standard",
        name: "Standard Buttons",
        price: 0,
        image: "/placeholder.svg?height=60&width=60&text=Standard",
      },
      {
        id: "mother-of-pearl",
        name: "Mother of Pearl",
        price: 12,
        image: "/placeholder.svg?height=60&width=60&text=Pearl",
      },
      {
        id: "horn",
        name: "Horn Buttons",
        price: 15,
        image: "/placeholder.svg?height=60&width=60&text=Horn",
      },
      {
        id: "metal",
        name: "Metal Buttons",
        price: 20,
        image: "/placeholder.svg?height=60&width=60&text=Metal",
      },
    ],
    buttonColors: [
      { id: "white", name: "White", hex: "#FFFFFF" },
      { id: "black", name: "Black", hex: "#000000" },
      { id: "navy", name: "Navy", hex: "#000080" },
      { id: "brown", name: "Brown", hex: "#8B4513" },
    ],
    monogramPositions: [
      { id: "chest", name: "Chest", price: 18 },
      { id: "cuff", name: "Cuff", price: 18 },
      { id: "collar", name: "Collar", price: 18 },
      { id: "none", name: "No Monogram", price: 0 },
    ],
  },
  {
    id: 5,
    title: "Size & Quantity",
    key: "sizing",
    sizes: [
      {
        id: "xs",
        name: "XS",
        price: 0,
        measurements: 'Chest: 34-36"',
      },
      {
        id: "s",
        name: "S",
        price: 0,
        measurements: 'Chest: 36-38"',
      },
      {
        id: "m",
        name: "M",
        price: 0,
        measurements: 'Chest: 38-40"',
      },
      {
        id: "l",
        name: "L",
        price: 0,
        measurements: 'Chest: 40-42"',
      },
      {
        id: "xl",
        name: "XL",
        price: 0,
        measurements: 'Chest: 42-44"',
      },
      {
        id: "xxl",
        name: "XXL",
        price: 5,
        measurements: 'Chest: 44-46"',
      },
      {
        id: "custom",
        name: "Custom Measurements",
        price: 25,
        measurements: "Tailored to your exact measurements",
      },
    ],
  },
]

interface FullscreenConfiguratorProps {
  productId: string
  productName: string
  basePrice: number
  productType?: "shirt" | "pants" | "jacket" | "dress"
}

export function FullscreenConfigurator({
  productId,
  productName,
  basePrice,
  productType = "shirt",
}: FullscreenConfiguratorProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showSidebar, setShowSidebar] = useState(false)
  const [configuratorState, setConfiguratorState] = useState<ConfiguratorState>({
    fabricType: "",
    fabricColor: "#FFFFFF",
    sleeveStyle: "",
    collarStyle: "",
    cuffStyle: "",
    buttonStyle: "",
    buttonColor: "#FFFFFF",
    monogramText: "",
    monogramColor: "#000080",
    monogramPosition: "none",
    size: "",
    quantity: 1,
  })

  const currentStepData = CUSTOMIZATION_STEPS.find((step) => step.id === currentStep)
  const totalSteps = CUSTOMIZATION_STEPS.length

  // Calculate completion percentage
  const calculateCompletion = () => {
    const completedSteps = CUSTOMIZATION_STEPS.filter((step) => {
      switch (step.key) {
        case "fabric":
          return configuratorState.fabricType && configuratorState.fabricColor
        case "style":
          return configuratorState.sleeveStyle && configuratorState.collarStyle
        case "contrast":
          return true // Optional step
        case "details":
          return configuratorState.buttonStyle
        case "sizing":
          return configuratorState.size
        default:
          return false
      }
    }).length

    return Math.round((completedSteps / totalSteps) * 100)
  }

  // Calculate total price
  const calculatePrice = () => {
    let total = basePrice

    // Add fabric price
    const fabricOption = currentStepData?.options?.find((opt) => opt.id === configuratorState.fabricType)
    if (fabricOption) total += fabricOption.price

    // Add style prices
    const fitOption = CUSTOMIZATION_STEPS[1]?.fits?.find((opt) => opt.id === configuratorState.sleeveStyle)
    if (fitOption) total += fitOption.price

    // Add button price
    const buttonOption = CUSTOMIZATION_STEPS[3]?.buttons?.find((opt) => opt.id === configuratorState.buttonStyle)
    if (buttonOption) total += buttonOption.price

    // Add monogram price
    const monogramOption = CUSTOMIZATION_STEPS[3]?.monogramPositions?.find(
      (opt) => opt.id === configuratorState.monogramPosition,
    )
    if (monogramOption) total += monogramOption.price

    // Add size price
    const sizeOption = CUSTOMIZATION_STEPS[4]?.sizes?.find((opt) => opt.id === configuratorState.size)
    if (sizeOption) total += sizeOption.price

    return total * configuratorState.quantity
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateState = (updates: Partial<ConfiguratorState>) => {
    setConfiguratorState((prev) => ({ ...prev, ...updates }))
  }

  // Get model URL based on product type
  const getModelUrl = () => {
    switch (productType) {
      case "pants":
        return "sample-pants"
      case "jacket":
        return "sample-jacket"
      case "dress":
        return "sample-dress"
      default:
        return "sample-shirt"
    }
  }

  const isStepCompleted = (stepKey: string) => {
    switch (stepKey) {
      case "fabric":
        return configuratorState.fabricType && configuratorState.fabricColor
      case "style":
        return configuratorState.sleeveStyle && configuratorState.collarStyle
      case "contrast":
        return true // Optional step
      case "details":
        return configuratorState.buttonStyle
      case "sizing":
        return configuratorState.size
      default:
        return false
    }
  }

  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      {/* FULL SCREEN 3D MODEL */}
      <div className="absolute inset-0">
        <ModelViewer
          modelUrl={getModelUrl()}
          customizations={{
            color: configuratorState.fabricColor,
            fabricType: configuratorState.fabricType,
            sleeveStyle: configuratorState.sleeveStyle,
            collarStyle: configuratorState.collarStyle,
            buttonStyle: configuratorState.buttonStyle,
            buttonColor: configuratorState.buttonColor,
          }}
          layerControls={{}}
        />
      </div>

      {/* TOP HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white">{currentStepData?.title}</h1>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-white">€{calculatePrice()}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <Settings className="w-4 h-4 mr-2" />
            Progress
          </Button>
        </div>
      </div>

      {/* COMPLETION SIDEBAR */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 bottom-0 w-80 bg-white/95 backdrop-blur-sm shadow-2xl z-30 border-r"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Customization Progress</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">{calculateCompletion()}%</span>
                </div>
                <Progress value={calculateCompletion()} className="h-2" />
              </div>

              {/* Step Checklist */}
              <div className="space-y-4">
                {CUSTOMIZATION_STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                      €{currentStep === step.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"}
                    `}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <Checkbox checked={isStepCompleted(step.key)} className="pointer-events-none" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{step.title}</div>
                      <div className="text-xs text-gray-600">{isStepCompleted(step.key) ? "Completed" : "Pending"}</div>
                    </div>
                    {isStepCompleted(step.key) && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                ))}
              </div>

              {/* Current Selection Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3">Current Selection</h3>
                <div className="space-y-2 text-sm">
                  {configuratorState.fabricType && <div>Fabric: {configuratorState.fabricType}</div>}
                  {configuratorState.sleeveStyle && <div>Style: {configuratorState.sleeveStyle}</div>}
                  {configuratorState.buttonStyle && <div>Buttons: {configuratorState.buttonStyle}</div>}
                  {configuratorState.size && <div>Size: {configuratorState.size}</div>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP CONTENT OVERLAY */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute top-20 left-6 right-6 z-10"
        >
          {currentStep === 1 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg max-w-5xl mx-auto">
              <div className="grid grid-cols-2 gap-8">
                {/* Fabric Types with Images */}
                <div>
                  <h3 className="font-semibold mb-4">Fabric Type</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {currentStepData?.options?.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => updateState({ fabricType: option.id })}
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all text-center
                          €{
                            configuratorState.fabricType === option.id
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                          }
                        `}
                      >
                        <img
                          src={option.image || "/placeholder.svg"}
                          alt={option.name}
                          className="w-16 h-16 mx-auto mb-3 rounded-lg object-cover"
                        />
                        <div className="font-medium">{option.name}</div>
                        {option.price > 0 && <div className="text-green-600 font-semibold">+€{option.price}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fabric Colors */}
                <div>
                  <h3 className="font-semibold mb-4">Fabric Color</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {currentStepData?.colors?.map((color) => (
                      <div
                        key={color.id}
                        onClick={() => updateState({ fabricColor: color.hex })}
                        className={`
                          p-3 rounded-lg border-2 cursor-pointer transition-all text-center hover:scale-105
                          €{
                            configuratorState.fabricColor === color.hex
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        <div
                          className="w-8 h-8 rounded-full mx-auto mb-2 border-2 border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-sm font-medium">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg max-w-6xl mx-auto">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Fit Style</h3>
                  <div className="space-y-3">
                    {CUSTOMIZATION_STEPS[1]?.fits?.map((fit) => (
                      <div
                        key={fit.id}
                        onClick={() => updateState({ sleeveStyle: fit.id })}
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all
                          €{
                            configuratorState.sleeveStyle === fit.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={fit.image || "/placeholder.svg"}
                            alt={fit.name}
                            className="w-12 h-16 rounded object-cover"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{fit.name}</div>
                            <div className="text-sm text-gray-600">{fit.description}</div>
                            {fit.price > 0 && <div className="text-green-600 font-semibold">+€{fit.price}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Sleeve Style</h3>
                  <div className="space-y-3">
                    {CUSTOMIZATION_STEPS[1]?.sleeves?.map((sleeve) => (
                      <div
                        key={sleeve.id}
                        onClick={() => updateState({ cuffStyle: sleeve.id })}
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all text-center
                          €{
                            configuratorState.cuffStyle === sleeve.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        <img
                          src={sleeve.image || "/placeholder.svg"}
                          alt={sleeve.name}
                          className="w-16 h-12 mx-auto mb-2 rounded object-cover"
                        />
                        <div className="font-medium">{sleeve.name}</div>
                        {sleeve.price > 0 && <div className="text-green-600 font-semibold">+€{sleeve.price}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Collar Style</h3>
                  <div className="space-y-3">
                    {CUSTOMIZATION_STEPS[1]?.collars?.map((collar) => (
                      <div
                        key={collar.id}
                        onClick={() => updateState({ collarStyle: collar.id })}
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all text-center
                          €{
                            configuratorState.collarStyle === collar.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        <img
                          src={collar.image || "/placeholder.svg"}
                          alt={collar.name}
                          className="w-16 h-12 mx-auto mb-2 rounded object-cover"
                        />
                        <div className="font-medium">{collar.name}</div>
                        {collar.price > 0 && <div className="text-green-600 font-semibold">+€{collar.price}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add more steps with images... */}
        </motion.div>
      </AnimatePresence>

      {/* BOTTOM NAVIGATION - FIXED TO BOTTOM */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="text-center text-sm text-white/80">
          Drag to rotate • Scroll to zoom • Double-click to reset view
        </div>

        {currentStep < totalSteps ? (
          <Button onClick={nextStep} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart - €{calculatePrice()}
          </Button>
        )}
      </div>
    </div>
  )
}
