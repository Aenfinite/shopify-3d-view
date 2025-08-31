"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, ShoppingCart, Check } from "lucide-react"
import { ModelViewer } from "@/components/3d-model-viewer"

// Import step components
import { FabricSelectionStep } from "./steps/fabric-selection-step"
import { StyleSelectionStep } from "./steps/style-selection-step"
import { ColorContrastStep } from "./steps/color-contrast-step"
import { ButtonSelectionStep } from "./steps/button-selection-step"
import { MonogramStep } from "./steps/monogram-step"
import { MeasurementStep } from "./steps/measurement-step"
import { QuantityStep } from "./steps/quantity-step"

interface ConfiguratorState {
  // Step 1: Fabric
  fabricType: string
  fabricColor: string

  // Step 2: Style
  sleeveStyle: string
  frontStyle: string
  backStyle: string
  bottomStyle: string
  collarStyle: string
  cuffStyle: string
  pocketStyle: string

  // Step 3: Color Contrast
  collarOutsideColor: string
  collarInsideColor: string
  collarBandColor: string
  cuffOutsideColor: string
  cuffInsideColor: string
  wristbandColor: string
  placketInsideColor: string
  placketOutsideColor: string
  sleeveFabricColor: string
  elbowPatchColor: string

  // Step 4: Buttons
  buttonColor: string
  buttonStyle: string

  // Step 5: Monogram
  monogramText: string
  monogramColor: string
  monogramPosition: string

  // Step 6: Measurements
  sizeType: "standard" | "custom"
  standardSize: string
  fitType: string
  customMeasurements: {
    neck: number
    chest: number
    stomach: number
    hip: number
    length: number
    shoulder: number
    sleeve: number
  }

  // Step 7: Quantity
  quantity: number
}

const STEPS = [
  { id: 1, title: "Fabric Selection", subtitle: "Choose fabric type & color" },
  { id: 2, title: "Style Options", subtitle: "Select shirt components" },
  { id: 3, title: "Color Contrast", subtitle: "Customize component colors" },
  { id: 4, title: "Buttons", subtitle: "Choose button style & color" },
  { id: 5, title: "Monogram", subtitle: "Add personalization" },
  { id: 6, title: "Measurements", subtitle: "Size & fit preferences" },
  { id: 7, title: "Quantity", subtitle: "Final details" },
]

interface StepByStepConfiguratorProps {
  productId: string
  productName: string
  productDescription: string
  basePrice: number
  modelUrl: string
}

