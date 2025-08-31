"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { ConfiguratorMode } from "@/components/configurator/configurator-layout"
import type { FabricOption, StyleOption, SizeOption, MeasurementSet } from "@/types/configurator"
import { calculatePrice } from "@/lib/price-calculator"
import { getFabrics } from "@/lib/firebase/fabric-service"
import { getStyleOptions } from "@/lib/firebase/style-service"
import {
  saveGuestCustomization,
  saveUserCustomization,
  type SavedCustomization,
} from "@/lib/save-resume/save-resume-service"
import { addToShopifyCart, prepareLineItemProperties } from "@/lib/shopify/shopify-service"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"

interface ConfiguratorContextType {
  mode: ConfiguratorMode
  setMode: (mode: ConfiguratorMode) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  selectedFabric: FabricOption | null
  setSelectedFabric: (fabric: FabricOption) => void
  selectedStyles: Record<string, StyleOption>
  setStyleOption: (category: string, option: StyleOption) => void
  fitPreference: string
  setFitPreference: (preference: string) => void
  bodyShape: {
    shoulderType: string
    backShape: string
    bellyType: string
  }
  setBodyShape: (shape: { shoulderType: string; backShape: string; bellyType: string }) => void
  selectedSize: SizeOption | null
  setSelectedSize: (size: SizeOption) => void
  measurements: MeasurementSet | null
  setMeasurements: (measurements: MeasurementSet) => void
  currentPrice: number
  totalSteps: number
  fabrics: FabricOption[]
  styleOptions: Record<string, StyleOption[]>
  loading: boolean
  saveProgress: (name?: string) => Promise<string>
  addToCart: (productId: string, variantId: string) => Promise<void>
  prepareShopifyData: () => Record<string, string>
  resumeCustomization: (customization: SavedCustomization) => void
  customizationName: string
  setCustomizationName: (name: string) => void
}

const ConfiguratorContext = createContext<ConfiguratorContextType | undefined>(undefined)

interface ConfiguratorProviderProps {
  children: ReactNode
  initialMode: ConfiguratorMode
  productId: string
}

export function ConfiguratorProvider({ children, initialMode, productId }: ConfiguratorProviderProps) {
  const [mode, setMode] = useState<ConfiguratorMode>(initialMode)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedFabric, setSelectedFabric] = useState<FabricOption | null>(null)
  const [selectedStyles, setSelectedStyles] = useState<Record<string, StyleOption>>({})
  const [fitPreference, setFitPreference] = useState<string>("")
  const [bodyShape, setBodyShape] = useState<{
    shoulderType: string
    backShape: string
    bellyType: string
  }>({
    shoulderType: "",
    backShape: "",
    bellyType: ""
  })
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null)
  const [measurements, setMeasurements] = useState<MeasurementSet | null>(null)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [fabrics, setFabrics] = useState<FabricOption[]>([])
  const [styleOptions, setStyleOptions] = useState<Record<string, StyleOption[]>>({})
  const [loading, setLoading] = useState(true)
  const [customizationName, setCustomizationName] = useState("")

  const { user } = useAuth()
  const { toast } = useToast()

  // Define total steps based on mode
  const totalSteps = mode === "MTM" ? 5 : 4 // MTM: Fabric, Style, Fit/Body, Measurements, Summary; MTO: Fabric, Style, Fit/Body, Size, Summary

  // Load data from Firebase on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Load fabrics from Firebase
        const fabricData = await getFabrics()
        setFabrics(fabricData)

        // Load style options from Firebase
        const styleData = await getStyleOptions()
        setStyleOptions(styleData)

        // Check for a customization to resume from session storage
        const resumeData = sessionStorage.getItem("resume_customization")
        if (resumeData) {
          const customization = JSON.parse(resumeData) as SavedCustomization
          resumeCustomization(customization)

          // Clear the session storage
          sessionStorage.removeItem("resume_customization")
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load customization data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Update selected styles
  const setStyleOption = (category: string, option: StyleOption) => {
    setSelectedStyles((prev) => ({
      ...prev,
      [category]: option,
    }))
  }

  // Recalculate price whenever selections change
  useEffect(() => {
    const newPrice = calculatePrice({
      mode,
      fabric: selectedFabric,
      styles: selectedStyles,
      measurements,
    })
    setCurrentPrice(newPrice)
  }, [mode, selectedFabric, selectedStyles, measurements])

  // Save progress
  const saveProgress = async (name?: string): Promise<string> => {
    try {
      const customizationData = {
        name: name || customizationName || `€{mode} Customization`,
        mode,
        productId,
        fabric: selectedFabric,
        styles: selectedStyles,
        size: selectedSize,
        measurements,
        price: currentPrice,
      }

      let savedId: string

      if (user) {
        // Save to user account
        savedId = await saveUserCustomization(user.uid, customizationData)
      } else {
        // Save as guest
        savedId = saveGuestCustomization(customizationData)
      }

      toast({
        title: "Success",
        description: "Your customization has been saved",
      })

      return savedId
    } catch (error) {
      console.error("Error saving progress:", error)
      toast({
        title: "Error",
        description: "Failed to save your customization. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Prepare data for Shopify
  const prepareShopifyData = () => {
    return prepareLineItemProperties({
      mode,
      fabric: selectedFabric,
      styles: selectedStyles,
      size: selectedSize,
      measurements,
      price: currentPrice,
    })
  }

  // Add to Shopify cart
  const addToCart = async (productId: string, variantId: string) => {
    const properties = prepareShopifyData()

    try {
      const result = await addToShopifyCart({
        productId,
        variantId,
        quantity: 1,
        properties,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Item added to cart successfully",
        })

        // Redirect to cart
        window.location.href = result.cartUrl
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Resume a saved customization
  const resumeCustomization = (customization: SavedCustomization) => {
    setMode(customization.mode as ConfiguratorMode)
    setSelectedFabric(customization.fabric)
    setSelectedStyles(customization.styles || {})

    if (customization.mode === "MTO" && customization.size) {
      setSelectedSize(customization.size)
    }

    if (customization.mode === "MTM" && customization.measurements) {
      setMeasurements(customization.measurements)
    }

    setCustomizationName(customization.name || "")

    // Set to first step
    setCurrentStep(0)

    toast({
      title: "Customization Loaded",
      description: "Your saved customization has been loaded",
    })
  }

  const value = {
    mode,
    setMode,
    currentStep,
    setCurrentStep,
    selectedFabric,
    setSelectedFabric,
    selectedStyles,
    setStyleOption,
    fitPreference,
    setFitPreference,
    bodyShape,
    setBodyShape,
    selectedSize,
    setSelectedSize,
    measurements,
    setMeasurements,
    currentPrice,
    totalSteps,
    fabrics,
    styleOptions,
    loading,
    saveProgress,
    addToCart,
    prepareShopifyData,
    resumeCustomization,
    customizationName,
    setCustomizationName,
  }

  return <ConfiguratorContext.Provider value={value}>{children}</ConfiguratorContext.Provider>
}

export function useConfigurator() {
  const context = useContext(ConfiguratorContext)
  if (context === undefined) {
    throw new Error("useConfigurator must be used within a ConfiguratorProvider")
  }
  return context
}
