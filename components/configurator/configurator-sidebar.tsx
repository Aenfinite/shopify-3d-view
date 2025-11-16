"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useConfigurator } from "@/context/configurator-context"
import { FabricSelector } from "./steps/fabric-selector"
import { StyleSelector } from "./steps/style-selector"
import { FitBodySelector } from "./steps/fit-body-selector"
import { SizeSelector } from "./steps/size-selector"
import { MeasurementInput } from "./steps/measurement-input"
import { OrderSummary } from "./steps/order-summary"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar"

export function ConfiguratorSidebar() {
  const {
    mode,
    currentStep,
    setCurrentStep,
    totalSteps,
    selectedFabric,
    selectedStyles,
    fitPreference,
    bodyShape,
    selectedSize,
    measurements,
    currentPrice,
  } = useConfigurator()

  const [canProceed, setCanProceed] = useState(false)

  // Check if user can proceed to next step
  useEffect(() => {
    switch (currentStep) {
      case 0: // Fabric selection
        setCanProceed(!!selectedFabric)
        break
      case 1: // Style selection
        // Check if all required style categories have a selection
        const requiredStyles = ["collar", "cuff", "placket"] // Example required styles
        const hasAllRequiredStyles = requiredStyles.every((style) => selectedStyles[style])
        setCanProceed(hasAllRequiredStyles)
        break
      case 2: // Fit preference and body shape
        // Check if fit preference and all body shape options are selected
        const hasCompleteBodyShape = bodyShape.shoulderType && bodyShape.backShape && bodyShape.bellyType
        setCanProceed(!!fitPreference && !!hasCompleteBodyShape)
        break
      case 3:
        if (mode === "MTO") {
          // Size selection for MTO
          setCanProceed(!!selectedSize)
        } else {
          // Measurement input for MTM
          const requiredMeasurements = ["chest", "waist", "shoulder", "sleeve"] // Example required measurements
          const hasAllMeasurements =
            measurements && requiredMeasurements.every((m) => measurements[m as keyof typeof measurements])
          setCanProceed(!!hasAllMeasurements)
        }
        break
      case 4:
        // Summary page - always can proceed to checkout
        setCanProceed(true)
        break
      default:
        setCanProceed(false)
    }
  }, [currentStep, selectedFabric, selectedStyles, fitPreference, bodyShape, selectedSize, measurements, mode])

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return "Select Fabric"
      case 1:
        return "Customize Style"
      case 2:
        return "Fit & Body Shape"
      case 3:
        return mode === "MTO" ? "Choose Size" : "Enter Measurements"
      case 4:
        return "Review Order"
      default:
        return ""
    }
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <FabricSelector />
      case 1:
        return <StyleSelector />
      case 2:
        return <FitBodySelector />
      case 3:
        return mode === "MTO" ? <SizeSelector /> : <MeasurementInput />
      case 4:
        return <OrderSummary />
      default:
        return null
    }
  }

  return (
    <Sidebar className="border-r w-full md:w-96 lg:w-[400px]">
      <SidebarHeader className="border-b p-4">
        <div className="flex flex-col space-y-2">
          <h2 className="text-xl font-semibold">{getStepTitle()}</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps + 1}
            </span>
            <span className="text-sm font-medium">€{currentPrice.toFixed(2)}</span>
          </div>
          <Progress value={((currentStep + 1) / (totalSteps + 1)) * 100} className="h-1" />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep === totalSteps ? (
            <Button
              onClick={() => {
                // Handle checkout - would integrate with Shopify here
                console.log("Proceeding to checkout")
              }}
              className="flex items-center gap-1"
            >
              Checkout
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed} className="flex items-center gap-1">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
