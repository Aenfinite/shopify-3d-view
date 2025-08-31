"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronLeft, Palette, Shirt, Scissors, Ruler, ShoppingCart, X, Menu } from "lucide-react"
import { ModelViewer } from "@/components/3d-model-viewer"

interface ConfiguratorState {
  fabricType: string
  fabricColor: string
  sleeveStyle: string
  collarStyle: string
  buttonStyle: string
  monogramText: string
}

const STEPS = [
  {
    id: 1,
    title: "Fabric",
    icon: Palette,
    options: [
      { id: "cotton", name: "Cotton Poplin", price: 45, color: "#FFFFFF" },
      { id: "premium-cotton", name: "Premium Cotton", price: 60, color: "#F8F8FF" },
      { id: "linen", name: "Linen", price: 70, color: "#FAF0E6" },
      { id: "silk", name: "Silk", price: 90, color: "#FFF8DC" },
    ],
  },
  {
    id: 2,
    title: "Style",
    icon: Shirt,
    options: [
      { id: "classic", name: "Classic Fit", price: 0 },
      { id: "slim", name: "Slim Fit", price: 5 },
      { id: "tailored", name: "Tailored Fit", price: 10 },
    ],
  },
  {
    id: 3,
    title: "Details",
    icon: Scissors,
    options: [
      { id: "standard", name: "Standard Collar", price: 0 },
      { id: "spread", name: "Spread Collar", price: 8 },
      { id: "cutaway", name: "Cutaway Collar", price: 12 },
    ],
  },
  {
    id: 4,
    title: "Size",
    icon: Ruler,
    options: [
      { id: "s", name: "Small", price: 0 },
      { id: "m", name: "Medium", price: 0 },
      { id: "l", name: "Large", price: 0 },
      { id: "xl", name: "X-Large", price: 0 },
    ],
  },
]

interface FloatingSidebarConfiguratorProps {
  productId: string
  productName: string
  basePrice: number
}

export function FloatingSidebarConfigurator({ productId, productName, basePrice }: FloatingSidebarConfiguratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [configuratorState, setConfiguratorState] = useState<ConfiguratorState>({
    fabricType: "",
    fabricColor: "#FFFFFF",
    sleeveStyle: "",
    collarStyle: "",
    buttonStyle: "",
    monogramText: "",
  })

  const currentStepData = STEPS.find((step) => step.id === currentStep)
  const totalPrice =
    basePrice +
    (currentStepData?.options.find(
      (opt) =>
        opt.id === configuratorState.fabricType ||
        opt.id === configuratorState.sleeveStyle ||
        opt.id === configuratorState.collarStyle,
    )?.price || 0)

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const selectOption = (optionId: string, optionColor?: string) => {
    const stepType = currentStepData?.title.toLowerCase()

    if (stepType === "fabric") {
      setConfiguratorState((prev) => ({
        ...prev,
        fabricType: optionId,
        fabricColor: optionColor || prev.fabricColor,
      }))
    } else if (stepType === "style") {
      setConfiguratorState((prev) => ({
        ...prev,
        sleeveStyle: optionId,
      }))
    } else if (stepType === "details") {
      setConfiguratorState((prev) => ({
        ...prev,
        collarStyle: optionId,
      }))
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* FULL SCREEN 3D MODEL BACKGROUND */}
      <div className="absolute inset-0 w-full h-full">
        <ModelViewer modelUrl="sample-shirt" customizations={configuratorState} layerControls={{}} />
      </div>

      {/* FLOATING MENU TRIGGER BUTTON */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`
          fixed top-1/2 left-4 -translate-y-1/2 z-50
          bg-white/90 backdrop-blur-sm shadow-2xl rounded-full p-4
          hover:bg-white transition-all duration-300
          €{isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="w-6 h-6 text-gray-800" />
      </motion.button>

      {/* FLOATING SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Floating Sidebar */}
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-80"
            >
              <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
                {/* Header */}
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg relative">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 top-4 text-white/80 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <CardTitle className="text-lg flex items-center gap-3">
                    {currentStepData && <currentStepData.icon className="w-6 h-6" />}
                    Step {currentStep}: {currentStepData?.title}
                  </CardTitle>

                  {/* Progress Dots */}
                  <div className="flex gap-2 mt-3">
                    {STEPS.map((step) => (
                      <div
                        key={step.id}
                        className={`
                          w-3 h-3 rounded-full transition-all
                          €{
                            currentStep === step.id
                              ? "bg-white"
                              : currentStep > step.id
                                ? "bg-green-400"
                                : "bg-white/30"
                          }
                        `}
                      />
                    ))}
                  </div>
                </CardHeader>

                {/* Content */}
                <CardContent className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {currentStepData?.options.map((option) => (
                        <motion.div key={option.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Card
                            className={`
                              cursor-pointer transition-all border-2 hover:shadow-md
                              €{
                                configuratorState.fabricType === option.id ||
                                configuratorState.sleeveStyle === option.id ||
                                configuratorState.collarStyle === option.id
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }
                            `}
                            onClick={() => selectOption(option.id, option.color)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {option.color && (
                                    <div
                                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                                      style={{ backgroundColor: option.color }}
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium text-gray-900">{option.name}</div>
                                    {option.price > 0 && <div className="text-sm text-green-600">+€{option.price}</div>}
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>

                {/* Navigation Footer */}
                <div className="p-4 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>

                    {currentStep < STEPS.length ? (
                      <Button onClick={nextStep} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
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

                  {/* Price Display */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">€{totalPrice}</div>
                    <div className="text-sm text-gray-600">Total Price</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FLOATING PRICE BADGE (when sidebar closed) */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-3 text-lg font-bold shadow-lg">
            €{totalPrice}
          </Badge>
        </motion.div>
      )}

      {/* FLOATING ADD TO CART (when sidebar closed) */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-40 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-medium"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </motion.button>
      )}
    </div>
  )
}