export function StepByStepConfigurator({
  productId,
  productName,
  productDescription,
  basePrice,
  modelUrl,
}: StepByStepConfiguratorProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [configuratorState, setConfiguratorState] = useState<ConfiguratorState>({
    // Initialize with defaults
    fabricType: "",
    fabricColor: "",
    sleeveStyle: "",
    frontStyle: "",
    backStyle: "",
    bottomStyle: "",
    collarStyle: "",
    cuffStyle: "",
    pocketStyle: "",
    collarOutsideColor: "",
    collarInsideColor: "",
    collarBandColor: "",
    cuffOutsideColor: "",
    cuffInsideColor: "",
    wristbandColor: "",
    placketInsideColor: "",
    placketOutsideColor: "",
    sleeveFabricColor: "",
    elbowPatchColor: "",
    buttonColor: "",
    buttonStyle: "",
    monogramText: "",
    monogramColor: "",
    monogramPosition: "",
    sizeType: "standard",
    standardSize: "",
    fitType: "",
    customMeasurements: {
      neck: 0,
      chest: 0,
      stomach: 0,
      hip: 0,
      length: 0,
      shoulder: 0,
      sleeve: 0,
    },
    quantity: 1,
  })

  const [totalPrice, setTotalPrice] = useState(basePrice)
  const [canProceed, setCanProceed] = useState(false)

  // Calculate total price based on selections
  useEffect(() => {
    let price = basePrice

    // Add fabric premium
    if (configuratorState.fabricType === "premium-cotton") price += 15
    if (configuratorState.fabricType === "linen") price += 25
    if (configuratorState.fabricType === "silk") price += 45

    // Add style premiums
    if (configuratorState.sleeveStyle === "french-cuff") price += 10
    if (configuratorState.collarStyle === "cutaway") price += 8
    if (configuratorState.pocketStyle === "chest-pocket") price += 5

    // Add contrast colors premium
    const contrastColors = [
      configuratorState.collarOutsideColor,
      configuratorState.collarInsideColor,
      configuratorState.cuffOutsideColor,
      configuratorState.sleeveFabricColor,
      configuratorState.elbowPatchColor,
    ].filter((color) => color && color !== configuratorState.fabricColor)
    price += contrastColors.length * 12

    // Add button premium
    if (configuratorState.buttonStyle === "mother-of-pearl") price += 15
    if (configuratorState.buttonStyle === "horn") price += 20

    // Add monogram
    if (configuratorState.monogramText) price += 18

    // Add custom measurements premium
    if (configuratorState.sizeType === "custom") price += 25

    // Multiply by quantity
    price *= configuratorState.quantity

    setTotalPrice(price)
  }, [configuratorState, basePrice])

  // Check if current step is complete
  useEffect(() => {
    let complete = false

    switch (currentStep) {
      case 1:
        complete = !!(configuratorState.fabricType && configuratorState.fabricColor)
        break
      case 2:
        complete = !!(
          configuratorState.sleeveStyle &&
          configuratorState.frontStyle &&
          configuratorState.backStyle &&
          configuratorState.collarStyle &&
          configuratorState.cuffStyle
        )
        break
      case 3:
        complete = !!(
          configuratorState.collarOutsideColor &&
          configuratorState.cuffOutsideColor &&
          configuratorState.placketOutsideColor
        )
        break
      case 4:
        complete = !!(configuratorState.buttonColor && configuratorState.buttonStyle)
        break
      case 5:
        complete = true // Monogram is optional
        break
      case 6:
        if (configuratorState.sizeType === "standard") {
          complete = !!(configuratorState.standardSize && configuratorState.fitType)
        } else {
          complete = !!(
            configuratorState.customMeasurements.neck &&
            configuratorState.customMeasurements.chest &&
            configuratorState.customMeasurements.shoulder &&
            configuratorState.customMeasurements.sleeve
          )
        }
        break
      case 7:
        complete = configuratorState.quantity > 0
        break
    }

    setCanProceed(complete)
  }, [currentStep, configuratorState])

  const updateState = (updates: Partial<ConfiguratorState>) => {
    setConfiguratorState((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length && canProceed) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FabricSelectionStep
            fabricType={configuratorState.fabricType}
            fabricColor={configuratorState.fabricColor}
            onUpdate={updateState}
          />
        )
      case 2:
        return (
          <StyleSelectionStep
            sleeveStyle={configuratorState.sleeveStyle}
            frontStyle={configuratorState.frontStyle}
            backStyle={configuratorState.backStyle}
            bottomStyle={configuratorState.bottomStyle}
            collarStyle={configuratorState.collarStyle}
            cuffStyle={configuratorState.cuffStyle}
            pocketStyle={configuratorState.pocketStyle}
            onUpdate={updateState}
          />
        )
      case 3:
        return <ColorContrastStep state={configuratorState} onUpdate={updateState} />
      case 4:
        return (
          <ButtonSelectionStep
            buttonColor={configuratorState.buttonColor}
            buttonStyle={configuratorState.buttonStyle}
            onUpdate={updateState}
          />
        )
      case 5:
        return (
          <MonogramStep
            monogramText={configuratorState.monogramText}
            monogramColor={configuratorState.monogramColor}
            monogramPosition={configuratorState.monogramPosition}
            onUpdate={updateState}
          />
        )
      case 6:
        return (
          <MeasurementStep
            sizeType={configuratorState.sizeType}
            standardSize={configuratorState.standardSize}
            fitType={configuratorState.fitType}
            customMeasurements={configuratorState.customMeasurements}
            onUpdate={updateState}
          />
        )
      case 7:
        return <QuantityStep quantity={configuratorState.quantity} totalPrice={totalPrice} onUpdate={updateState} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{productName}</h1>
              <p className="text-gray-600">{productDescription}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">€{totalPrice.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Price</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      €{
                        currentStep === step.id
                          ? "bg-blue-600 text-white"
                          : currentStep > step.id
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-600"
                      }
                    `}
                  >
                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`
                        w-12 h-0.5 mx-2
                        €{currentStep > step.id ? "bg-green-600" : "bg-gray-200"}
                      `}
                    />
                  )}
                </div>
              ))}
            </div>
            <Badge variant="outline" className="text-sm">
              Step {currentStep} of {STEPS.length}
            </Badge>
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-[600px]">
          {/* LEFT PANEL - Customization (Always on Left) */}
          <div className="order-1 space-y-6">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {currentStep}
                  </span>
                  {STEPS[currentStep - 1]?.title}
                </CardTitle>
                <p className="text-blue-100 text-sm">{STEPS[currentStep - 1]?.subtitle}</p>
              </CardHeader>
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderCurrentStep()}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Navigation - Always at bottom of left panel */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>

                    {currentStep < STEPS.length ? (
                      <Button
                        onClick={nextStep}
                        disabled={!canProceed}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        Next Step
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                        <ShoppingCart className="w-4 h-4" />
                        Complete Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL - 3D Preview (Always on Right) */}
          <div className="order-2 space-y-4 sticky top-4">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
                <CardTitle className="text-lg">Live 3D Preview</CardTitle>
                <p className="text-gray-300 text-sm">See your customizations in real-time</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-b-lg overflow-hidden">
                  <ModelViewer modelUrl={modelUrl} customizations={configuratorState} layerControls={{}} />
                </div>
              </CardContent>
            </Card>

            {/* Configuration Summary - Always on right below preview */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {configuratorState.fabricType && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Fabric:</span>
                    <Badge variant="outline" className="capitalize">
                      {configuratorState.fabricType.replace("-", " ")}
                    </Badge>
                  </div>
                )}
                {configuratorState.collarStyle && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Collar:</span>
                    <Badge variant="outline" className="capitalize">
                      {configuratorState.collarStyle.replace("-", " ")}
                    </Badge>
                  </div>
                )}
                {configuratorState.monogramText && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Monogram:</span>
                    <Badge variant="outline">{configuratorState.monogramText}</Badge>
                  </div>
                )}
                {configuratorState.quantity > 1 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Quantity:</span>
                    <Badge variant="outline">{configuratorState.quantity}</Badge>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">€{totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
