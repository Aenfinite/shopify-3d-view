"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ShoppingCart, Maximize2, RotateCcw } from "lucide-react"
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
    options: [
      { id: "cotton-poplin", name: "Cotton Poplin", price: 0, color: "#FFFFFF" },
      { id: "premium-cotton", name: "Premium Cotton", price: 15, color: "#F8F8FF" },
      { id: "linen-blend", name: "Linen Blend", price: 25, color: "#FAF0E6" },
      { id: "silk-blend", name: "Silk Blend", price: 45, color: "#FFF8DC" },
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
    options: [
      { id: "classic-fit", name: "Classic Fit", price: 0 },
      { id: "slim-fit", name: "Slim Fit", price: 5 },
      { id: "tailored-fit", name: "Tailored Fit", price: 10 },
    ],
    styles: [
      { id: "regular-sleeve", name: "Regular Sleeve", price: 0 },
      { id: "french-cuff", name: "French Cuff", price: 10 },
      { id: "rolled-sleeve", name: "Rolled Sleeve", price: 5 },
    ],
    collars: [
      { id: "spread", name: "Spread Collar", price: 0 },
      { id: "button-down", name: "Button Down", price: 0 },
      { id: "cutaway", name: "Cutaway", price: 8 },
      { id: "band", name: "Band Collar", price: 5 },
    ],
  },
  {
    id: 3,
    title: "Color Contrast",
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
    buttons: [
      { id: "standard", name: "Standard Buttons", price: 0 },
      { id: "mother-of-pearl", name: "Mother of Pearl", price: 12 },
      { id: "horn", name: "Horn Buttons", price: 15 },
      { id: "metal", name: "Metal Buttons", price: 20 },
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
    sizes: [
      { id: "xs", name: "XS", price: 0 },
      { id: "s", name: "S", price: 0 },
      { id: "m", name: "M", price: 0 },
      { id: "l", name: "L", price: 0 },
      { id: "xl", name: "XL", price: 0 },
      { id: "xxl", name: "XXL", price: 5 },
      { id: "custom", name: "Custom Measurements", price: 25 },
    ],
  },
]

interface CleanStepConfiguratorProps {
  productId: string
  productName: string
  basePrice: number
  productType?: "shirt" | "pants" | "jacket" | "dress"
}

export function CleanStepConfigurator({
  productId,
  productName,
  basePrice,
  productType = "shirt",
}: CleanStepConfiguratorProps) {
  const [currentStep, setCurrentStep] = useState(1)
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

  // Calculate total price
  const calculatePrice = () => {
    let total = basePrice

    // Add fabric price
    const fabricOption = currentStepData?.options?.find((opt) => opt.id === configuratorState.fabricType)
    if (fabricOption) total += fabricOption.price

    // Add style prices
    const styleOption = CUSTOMIZATION_STEPS[1]?.options?.find((opt) => opt.id === configuratorState.sleeveStyle)
    if (styleOption) total += styleOption.price

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

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between p-6 bg-white border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">{currentStepData?.title}</h1>
          <Badge variant="outline" className="text-sm">
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-gray-900">€{calculatePrice()}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ShoppingCart className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative">
        {/* 3D MODEL VIEWER - FULL AREA */}
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

        {/* STEP CONTENT OVERLAY */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-6 left-6 right-6 z-10"
          >
            {currentStep === 1 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg max-w-4xl">
                <div className="grid grid-cols-2 gap-8">
                  {/* Fabric Types */}
                  <div>
                    <h3 className="font-semibold mb-4">Fabric Type</h3>
                    <div className="space-y-3">
                      {currentStepData?.options?.map((option) => (
                        <div
                          key={option.id}
                          onClick={() => updateState({ fabricType: option.id })}
                          className={`
                            p-3 rounded-lg border-2 cursor-pointer transition-all
                            €{
                              configuratorState.fabricType === option.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{option.name}</span>
                            {option.price > 0 && <span className="text-green-600">+€{option.price}</span>}
                          </div>
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
                            p-3 rounded-lg border-2 cursor-pointer transition-all text-center
                            €{
                              configuratorState.fabricColor === color.hex
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        >
                          <div
                            className="w-8 h-8 rounded-full mx-auto mb-2 border"
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
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg max-w-4xl">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Fit Style</h3>
                    <div className="space-y-2">
                      {currentStepData?.options?.map((option) => (
                        <div
                          key={option.id}
                          onClick={() => updateState({ sleeveStyle: option.id })}
                          className={`
                            p-3 rounded-lg border cursor-pointer transition-all
                            €{
                              configuratorState.sleeveStyle === option.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        >
                          <div className="flex justify-between">
                            <span>{option.name}</span>
                            {option.price > 0 && <span className="text-green-600">+€{option.price}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Sleeve Style</h3>
                    <div className="space-y-2">
                      {CUSTOMIZATION_STEPS[1]?.styles?.map((style) => (
                        <div
                          key={style.id}
                          onClick={() => updateState({ sleeveStyle: style.id })}
                          className={`
                            p-3 rounded-lg border cursor-pointer transition-all
                            €{
                              configuratorState.sleeveStyle === style.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        >
                          <div className="flex justify-between">
                            <span>{style.name}</span>
                            {style.price > 0 && <span className="text-green-600">+€{style.price}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Collar Style</h3>
                    <div className="space-y-2">
                      {CUSTOMIZATION_STEPS[1]?.collars?.map((collar) => (
                        <div
                          key={collar.id}
                          onClick={() => updateState({ collarStyle: collar.id })}
                          className={`
                            p-3 rounded-lg border cursor-pointer transition-all
                            €{
                              configuratorState.collarStyle === collar.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        >
                          <div className="flex justify-between">
                            <span>{collar.name}</span>
                            {collar.price > 0 && <span className="text-green-600">+€{collar.price}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add more steps here... */}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* BOTTOM NAVIGATION */}
      <div className="flex items-center justify-between p-6 bg-white border-t">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="text-center text-sm text-gray-600">
          Drag to rotate • Scroll to zoom • Double-click to reset view
        </div>

        {currentStep < totalSteps ? (
          <Button onClick={nextStep} className="flex items-center gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  )
}
