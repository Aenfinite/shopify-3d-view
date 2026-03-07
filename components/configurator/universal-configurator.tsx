"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Maximize2,
  RotateCcw,
  Check,
  CheckCircle,
  Palette,
  Shirt,
  Scissors,
  Package,
  Heart,
  Star,
  Ruler,
  Menu,
  X,
} from "lucide-react"
import { ModelViewer } from "@/components/3d-model-viewer"
import { motion, AnimatePresence } from "framer-motion"
import { getCustomizationOptions } from "@/lib/firebase/unified-product-service"
import { MeasurementStep } from "./steps/measurement-step"
import { JacketLiningStep } from "./steps/jacket-lining-step"
import { LiningSelectionStep } from "./steps/lining-selection-step"
import { CheckoutModal } from "./checkout-modal"
import { MonogramConfigurator } from "./monogram-configurator-professional"
import { EmbroideredMonogramStep } from "./steps/embroidered-monogram-step"
import { MeasurementConfirmStep } from "./steps/measurement-confirm-step"
import { FabricTypeSelector } from "./fabric-type-selector"
import { FabricColorSelector } from "./fabric-color-selector"
import {
  getProfileByGarmentType,
  saveMeasurementProfile,
  upsertCustomer,
  type MeasurementProfile,
} from "@/lib/firebase/measurement-profile-service"
import {
  detectShopifyCustomer,
  verifyShopifyCustomerToken,
  getCustomerTokenFromUrl,
  type ShopifyCustomer,
} from "@/lib/shopify/shopify-customer-detection"

// Thread colors for monogram preview
const THREAD_COLORS = [
  { id: "navy", name: "Navy Blue", color: "#1e3a8a" },
  { id: "black", name: "Black", color: "#000000" },
  { id: "white", name: "White", color: "#ffffff" },
  { id: "gold", name: "Gold", color: "#fbbf24" },
  { id: "silver", name: "Silver", color: "#9ca3af" },
  { id: "red", name: "Red", color: "#dc2626" },
  { id: "green", name: "Forest Green", color: "#166534" },
  { id: "brown", name: "Brown", color: "#92400e" },
  { id: "purple", name: "Purple", color: "#7c3aed" },
  { id: "burgundy", name: "Burgundy", color: - "#991b1b" },
  { id: "royal", name: "Royal Blue", color: "#2563eb" },
  { id: "charcoal", name: "Charcoal", color: "#374151" },
]

interface UniversalConfiguratorProps {
  productId: string
  productName: string
  basePrice: number
  productType?: string
}

interface CustomizationOption {
  id: string
  name: string
  type: "color" | "texture" | "component" | "custom"
  category: string
  customComponent?: string
  values: CustomizationValue[]
}

interface CustomizationValue {
  id: string
  name: string
  value: string
  price: number
  thumbnail?: string
  color?: string
  layerControls?: {
    show: string[]
    hide: string[]
  }
}

interface ConfiguratorState {
  [key: string]: {
    optionId: string
    valueId: string
    price: number
    value: string
    color?: string
    layerControls?: {
      show: string[]
      hide: string[]
    }
  }
}

interface MeasurementData {
  sizeType: "standard" | "custom"
  standardSize?: string
  fitType?: "slim" | "regular" | "comfort"
  fitPreference?: "slim" | "regular" | "comfort"
  shoulderType?: string
  backShape?: string
  bellyType?: string
  customMeasurementMethod?: "videos" | "sketches"
  customMeasurements?: {
    neck: number
    chest: number
    stomach: number
    hip: number
    length: number
    shoulder: number
    sleeve: number
  }
}

export function UniversalConfigurator({
  productId,
  productName,
  basePrice,
  productType = "garment",
}: UniversalConfiguratorProps) {
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOption[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [configuratorState, setConfiguratorState] = useState<ConfiguratorState>({})
  const [measurementData, setMeasurementData] = useState<MeasurementData>({
    sizeType: "standard",
    standardSize: "m",
    fitType: "regular",
    fitPreference: "regular",
    customMeasurements: {
      neck: 0,
      chest: 0,
      stomach: 0,
      hip: 0,
      length: 0,
      shoulder: 0,
      sleeve: 0,
    },
  })
  const [liningSelectionData, setLiningSelectionData] = useState({
    liningType: "standard" as "standard" | "custom" | "unlined",
    customType: undefined as "custom-coloured" | "quilted" | undefined,
    liningFabric: "",
    liningColor: "",
    liningMeshType: "standard" as "standard" | "custom-coloured" | "unlined" | "quilted" | undefined,
  })
  const [jacketLiningData, setJacketLiningData] = useState({
    liningType: "standard" as "standard" | "custom" | "unlined",
    standardLiningColor: "",
    customLiningColor: "",
    monogramEnabled: false,
    monogramType: "none" as "initials" | "fullname" | "none",
    monogramText: "",
    monogramFont: "england" as "england" | "arial",
    threadColor: "navy",
  })
  const [monogramData, setMonogramData] = useState({
    text: "",
    position: "no-monogram",
    style: "classic-serif",
    color: "navy",
    monogramEnabled: false,
    monogramType: "initials" as "initials" | "fullname",
    monogramFont: "england" as "england" | "arial",
    threadColor: "navy",
  })
  const [customerEmail, setCustomerEmail] = useState("")
  const [shopifyCustomer, setShopifyCustomer] = useState<ShopifyCustomer | null>(null)
  const [savedMeasurementProfile, setSavedMeasurementProfile] = useState<MeasurementProfile | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [measurementsConfirmed, setMeasurementsConfirmed] = useState(false)
  const [customerAutoDetected, setCustomerAutoDetected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [cameraRotationY, setCameraRotationY] = useState(0) // Camera Y-axis rotation for viewing different parts
  const [cameraTargetY, setCameraTargetY] = useState(0) // Camera vertical target position

  // ─── Auto-detect Shopify customer on mount ──────────────────────────────
  useEffect(() => {
    ; (async () => {
      setIsProfileLoading(true)
      try {
        let customer: ShopifyCustomer | null = null

        // ─ LAYER 1: Secure token verification ────────────────────────
        // If the Shopify theme passed a customerAccessToken in the URL,
        // verify it against the Storefront API to confirm it's genuine.
        const token = getCustomerTokenFromUrl()
        if (token) {
          console.log("🔒 Verifying Shopify customer token...")
          const verified = await verifyShopifyCustomerToken(token)
          if (verified) {
            console.log("✅ Shopify token verified for:", verified.email)
            customer = verified
          } else {
            console.warn("⚠️ Token verification failed — falling back to URL params")
          }
        }

        // ─ LAYER 2: URL params fallback ───────────────────────────
        // No token or verification failed — read from Liquid-injected URL params.
        if (!customer) {
          customer = detectShopifyCustomer()
        }

        if (customer && customer.email) {
          setShopifyCustomer(customer)
          setCustomerEmail(customer.email)
          setCustomerAutoDetected(true)

          // Ensure customer record exists in Firebase (links Shopify ID to email)
          await upsertCustomer({
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            shopifyCustomerId: customer.id,
          })

          // Look up their existing measurement profile
          const profile = await getProfileByGarmentType(customer.email, productType)
          setSavedMeasurementProfile(profile)
          console.log("📋 Profile lookup for", customer.email, "→", profile ? "👍 Found" : "❓ Not found")
        }
      } catch (err) {
        console.error("Error during Shopify customer detection:", err)
      } finally {
        setIsProfileLoading(false)
      }
    })()
  }, [productType])

  // Load customization options
  useEffect(() => {
    const loadCustomizationOptions = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log(`Loading customization options for product: ${productId}`)
        const options = await getCustomizationOptions(productId)

        console.log(`Loaded ${options.length} customization options:`, options)

        // Log specifically if front-pocket option exists
        const frontPocketOption = options.find(opt => opt.id === "front-pocket")
        if (frontPocketOption) {
          console.log("✅ front-pocket option found:", frontPocketOption)
        } else {
          console.warn("⚠️ front-pocket option NOT FOUND in loaded options")
        }

        setCustomizationOptions(options)

        if (options.length === 0) {
          setError(`No customization options found for product ${productId}`)
        }
      } catch (err) {
        console.error("Error loading customization options:", err)
        setError("Failed to load customization options")
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      loadCustomizationOptions()
    }
  }, [productId])

  // Total steps = customization options + fit preference step + measurement step + review/confirm step
  const totalSteps = customizationOptions.length + 3
  const currentStepData = customizationOptions[currentStep]
  const isFitPreferenceStep = currentStep === customizationOptions.length
  const isMeasurementStep = currentStep === customizationOptions.length + 1
  const isMeasurementConfirmStep = currentStep === customizationOptions.length + 2
  const isLiningSelectionStep = currentStepData?.type === "custom" && currentStepData?.customComponent === "lining-selection"
  const isJacketLiningStep = currentStepData?.type === "custom" && currentStepData?.customComponent === "jacket-lining"
  const isMonogramStep = currentStepData?.id === "jacket-monogram" || currentStepData?.customComponent === "monogram"
  const isEmbroideredMonogramStep = currentStepData?.id === "embroidered-monogram" || currentStepData?.customComponent === "embroidered-monogram"
  const isFabricTypeStep = currentStepData?.id === "fabric-type"
  const isFabricColorStep = currentStepData?.id === "fabric-color"

  // Calculate total price including measurement surcharge
  const calculatePrice = () => {
    let total = basePrice || 0
    Object.values(configuratorState).forEach((selection) => {
      total += selection.price || 0
    })
    // Add custom measurement surcharge
    if (measurementData.sizeType === "custom") {
      total += 25 // €25 surcharge for custom measurements
    }
    // Add lining selection costs
    if (liningSelectionData.liningType === "custom" && liningSelectionData.customType) {
      if (liningSelectionData.customType === "custom-coloured") {
        total += 25 // Custom coloured lining surcharge
      } else if (liningSelectionData.customType === "quilted") {
        total += 35 // Quilted lining surcharge
      }
      // Note: unlined has no price adjustment - same as standard
    }
    // Note: "none" lining type has no price adjustment - same as standard
    // Add jacket lining costs
    if (jacketLiningData.liningType === "custom") {
      total += 25 // Custom lining surcharge
    }
    // Note: no lining has no price adjustment - same as standard
    // Add monogram costs
    if (jacketLiningData.monogramEnabled) {
      total += jacketLiningData.monogramType === "initials" ? 8.5 : 15.0
    }
    return total
  }

  // Calculate completion percentage
  const calculateCompletion = () => {
    const completedCustomizations = Object.keys(configuratorState).length
    const fitPreferenceCompleted = measurementData.fitPreference !== undefined
    const measurementCompleted =
      measurementData.sizeType === "standard"
        ? measurementData.standardSize && measurementData.fitType
        : Object.values(measurementData.customMeasurements || {}).some((val) => val > 0)

    const totalCompleted = completedCustomizations + (fitPreferenceCompleted ? 1 : 0) + (measurementCompleted ? 1 : 0)
    return totalSteps > 0 ? Math.round((totalCompleted / totalSteps) * 100) : 0
  }

  // Smart camera positioning based on customization step
  useEffect(() => {
    if (!currentStepData?.id) {
      setCameraRotationY(0)
      setCameraTargetY(0)
      return
    }

    const optionId = currentStepData.id.toLowerCase()

    // Define camera angles and target heights for different parts
    const cameraSettings: Record<string, { angle: number; targetY: number }> = {
      // Back view for vents and back pockets (180°, normal height)
      'jacket-vent-style': { angle: Math.PI, targetY: 0 },
      'back-pocket': { angle: Math.PI, targetY: 0 },
      'back-pockets': { angle: Math.PI, targetY: 0 },

      // 45° right angle for front pockets (normal height)
      'front-pocket': { angle: Math.PI / 4, targetY: 0 },

      // Slight angle for sleeve buttons (45° right side)
      'jacket-sleeve-buttons': { angle: Math.PI / 4, targetY: 0.2 },
      'sleeve-buttons': { angle: Math.PI / 4, targetY: 0.2 },

      // Front view for front elements (0°)
      'jacket-front-style': { angle: 0, targetY: 0 },
      'front-style': { angle: 0, targetY: 0 },
      'chest-pocket': { angle: 0, targetY: 0.3 },

      // Slight left angle for buttons
      'button-style': { angle: -Math.PI / 6, targetY: 0.2 },
      'button-color': { angle: -Math.PI / 6, targetY: 0.2 },
      'button-configuration': { angle: -Math.PI / 6, targetY: 0.2 },

      // Three-quarter view for lapels
      'lapel-style': { angle: Math.PI / 6, targetY: 0.3 },
      'lapel': { angle: Math.PI / 6, targetY: 0.3 },

      // Front for fabric
      'fabric-type': { angle: 0, targetY: 0 },
      'fabric-color': { angle: 0, targetY: 0 },

      // Pants-specific angles with vertical positioning
      'bottom-cuffs': { angle: 0, targetY: -0.8 }, // Front view, look down at bottom cuffs
      'waist-band-extension': { angle: -Math.PI / 2, targetY: 0.2 }, // Left side view, waist height
      'waistband-style': { angle: -Math.PI / 2, targetY: 0.2 }, // Left side view
      'waistband-extension': { angle: -Math.PI / 2, targetY: 0.2 }, // Left side view
    }

    // Find the appropriate camera settings
    const settings = cameraSettings[optionId] ?? { angle: 0, targetY: 0 }

    setCameraRotationY(settings.angle)
    setCameraTargetY(settings.targetY)
    console.log(`📷 Camera for ${optionId}: ${(settings.angle * 180 / Math.PI).toFixed(0)}°, targetY: ${settings.targetY.toFixed(2)}`)
  }, [currentStep, currentStepData])

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const selectOption = (
    optionId: string,
    valueId: string,
    price: number,
    value: string,
    color?: string,
    layerControls?: any,
  ) => {
    console.log(`🖱️ CLICK: Selecting option: ${optionId}, value: ${value}, color: ${color}`)
    setConfiguratorState((prev) => {
      const newState = {
        ...prev,
        [optionId]: {
          optionId,
          valueId,
          price: price || 0,
          value,
          color,
          layerControls,
        },
      }
      console.log("✅ Updated configurator state:", newState)
      return newState
    })
  }

  const updateMeasurementData = (updates: Partial<MeasurementData>) => {
    setMeasurementData((prev) => ({ ...prev, ...updates }))
  }

  const updateLiningSelectionData = (updates: any) => {
    console.log("🔧 updateLiningSelectionData called with:", updates)
    setLiningSelectionData((prev) => {
      const newData = { ...prev, ...updates }
      console.log("🔧 New liningSelectionData:", newData)

      // Update configurator state for 3D model when lining selection changes
      if (updates.liningType || updates.liningColor || updates.liningMeshType) {
        let meshType: string | undefined
        if (newData.liningType === 'unlined') {
          meshType = 'unlined'
        } else if (newData.liningType === 'standard') {
          meshType = 'standard'
        } else {
          meshType = newData.liningMeshType || newData.customType
        }
        setConfiguratorState((prevState) => ({
          ...prevState,
          'jacket-lining-selection': {
            optionId: 'jacket-lining-selection',
            valueId: newData.liningFabric || newData.liningType,
            price: newData.liningType === 'custom' ? 25 : 0,
            value: newData.liningType,
            color: newData.liningColor,
            liningMeshType: meshType,
          },
        }))
        console.log("🔧 Updated configuratorState with liningMeshType:", meshType)
      }

      return newData
    })
  }

  const updateJacketLiningData = (updates: any) => {
    setJacketLiningData((prev) => ({ ...prev, ...updates }))
  }

  const updateMonogramData = (updates: any) => {
    setMonogramData((prev) => ({ ...prev, ...updates }))
  }

  // ─── Measurement Profile Handlers ──────────────────────────────────────────

  /** Collect all current measurements into a Record<string, number> */
  const getCurrentMeasurementsRecord = (): Record<string, number> => {
    const allMeasurements: Record<string, number> = {}

    // Pull from the extended measurementData.measurementData (set by measurement-step onUpdate)
    if ((measurementData as any).measurementData) {
      Object.entries((measurementData as any).measurementData).forEach(([key, value]) => {
        const numVal = parseFloat(value as string) || 0
        if (numVal > 0) allMeasurements[key] = numVal
      })
    }

    // Fallback to legacy customMeasurements fields
    if (Object.keys(allMeasurements).length === 0 && measurementData.customMeasurements) {
      Object.entries(measurementData.customMeasurements).forEach(([key, value]) => {
        if (value > 0) allMeasurements[key] = value
      })
    }

    return allMeasurements
  }

  /** Look up a measurement profile by email for the current garment type */
  const handleEmailLookup = async (email: string) => {
    setIsProfileLoading(true)
    try {
      const profile = await getProfileByGarmentType(email, productType)
      setSavedMeasurementProfile(profile)
      console.log("📋 Profile lookup for", email, "→", profile ? "Found" : "Not found")
    } catch (error) {
      console.error("Error looking up measurement profile:", error)
      setSavedMeasurementProfile(null)
    } finally {
      setIsProfileLoading(false)
    }
  }

  /** Called when user confirms measurements on the review step */
  const handleMeasurementsConfirmed = async (measurements: Record<string, number>, email: string) => {
    setMeasurementsConfirmed(true)

    // Save / update profile in Firebase if an email was provided
    if (email) {
      try {
        await saveMeasurementProfile({
          email,
          garmentType: productType as "jacket" | "pants" | "shirt" | "suit" | "blazer",
          measurements,
          measurementMethod: measurementData.customMeasurementMethod || "sketches",
          fitPreference: measurementData.fitPreference,
          shoulderType: measurementData.shoulderType,
          backShape: measurementData.backShape,
          bellyType: measurementData.bellyType,
        })
        console.log("✅ Measurement profile saved for", email)
      } catch (error) {
        console.error("Error saving measurement profile:", error)
      }
    }

    // Open checkout modal
    setShowCheckoutModal(true)
  }

  /** Navigate back to the measurement-taking step */
  const handleGoToMeasurementStep = () => {
    setCurrentStep(customizationOptions.length + 1)
  }

  /** Called from MeasurementStep when saved measurements are found and accepted —
   *  jumps straight to the Review & Confirm step, skipping measurement entry */
  const handleUseSavedFromMeasurementStep = () => {
    setCurrentStep(customizationOptions.length + 2)
  }

  /** Edit Configuration – go back to step 0 */
  const handleEditConfiguration = () => {
    setCurrentStep(0)
  }

  const isStepCompleted = (stepIndex: number) => {
    if (stepIndex < customizationOptions.length) {
      const option = customizationOptions[stepIndex]
      if (option?.type === "custom" && option?.customComponent === "lining-selection") {
        // Lining selection step is always completed (standard is default)
        return true
      }
      if (option?.type === "custom" && option?.customComponent === "jacket-lining") {
        // Jacket lining step is completed if a lining type is selected
        return jacketLiningData.liningType === "standard" || jacketLiningData.liningType === "custom" || jacketLiningData.liningType === "unlined"
      }
      if (option?.id === "jacket-monogram") {
        return !monogramData.monogramEnabled || (monogramData.text !== "" && monogramData.monogramType && monogramData.threadColor)
      }
      if (option?.id === "embroidered-monogram" || option?.customComponent === "embroidered-monogram") {
        return !monogramData.monogramEnabled || (monogramData.text !== "" && monogramData.monogramType && monogramData.threadColor)
      }
      if (option?.id === "monogram-text") {
        return monogramData.position === "no-monogram" || monogramData.text !== ""
      }
      if (option?.id === "monogram-style") {
        return monogramData.position === "no-monogram" || monogramData.style !== ""
      }
      if (option?.id === "monogram-color") {
        return monogramData.position === "no-monogram" || monogramData.color !== ""
      }
      return option && configuratorState[option.id]
    } else if (stepIndex === customizationOptions.length + 1) {
      // Measurement step
      return measurementData.sizeType === "standard"
        ? measurementData.standardSize && measurementData.fitType
        : Object.values(measurementData.customMeasurements || {}).some((val) => val > 0)
    } else {
      // Measurement confirm step
      return measurementsConfirmed
    }
  }

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

  // Generate customizations for 3D model
  const generateCustomizations = () => {
    const customizations: Record<string, any> = {}

    Object.values(configuratorState).forEach((selection) => {
      const option = customizationOptions.find((opt) => opt.id === selection.optionId)
      const value = option?.values.find((val) => val.id === selection.valueId)

      if (value && option) {
        // Handle fabric colors specifically
        if (option.id === "fabric-color" && selection.color) {
          customizations.color = selection.color
          customizations.fabricColor = selection.color
          customizations.mainColor = selection.color
          console.log("Setting fabric color:", selection.color)
        }
        // Handle other colors but NOT for button color changes or monogram thread color
        else if (selection.color && !option.name.toLowerCase().includes("button") && !option.name.toLowerCase().includes("monogram")) {
          const colorValue = selection.color || value.color
          const optionNameLower = option.name.toLowerCase().replace(/\s+/g, "")

          customizations.color = colorValue
          customizations.fabricColor = colorValue

          // Also set specific color properties based on option name
          if (optionNameLower.includes("fabric") || optionNameLower.includes("main")) {
            customizations.fabricColor = colorValue
            customizations.mainColor = colorValue
          } else if (optionNameLower.includes("collar")) {
            customizations.collarColor = colorValue
          } else if (optionNameLower.includes("cuff")) {
            customizations.cuffColor = colorValue
          } else if (optionNameLower.includes("pocket")) {
            customizations.pocketColor = colorValue
          } else if (optionNameLower.includes("sleeve")) {
            customizations.sleeveColor = colorValue
          } else if (optionNameLower.includes("lining")) {
            customizations.liningColor = colorValue
            console.log("🔍 Lining selection object:", selection)
            // Also get liningMeshType if available in the selection
            if (selection.liningMeshType) {
              customizations.liningMeshType = selection.liningMeshType
              console.log("✅ Setting liningMeshType from configuratorState:", selection.liningMeshType)
            } else {
              console.log("⚠️ No liningMeshType in selection object. Keys:", Object.keys(selection))
            }
          } else if (optionNameLower.includes("trim")) {
            customizations.trimColor = colorValue
          } else if (optionNameLower.includes("accent")) {
            customizations.accentColor = colorValue
          }
        }

        // Handle button colors specifically (don't affect garment color or thread)
        if (option.name.toLowerCase().includes("button")) {
          if (selection.color && selection.color !== "standard") {
            // Only change button color, thread stays matching fabric
            customizations.buttonColor = selection.color
            console.log("Setting button color:", selection.color, "| Thread will match fabric")
          } else {
            // Standard matching - buttons match fabric
            customizations.buttonColor = "standard"
            console.log("Setting button to standard matching (will use fabric color)")
          }
          // NEVER set threadColor here - it should always match fabric
        }

        // Handle monogram thread color specifically (don't affect garment color)
        if (option.name.toLowerCase().includes("monogram") && option.name.toLowerCase().includes("color")) {
          customizations.monogramThreadColor = selection.color || value.color
          console.log("Setting monogram thread color:", selection.color || value.color)
        }

        // Handle fabric types
        if (option.type === "texture" || option.id === "fabric-type") {
          customizations.fabrictype = value.value
          console.log("Setting fabric type:", value.value)
        }

        // Handle jacket-specific customizations
        if (option.id === "jacket-front-style") {
          // Normalize front style value to match expected values
          let normalizedValue = value.value
          const valueLower = value.value.toLowerCase()

          // Check for double-breasted FIRST (2×3 buttons contains "2" and "3")
          if (valueLower.includes("×") || valueLower.includes("x") || valueLower.includes("double") || valueLower.includes("6d2") || valueLower === "2×3 buttons") {
            normalizedValue = "6d2"
          } else if (valueLower.includes("three") || valueLower.includes("3 button")) {
            normalizedValue = "3button"
          } else if (valueLower.includes("two") || valueLower.includes("2 button")) {
            normalizedValue = "2button"
          }

          console.log("🎯 Front style selected:", {
            original: value.value,
            normalized: normalizedValue
          })

          customizations.frontStyle = normalizedValue
          customizations.front_style = normalizedValue
          customizations["jacket-front-style"] = normalizedValue
        } else if (option.id === "jacket-sleeve-buttons") {
          customizations.sleeveButtons = value.value
          customizations.sleeve_buttons = value.value
          customizations["jacket-sleeve-buttons"] = value.value
        } else if (option.id === "jacket-vent-style") {
          customizations.ventStyle = value.value
          customizations.vent_style = value.value
          customizations["jacket-vent-style"] = value.value
        } else if (option.id === "button-style") {
          customizations.buttonstyle = value.value
          customizations.buttonStyle = value.value // Camel case version
        } else if (option.id === "front-pocket") {
          console.log("🎒 Setting front pocket:", value.value)
          customizations.frontPocket = value.value
          customizations.front_pocket = value.value
          customizations["front-pocket"] = value.value
          // Force update timestamp to trigger re-render
          customizations.pocketUpdateTime = Date.now()
        } else if (option.id === "chest-pocket") {
          console.log("👔 Setting chest pocket:", value.value)
          customizations.chestPocket = value.value
          customizations.chest_pocket = value.value
          customizations["chest-pocket"] = value.value
          // Force update timestamp to trigger re-render
          customizations.pocketUpdateTime = Date.now()
        } else if (option.id === "jacket-sleeve-buttons") {
          console.log("🔘 Setting sleeve buttons:", value.value)
          customizations.sleeveButtons = value.value
          customizations.sleeve_buttons = value.value
          customizations["jacket-sleeve-buttons"] = value.value
          // Force update timestamp to trigger re-render
          customizations.sleeveUpdateTime = Date.now()
        } else if (option.id === "jacket-vent-style") {
          console.log("🎽 Setting vent style:", value.value)
          customizations.ventStyle = value.value
          customizations.vent_style = value.value
          customizations["jacket-vent-style"] = value.value
          // Force update timestamp to trigger re-render
          customizations.ventUpdateTime = Date.now()
        }

        // Handle pants-specific customizations
        if (option.id === "front-style") {
          console.log("👖 Setting pants front style:", value.value)
          customizations.frontStyle = value.value
          customizations.front_style = value.value
          customizations["front-style"] = value.value
        } else if (option.id === "front-pocket") {
          console.log("🎒 Setting pants front pocket:", value.value)
          customizations.frontPocket = value.value
          customizations.front_pocket = value.value
          customizations["front-pocket"] = value.value
        } else if (option.id === "back-pocket") {
          console.log("🎒 Setting pants back pocket:", value.value)
          customizations.backPocket = value.value
          customizations.back_pocket = value.value
          customizations["back-pocket"] = value.value
        } else if (option.id === "bottom-cuffs") {
          console.log("👖 Setting pants bottom cuffs:", value.value)
          customizations.bottomCuffs = value.value
          customizations.bottom_cuffs = value.value
          customizations["bottom-cuffs"] = value.value
        } else if (option.id === "waist-band-extension") {
          console.log("👖 Setting pants waistband extension:", value.value)
          customizations.waistbandExtension = value.value
          customizations.waistband_extension = value.value
          customizations["waist-band-extension"] = value.value
        }

        // Handle ALL other style customizations by mapping option names to customization keys
        const optionNameLower = option.name.toLowerCase().replace(/\s+/g, "")
        const optionId = option.id.toLowerCase()

        if (optionNameLower.includes("collar") && !optionNameLower.includes("color")) {
          customizations.collarstyle = value.value
          customizations.collar = value.value
        } else if (optionNameLower.includes("cuff") && !optionNameLower.includes("color")) {
          customizations.cuffstyle = value.value
          customizations.cuff = value.value
        } else if (optionNameLower.includes("fit")) {
          customizations.fitstyle = value.value
          customizations.fit = value.value
        } else if (optionNameLower.includes("monogram") && !optionNameLower.includes("color")) {
          customizations.monogram = value.value
        } else if (optionNameLower.includes("waistband")) {
          customizations.waistbandstyle = value.value
          customizations.waistband = value.value
        } else if (optionNameLower.includes("hem")) {
          customizations.hemstyle = value.value
          customizations.hem = value.value
        } else if (optionNameLower.includes("belt")) {
          customizations.beltloops = value.value
          customizations.belt = value.value
        } else if (optionNameLower.includes("lapel")) {
          customizations.lapelstyle = value.value
          customizations.lapel = value.value
        } else if (optionNameLower.includes("vent")) {
          customizations.ventstyle = value.value
          customizations.vent = value.value
        } else if (optionNameLower.includes("lining")) {
          customizations.liningstyle = value.value
          customizations.lining = value.value
        } else if (optionNameLower.includes("sleeve") && optionNameLower.includes("button")) {
          customizations.sleevebuttonstyle = value.value
          customizations.sleevebutton = value.value
        }

        // Enhanced button handling for ALL button-related configurations
        if (optionNameLower.includes("button") && !optionNameLower.includes("color")) {
          // Map different button option types with comprehensive coverage
          if (optionId.includes("configuration") || optionNameLower.includes("configuration")) {
            customizations.buttonConfiguration = value.value
            customizations.buttonconfig = value.value
            customizations.buttons = value.value // For generic button display
            console.log(`Setting button configuration: €{value.value}`)
          } else if (optionId.includes("style") || optionNameLower.includes("style")) {
            customizations.buttonstyle = value.value
            customizations.buttonStyle = value.value
            customizations.buttons = value.value // For style changes
            console.log(`Setting button style: €{value.value}`)
          } else if (optionId.includes("count") || optionNameLower.includes("count")) {
            customizations.buttonCount = value.value
            customizations.buttoncount = value.value
            customizations.buttons = value.value // For count changes
            console.log(`Setting button count: €{value.value}`)
          } else if (optionId.includes("material") || optionNameLower.includes("material")) {
            customizations.buttonMaterial = value.value
            customizations.buttonmaterial = value.value
            customizations.buttons = value.value // For material changes
            console.log(`Setting button material: €{value.value}`)
          } else if (optionId.includes("size") || optionNameLower.includes("size")) {
            customizations.buttonSize = value.value
            customizations.buttonsize = value.value
            customizations.buttons = value.value // For size changes
            console.log(`Setting button size: €{value.value}`)
          } else if (optionId.includes("type") || optionNameLower.includes("type")) {
            customizations.buttonType = value.value
            customizations.buttontype = value.value
            customizations.buttons = value.value // For type changes
            console.log(`Setting button type: €{value.value}`)
          } else {
            // Generic button setting - catch all button configurations
            customizations.button = value.value
            customizations.buttons = value.value
            customizations.buttonConfiguration = value.value // Default to configuration
            console.log(`Setting generic button customization: €{value.value}`)
          }

          // Ensure button customizations are always applied to the 3D model
          customizations.updateButtons = true
          customizations.buttonConfigUpdate = Date.now() // Force update
        }

        // Enhanced pocket handling
        if (optionNameLower.includes("pocket") && !optionNameLower.includes("color")) {
          if (optionId.includes("style") || optionNameLower.includes("style")) {
            customizations.pocketstyle = value.value
            customizations.pocketStyle = value.value
          } else if (optionId.includes("type") || optionNameLower.includes("type")) {
            customizations.pocketType = value.value
            customizations.pockettype = value.value
          } else {
            customizations.pocket = value.value
            customizations.pockets = value.value
          }
          console.log(`Setting pocket customization: €{optionId} = €{value.value}`)
        }

        // Generic value assignment for any unhandled options
        if (!customizations[optionId] && value.value) {
          customizations[optionId] = value.value
          customizations[optionNameLower] = value.value
          console.log(`Setting generic customization: €{optionId} = €{value.value}`)
        }
      }
    })

    // Add monogram customizations with proper thread color handling
    if (monogramData.text && monogramData.position !== "no-monogram") {
      customizations.monogramText = monogramData.text
      customizations.monogramPosition = monogramData.position

      // Use monogram thread color from monogramData (selected in MonogramConfigurator)
      const threadColor = monogramData.color || getMonogramColorValue(monogramData.color) || "#1565C0"

      customizations.monogramColor = threadColor
      customizations.monogramThreadColor = threadColor
      customizations.monogramStyle = monogramData.style || "classic-serif"
      customizations.monogramData = JSON.stringify({
        ...monogramData,
        threadColor: threadColor
      })

      // Ensure monogram is visible
      customizations.showMonogram = true
      customizations.monogramVisible = true

      console.log("Setting monogram:", {
        text: monogramData.text,
        position: monogramData.position,
        threadColor: threadColor,
        style: monogramData.style
      })
    } else {
      // Hide monogram if no text or position is "no-monogram"
      customizations.showMonogram = false
      customizations.monogramVisible = false
    }

    // CRITICAL: Force thread color to ALWAYS match fabric color
    // This ensures button thread never changes when button color changes
    if (customizations.fabricColor) {
      customizations.threadColor = customizations.fabricColor
      console.log("🧵 FORCED threadColor to match fabricColor:", customizations.fabricColor)
    }

    // Add lining color and mesh type from liningSelectionData
    console.log("🔍 liningSelectionData state:", liningSelectionData)
    // Always pass lining data so the 3D model knows the lining state
    if (liningSelectionData.liningType === 'unlined') {
      customizations.liningColor = ""
      customizations.liningMeshType = 'unlined'
    } else if (liningSelectionData.liningType === 'standard') {
      customizations.liningColor = ""
      customizations.liningMeshType = 'standard'
    } else if (liningSelectionData.liningColor || liningSelectionData.liningMeshType) {
      customizations.liningColor = liningSelectionData.liningColor
      customizations.liningMeshType = liningSelectionData.liningMeshType || liningSelectionData.customType
    } else {
      // Default to standard if nothing is set
      customizations.liningMeshType = 'standard'
    }
    console.log("🎨 Lining customization:", {
      liningColor: customizations.liningColor,
      liningMeshType: customizations.liningMeshType,
      liningType: liningSelectionData.liningType
    })

    console.log("Generated customizations for 3D model:", customizations)
    console.log("🔍 Front style in customizations:", {
      frontStyle: customizations.frontStyle,
      front_style: customizations.front_style,
      jacketFrontStyle: customizations["jacket-front-style"]
    })
    return customizations
  }
  // Helper function to get monogram color value
  const getMonogramColorValue = (colorId: string) => {
    const colorMap: Record<string, string> = {
      "navy": "#1565C0",
      "black": "#000000",
      "white": "#FFFFFF",
      "gold": "#FFD700",
      "silver": "#C0C0C0",
      "burgundy": "#8E24AA",
      "forest": "#2E7D32",
      "royal-blue": "#4169E1",
    }
    return colorMap[colorId] || "#1565C0"
  }

  // Generate layer controls for 3D model
  const generateLayerControls = () => {
    const layerControls: Record<string, string[]> = {}

    Object.values(configuratorState).forEach((selection) => {
      const option = customizationOptions.find((opt) => opt.id === selection.optionId)
      const value = option?.values.find((val) => val.id === selection.valueId)

      if (value?.layerControls) {
        if (value.layerControls.show) {
          layerControls.show = [...(layerControls.show || []), ...value.layerControls.show]
        }
        if (value.layerControls.hide) {
          layerControls.hide = [...(layerControls.hide || []), ...value.layerControls.hide]
        }
      }
    })

    return layerControls
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "fabric":
        return <Palette className="w-4 h-4" />
      case "style":
        return <Shirt className="w-4 h-4" />
      case "fit":
        return <Scissors className="w-4 h-4" />
      case "personalization":
        return <Star className="w-4 h-4" />
      case "interior":
        return <Package className="w-4 h-4" />
      case "details":
        return <Heart className="w-4 h-4" />
      case "measurements":
        return <Ruler className="w-4 h-4" />
      default:
        return <Shirt className="w-4 h-4" />
    }
  }

  // Generate order summary for checkout
  // Clean raw image paths into readable names
  // e.g. "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg" → "XHS23L6001 7"
  const cleanCustomizationValue = (value: string): string => {
    if (!value) return value
    if (value.startsWith("/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(value)) {
      const filename = value.split("/").pop() || value
      return filename
        .replace(/\.(jpg|jpeg|png|webp|gif)$/i, "")
        .replace(/-reduced$/i, "")
        .replace(/[-_]/g, " ")
        .trim()
    }
    return value
  }

  const generateOrderSummary = () => {
    const customizations = Object.values(configuratorState).map((selection) => {
      const option = customizationOptions.find((opt) => opt.id === selection.optionId)
      return {
        category: option?.name || "Unknown",
        value: cleanCustomizationValue(selection.value),
        price: selection.price || 0,
      }
    })

    // Collect confirmed measurement details for the order
    const confirmedMeasurements = savedMeasurementProfile?.measurements || getCurrentMeasurementsRecord()

    return {
      productName,
      basePrice: basePrice || 0,
      customizations,
      measurementData,
      totalPrice: calculatePrice(),
      customerEmail: customerEmail || undefined,
      shopifyCustomerId: shopifyCustomer?.id || undefined,
      customerName: shopifyCustomer?.name || undefined,
      confirmedMeasurements: Object.keys(confirmedMeasurements).length > 0 ? confirmedMeasurements : undefined,
    }
  }

  const handleAddToCart = async () => {
    // If on the confirm step and email is set, save the measurement profile first
    if (isMeasurementConfirmStep && customerEmail) {
      const measurements = savedMeasurementProfile?.measurements || getCurrentMeasurementsRecord()
      await handleMeasurementsConfirmed(measurements, customerEmail)
      return // handleMeasurementsConfirmed already opens checkout
    }
    setShowCheckoutModal(true)
  }

  // Fabric helper functions
  const getFabricDescription = (fabricId: string): string => {
    const descriptions: { [key: string]: string } = {
      "wool-blend": "Refined for business, Comfortable for everyday wear",
      "premium-wool": "Refined for business, Comfortable for everyday wear",
      "washable-wool": "Refined for business or when thoughtfully matched with jeans or chinos for a smarter look"
    }
    return descriptions[fabricId] || "Premium fabric option"
  }

  const getFabricWeight = (fabricId: string): string => {
    const weights: { [key: string]: string } = {
      "wool-blend": "Medium",
      "premium-wool": "Medium to light",
      "washable-wool": "Light"
    }
    return weights[fabricId] || "Medium weight"
  }

  const getFabricSeason = (fabricId: string): string => {
    const seasons: { [key: string]: string } = {
      "wool-blend": "Year round",
      "premium-wool": "Year round",
      "washable-wool": "Year round"
    }
    return seasons[fabricId] || "All seasons"
  }

  const getFabricAvailableColors = (fabricId: string): string[] => {
    // All 20 fabric textures from public/fabrics folder
    const textureOptions = ["texture-1", "texture-2", "texture-3", "texture-4", "texture-5", "texture-6", "texture-7", "texture-8", "texture-9", "texture-10", "texture-11", "texture-12", "texture-13", "texture-14", "texture-15", "texture-16", "texture-17", "texture-18", "texture-19", "texture-20"]

    const fabricColors: { [key: string]: string[] } = {
      // 78% Terylene, 18% Rayon, 4% Spandex - Performance Fabric (15 colors)
      "wool-blend": ["texture-1", "texture-2", "texture-3", "texture-4", "texture-5", "texture-6", "texture-7", "texture-8", "texture-9", "texture-10", "texture-11", "texture-12", "texture-13", "texture-14", "texture-15"],
      // 97% Merino Wool, 3% Lycra - Superfine Merino with Lycra (2 colors)
      "premium-wool": ["texture-16", "texture-17"],
      // 70% Merino Wool, 30% Polyester - Superfine Merino Washable (3 colors)
      "washable-wool": ["texture-18", "texture-19", "texture-20"]
    }
    return fabricColors[fabricId] || textureOptions
  }

  const getFabricPerformanceFeatures = (fabricId: string): string[] => {
    const features: { [key: string]: string[] } = {
      "wool-blend": ["Breathable", "Wrinkle Resistant", "Fast Drying", "Moisture Wicking", "4-Way Stretch", "Mechanical Stretch", "Machine washable"],
      "premium-wool": ["Breathable", "Wrinkle Resistant", "Fast Drying", "Moisture Wicking", "4-Way Stretch"],
      "washable-wool": ["Breathable", "Wrinkle Resistant", "Fast Drying", "Moisture Wicking", "Mechanical Stretch", "Machine washable"]
    }
    return features[fabricId] || []
  }

  const getFabricTechnicalSpecs = (fabricId: string) => {
    const specs: { [key: string]: any } = {
      "wool-blend": {
        tone: "15 colors available",
        pattern: "Solid",
        weave: "Twill",
        category: "Performance",
        seasonality: "Year round",
        weight: "350 Gram",
        composition: "65% Polyester, 35% Viscose",
        shine: "Matte",
        opacity: "Very Opaque",
        stretch: "Mechanical Stretch",
        careInstructions: "Machine washable, Hang dry",
        suggestedOccasion: "Business, Smart casual, Travel, Active",
        breathable: true,
        wrinkleResistant: true,
        moistureWicking: true,
        fastDrying: true,
        fourWayStretch: true,
        mechanicalStretch: true,
        machineWashable: true,
        waterRepellent: false,
        odorResistant: false,
        uvProtection: false
      },
      "premium-wool": {
        tone: "2 colors available",
        pattern: "Solid",
        weave: "Twill",
        category: "Natural with Lycra",
        seasonality: "Year round",
        weight: "Light to medium",
        composition: "97% Merino Wool, 3% Lycra",
        shine: "Matte",
        opacity: "High opacity",
        stretch: "4-way stretch",
        careInstructions: "Machine wash cold, hang dry",
        suggestedOccasion: "A blend of business and smart casual with a refined touch",
        breathable: true,
        wrinkleResistant: true,
        fastDrying: true,
        moistureWicking: true,
        fourWayStretch: true,
        mechanicalStretch: false,
        waterRepellent: false,
        odorResistant: false,
        uvProtection: false
      },
      "washable-wool": {
        tone: "3 colors available",
        pattern: "Solid",
        weave: "Twill",
        category: "Natural with performance features",
        seasonality: "Year round",
        weight: "Light",
        composition: "70% Merino Wool, 30% Polyester",
        shine: "Matte",
        opacity: "High opacity",
        stretch: "Mechanical Stretch",
        careInstructions: "Machine wash cold, hang dry",
        suggestedOccasion: "A blend of business and smart casual with a refined touch. Designed for everyday wear, thanks to its washable fabric",
        breathable: true,
        wrinkleResistant: true,
        fastDrying: true,
        moistureWicking: true,
        fourWayStretch: false,
        mechanicalStretch: true,
        machineWashable: true,
        waterRepellent: false,
        odorResistant: false,
        uvProtection: false
      }
    }
    return specs[fabricId] || {}
  }

  const getFilteredColors = () => {
    const selectedFabricType = configuratorState["fabric-type"]?.valueId

    // If no fabric type selected, show all colors
    if (!selectedFabricType) {
      return currentStepData?.values.map(v => ({
        id: v.id,
        name: v.name,
        hex: v.color || v.value,
        fabrics: []
      })) || []
    }

    // If fabric type is selected, filter colors
    const availableColorIds = getFabricAvailableColors(selectedFabricType)
    return currentStepData?.values
      .filter(v => availableColorIds.includes(v.id))
      .map(v => ({
        id: v.id,
        name: v.name,
        hex: v.color || v.value,
        fabrics: [selectedFabricType]
      })) || []
  }

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customization options...</p>
          <p className="text-sm text-gray-500 mt-2">Product: {productName}</p>
        </div>
      </div>
    )
  }

  if (error || customizationOptions.length === 0) {
    return (
      <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Customization Not Available</h2>
          <p className="text-gray-600 mb-4">{error || "No customization options are configured for this product."}</p>
          <p className="text-sm text-gray-500 mb-4">Product ID: {productId}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  const currentPrice = calculatePrice()

  return (
    <>
      <div className="w-full h-screen bg-gray-50 flex relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* LEFT SIDEBAR - Fully Responsive */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed lg:relative lg:translate-x-0
          w-full sm:w-[400px] md:w-[450px] lg:w-[380px] xl:w-[420px] 2xl:w-[480px]
          h-full bg-white border-r border-gray-200 
          flex flex-col transition-transform duration-300 ease-in-out z-50
          shadow-xl lg:shadow-none
        `}>
          {/* Mobile Close Button */}
          <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-100">
            <h1 className="text-lg font-semibold text-gray-900 truncate">Customize {productName}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Sidebar Header - Fully Responsive */}
          <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="hidden lg:block text-lg xl:text-xl font-semibold text-gray-900 truncate">{productName}</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {Object.keys(configuratorState).length} customization{Object.keys(configuratorState).length !== 1 ? 's' : ''} applied
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-bold text-gray-900">
                  €{currentPrice.toFixed(2)}
                </div>
                <Badge variant="outline" className="text-xs mt-1 whitespace-nowrap">
                  Step {currentStep + 1} of {totalSteps}
                </Badge>
              </div>
            </div>
          </div>

          {/* Current Step Header - Fully Responsive */}
          <div className="px-4 sm:px-5 lg:px-6 py-3 sm:py-4 bg-gray-50 border-b">
            <div className="flex items-center gap-2 sm:gap-3">
              {isMeasurementConfirmStep ? (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-green-600" />
              ) : isMeasurementStep ? (
                <Ruler className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-blue-600" />
              ) : isFitPreferenceStep ? (
                <Shirt className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-green-600" />
              ) : (
                getCategoryIcon(currentStepData?.category || "")
              )}
              <h2 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg truncate flex-1">
                {isMeasurementConfirmStep
                  ? "Review & Confirm"
                  : isMeasurementStep
                    ? "Measurements"
                    : isFitPreferenceStep
                      ? "Fit Preference"
                      : isLiningSelectionStep
                        ? "Jacket Lining"
                        : isJacketLiningStep
                          ? "Lining & Monogram"
                          : isMonogramStep || isEmbroideredMonogramStep
                            ? "Embroidered Monogram"
                            : isFabricTypeStep
                              ? <>{currentStepData?.name} <span className="font-normal text-gray-400">&#8212; Fabric - next colors</span></>
                              : currentStepData?.name || "Customize"}
              </h2>
              {!isMeasurementConfirmStep && !isMeasurementStep && !isFitPreferenceStep && !isLiningSelectionStep && !isJacketLiningStep && !isMonogramStep && !isEmbroideredMonogramStep && currentStepData && currentStepData.values && (
                <Badge variant="secondary" className="text-xs flex-shrink-0 hidden sm:inline-flex">
                  {(() => { const count = isFabricColorStep ? getFilteredColors().length : currentStepData.values.length; return `${count} option${count !== 1 ? 's' : ''}`; })()}
                </Badge>
              )}
            </div>
          </div>

          {/* Sidebar Content - Fully Responsive with Better Spacing */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {isFitPreferenceStep ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shirt className="w-4 h-4 text-green-600" />
                        <h3 className="font-medium text-black">Choose Your Fit Preference</h3>
                      </div>
                      <p className="text-sm text-black">
                        Choose your preferred fit to ensure optimal comfort. Please answer all 4 questions to continue.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {[
                        {
                          id: "slim",
                          name: "Slim",
                          description: "Closer to body, tailored fit with minimal ease"
                        },
                        {
                          id: "regular",
                          name: "Regular",
                          description: "Classic comfortable fit with standard ease"
                        },
                        {
                          id: "comfort",
                          name: "Comfort",
                          description: "Relaxed fit with extra room for movement"
                        }
                      ].map((fit) => (
                        <div
                          key={fit.id}
                          onClick={() => setMeasurementData(prev => ({ ...prev, fitPreference: fit.id as "slim" | "regular" | "comfort" }))}
                          className={`
                            group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
                            ${measurementData.fitPreference === fit.id
                              ? "border-green-500 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 shadow-lg ring-2 ring-green-200/50 scale-[1.02]"
                              : "border-gray-200 hover:border-green-300 hover:shadow-lg bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-white"
                            }
                          `}
                        >
                          <div className="flex flex-col items-center gap-3 text-center">
                            <div className="flex items-center gap-3 w-full">
                              <div className={`w-4 h-4 rounded-full border-2 ${measurementData.fitPreference === fit.id
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300'
                                }`}>
                                {measurementData.fitPreference === fit.id && (
                                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                )}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-semibold text-base text-gray-900 mb-1">
                                  {fit.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {fit.description}
                                </div>
                              </div>
                            </div>
                          </div>
                          {measurementData.fitPreference === fit.id && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                              <Check className="w-3 h-3 text-white font-bold" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Body Shape Selection */}
                    {measurementData.fitPreference && (
                      <div className="space-y-6 mt-8">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Ruler className="w-4 h-4 text-blue-600" />
                            <h3 className="font-medium text-blue-800">Body Shape Profile</h3>
                          </div>
                          <p className="text-sm text-blue-700">
                            Help us understand your body shape for the most accurate fit.
                          </p>
                        </div>

                        {/* Shoulder Type */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Shoulder Type</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { id: "normal", name: "Normal", description: "Balanced shoulder width", image: "/images/jacket-configuration/fit-style/shoulder/normal.png" },
                              { id: "square", name: "Square", description: "Broad, straight shoulders", image: "/images/jacket-configuration/fit-style/shoulder/square.png" },
                              { id: "sloping", name: "Sloping", description: "Naturally sloped shoulders", image: "/images/jacket-configuration/fit-style/shoulder/sloping.png" }
                            ].map((shoulder) => (
                              <div
                                key={shoulder.id}
                                onClick={() => setMeasurementData(prev => ({ ...prev, shoulderType: shoulder.id }))}
                                className={`
                                  p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm
                                  €{measurementData.shoulderType === shoulder.id
                                    ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                                    : "border-gray-200 hover:border-gray-300"
                                  }
                                `}
                              >
                                <div className="flex flex-col items-center gap-3">
                                  <div className="w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                                    <img src={shoulder.image} alt={shoulder.name} className="w-28 h-28 object-contain" />
                                  </div>
                                  <div className="text-center">
                                    <h5 className="font-medium text-gray-900">{shoulder.name}</h5>
                                    <p className="text-xs text-gray-600">{shoulder.description}</p>
                                  </div>
                                  {measurementData.shoulderType === shoulder.id && (
                                    <Check className="w-5 h-5 text-blue-500" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Back Shape */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Back Shape</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { id: "ideal", name: "Ideal", description: "Straight, well-aligned posture", image: "/images/jacket-configuration/fit-style/back/ideal.png" },
                              { id: "flat", name: "Flat", description: "Less curved lower back", image: "/images/jacket-configuration/fit-style/back/flat.png" },
                              { id: "sway", name: "Sway", description: "Pronounced lower back curve", image: "/images/jacket-configuration/fit-style/back/sway.png" },
                              { id: "rounded", name: "Rounded", description: "Forward shoulder posture", image: "/images/jacket-configuration/fit-style/back/rounded.png" }
                            ].map((back) => (
                              <div
                                key={back.id}
                                onClick={() => setMeasurementData(prev => ({ ...prev, backShape: back.id }))}
                                className={`
                                  p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm
                                  €{measurementData.backShape === back.id
                                    ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                                    : "border-gray-200 hover:border-gray-300"
                                  }
                                `}
                              >
                                <div className="flex flex-col items-center gap-3">
                                  <div className="w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                                    <img src={back.image} alt={back.name} className="w-28 h-28 object-contain" />
                                  </div>
                                  <div className="text-center">
                                    <h5 className="font-medium text-gray-900">{back.name}</h5>
                                    <p className="text-xs text-gray-600">{back.description}</p>
                                  </div>
                                  {measurementData.backShape === back.id && (
                                    <Check className="w-5 h-5 text-blue-500" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Belly Type */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Belly Type</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { id: "slim", name: "Slim", description: "Lean midsection", image: "/images/jacket-configuration/fit-style/belly/slim.png" },
                              { id: "normal", name: "Normal", description: "Average midsection", image: "/images/jacket-configuration/fit-style/belly/normal.png" },
                              { id: "large", name: "Large", description: "Fuller midsection", image: "/images/jacket-configuration/fit-style/belly/large.png" }
                            ].map((belly) => (
                              <div
                                key={belly.id}
                                onClick={() => setMeasurementData(prev => ({ ...prev, bellyType: belly.id }))}
                                className={`
                                  p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm
                                  €{measurementData.bellyType === belly.id
                                    ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                                    : "border-gray-200 hover:border-gray-300"
                                  }
                                `}
                              >
                                <div className="flex flex-col items-center gap-3">
                                  <div className="w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                                    <img src={belly.image} alt={belly.name} className="w-28 h-28 object-contain" />
                                  </div>
                                  <div className="text-center">
                                    <h5 className="font-medium text-gray-900">{belly.name}</h5>
                                    <p className="text-xs text-gray-600">{belly.description}</p>
                                  </div>
                                  {measurementData.bellyType === belly.id && (
                                    <Check className="w-5 h-5 text-blue-500" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : isMeasurementStep ? (
                  <MeasurementStep
                    sizeType={measurementData.sizeType === "standard" ? "standard" : undefined}
                    standardSize={measurementData.standardSize || "m"}
                    fitType={measurementData.fitType || "regular"}
                    customMeasurements={
                      measurementData.customMeasurements || {
                        neck: 0,
                        chest: 0,
                        stomach: 0,
                        hip: 0,
                        length: 0,
                        shoulder: 0,
                        sleeve: 0,
                      }
                    }
                    garmentType={productType as "pants" | "jacket" | "shirt" | "suit" | "blazer"}
                    onUpdate={updateMeasurementData}
                    customerEmail={customerEmail}
                    onEmailChange={setCustomerEmail}
                    onEmailLookup={handleEmailLookup}
                    isLookingUp={isProfileLoading}
                    savedProfile={savedMeasurementProfile}
                    onUseSavedMeasurements={handleUseSavedFromMeasurementStep}
                  />
                ) : isMeasurementConfirmStep ? (
                  <MeasurementConfirmStep
                    garmentType={productType as "pants" | "jacket" | "shirt" | "suit" | "blazer"}
                    savedProfile={savedMeasurementProfile}
                    currentMeasurements={getCurrentMeasurementsRecord()}
                    customerEmail={customerEmail}
                    onCustomerEmailChange={setCustomerEmail}
                    onConfirm={handleMeasurementsConfirmed}
                    onEditMeasurements={handleGoToMeasurementStep}
                    onNewMeasurements={handleGoToMeasurementStep}
                    isLoading={isProfileLoading}
                    onLookup={handleEmailLookup}
                    shopifyCustomer={shopifyCustomer}
                    autoDetected={customerAutoDetected}
                  />
                ) : isLiningSelectionStep ? (
                  <LiningSelectionStep
                    selectedLiningType={liningSelectionData.liningType}
                    selectedCustomType={liningSelectionData.customType}
                    selectedLiningFabric={liningSelectionData.liningFabric}
                    onUpdate={updateLiningSelectionData}
                  />
                ) : isJacketLiningStep ? (
                  <JacketLiningStep
                    liningType={jacketLiningData.liningType}
                    standardLiningColor={jacketLiningData.standardLiningColor}
                    customLiningColor={jacketLiningData.customLiningColor}
                    monogramEnabled={jacketLiningData.monogramEnabled}
                    monogramType={jacketLiningData.monogramType === "none" ? "initials" : jacketLiningData.monogramType}
                    monogramText={jacketLiningData.monogramText}
                    monogramFont={jacketLiningData.monogramFont}
                    threadColor={jacketLiningData.threadColor}
                    onUpdate={updateJacketLiningData}
                  />
                ) : isMonogramStep || isEmbroideredMonogramStep ? (
                  <EmbroideredMonogramStep
                    monogramEnabled={monogramData.monogramEnabled}
                    monogramType={monogramData.monogramType}
                    monogramText={monogramData.text}
                    monogramFont={monogramData.monogramFont}
                    threadColor={monogramData.threadColor}
                    onUpdate={(updates) => {
                      updateMonogramData(updates)
                    }}
                  />
                ) : isFabricTypeStep ? (
                  <FabricTypeSelector
                    selectedFabricType={configuratorState["fabric-type"]?.valueId}
                    onFabricSelect={(fabricId, price) => {
                      selectOption(
                        "fabric-type",
                        fabricId,
                        price,
                        fabricId
                      )
                    }}
                    fabrics={currentStepData.values.map(value => ({
                      id: value.id,
                      name: value.name,
                      price: value.price,
                      image: value.thumbnail || "/placeholder.svg?height=60&width=60&text=" + value.name.charAt(0),
                      description: getFabricDescription(value.id),
                      weight: getFabricWeight(value.id),
                      season: getFabricSeason(value.id),
                      availableColors: getFabricAvailableColors(value.id),
                      performanceFeatures: getFabricPerformanceFeatures(value.id),
                      technicalSpecs: getFabricTechnicalSpecs(value.id)
                    }))}
                  />
                ) : isFabricColorStep ? (
                  // Show responsive color grid for fabric colors
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Select Fabric Color</h3>
                      {configuratorState["fabric-type"] && (
                        <button
                          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                          className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Change Fabric</span>
                          <span className="sm:hidden">Change</span>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                      {getFilteredColors().map((color) => {
                        // Check if this is a texture (starts with / or contains image extension)
                        const isTexture = color.hex.startsWith('/') || /\.(jpg|jpeg|png|webp)$/i.test(color.hex)

                        return (
                          <div
                            key={color.id}
                            onClick={() => {
                              selectOption(
                                "fabric-color",
                                color.id,
                                0,
                                color.hex,
                                color.hex
                              )
                            }}
                            className={`
                              relative p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-md
                              ${configuratorState["fabric-color"]?.valueId === color.id
                                ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                              }
                            `}
                          >
                            <div className="text-center">
                              <div
                                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg mx-auto mb-2 border border-gray-300 shadow-sm overflow-hidden"
                                style={isTexture
                                  ? {
                                    backgroundImage: `url(${color.hex})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                  }
                                  : { backgroundColor: color.hex }
                                }
                              />
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate leading-tight">
                                {color.name}
                              </div>
                            </div>
                            {configuratorState["fabric-color"]?.valueId === color.id && (
                              <div className="absolute -top-1 -right-1">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {getFilteredColors().length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">Please select a fabric type first to see available colors.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  currentStepData && (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Color Options - Fully Responsive Grid Layout */}
                      {currentStepData.type === "color" && (
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                            Choose {currentStepData.name}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                            {currentStepData.values.map((value) => (
                              <div
                                key={value.id}
                                onClick={() =>
                                  selectOption(
                                    currentStepData.id,
                                    value.id,
                                    value.price,
                                    value.value,
                                    value.color || value.value,
                                    value.layerControls,
                                  )
                                }
                                className={`
                                  relative p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-md
                                  €{
                                    configuratorState[currentStepData.id]?.valueId === value.id
                                      ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  }
                                `}
                              >
                                <div className="text-center">
                                  <div
                                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg mx-auto mb-2 border border-gray-300 shadow-sm"
                                    style={{ backgroundColor: value.color || value.value }}
                                  />
                                  <div className="text-xs sm:text-sm font-medium text-gray-900 leading-tight break-words">
                                    {value.name}
                                  </div>
                                  {value.price > 0 && (
                                    <div className="text-xs text-green-600 font-semibold mt-1">+€{value.price}</div>
                                  )}
                                </div>
                                {/* Green checkmark for selected option */}
                                {configuratorState[currentStepData.id]?.valueId === value.id && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Non-Color Options - Fully Responsive List Layout */}
                      {(currentStepData.type === "texture" || currentStepData.type === "component") && (
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                            Choose {currentStepData.name}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                            {currentStepData.values.map((value) => (
                              <div
                                key={value.id}
                                data-option-id={currentStepData.id}
                                data-value-id={value.id}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  console.log(`🔘 COMPONENT BUTTON CLICKED! ID: ${currentStepData.id}, Value: ${value.value}, Name: ${value.name}`)
                                  selectOption(
                                    currentStepData.id,
                                    value.id,
                                    value.price,
                                    value.value,
                                    value.color,
                                    value.layerControls,
                                  )
                                }}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                className={`
                                  group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] 
                                  ${configuratorState[currentStepData.id]?.valueId === value.id
                                    ? "border-blue-500 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg ring-2 ring-blue-200/50 scale-[1.02]"
                                    : "border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-white"
                                  }
                                `}
                              >
                                <div className="flex flex-col items-center gap-3">
                                  {value.thumbnail ? (
                                    <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                      <img
                                        src={value.thumbnail}
                                        alt={value.name}
                                        className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border-2 border-white shadow-lg group-hover:shadow-xl transition-all duration-300"
                                      />
                                      <div className="absolute inset-0 rounded-xl ring-1 ring-white/30 group-hover:ring-blue-300/50 transition-all duration-300"></div>
                                    </div>
                                  ) : value.color ? (
                                    <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                      <div
                                        className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-white shadow-lg flex-shrink-0 ring-1 ring-white/30 group-hover:ring-blue-300/50 transition-all duration-300"
                                        style={{ backgroundColor: value.color }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white flex items-center justify-center flex-shrink-0 shadow-lg ring-1 ring-white/30 group-hover:ring-blue-300/50 transition-all duration-300">
                                        <span className="text-lg md:text-xl font-bold bg-gradient-to-br from-gray-600 to-gray-800 bg-clip-text text-transparent">
                                          {value.name.charAt(0)}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex flex-col items-center text-center w-full space-y-1">
                                    <div className="font-semibold text-sm md:text-base bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                                      {value.name}
                                    </div>
                                    {value.price !== 0 && (
                                      <div className={`font-bold text-sm md:text-base px-2 py-1 rounded-lg €{value.price > 0 ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200'} shadow-sm`}>
                                        {value.price > 0 ? '+' : ''}€{Math.abs(value.price)}
                                      </div>
                                    )}
                                  </div>
                                  {configuratorState[currentStepData.id]?.valueId === value.id && (
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                                      <Check className="w-3 h-3 text-white font-bold" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar Footer - Fully Responsive */}
          <div className="p-4 sm:p-5 lg:p-6 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                size="sm"
                className="flex-1 h-10 sm:h-11 text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < totalSteps - 1 ? (
                <>
                  <Button
                    onClick={nextStep}
                    size="sm"
                    disabled={isFitPreferenceStep && (!measurementData.fitPreference || !measurementData.shoulderType || !measurementData.backShape || !measurementData.bellyType)}
                    className="bg-blue-600 hover:bg-blue-700 flex-1 h-10 sm:h-11 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  {/* Only show Add to Cart on the final step */}
                  <Button
                    className="bg-green-600 hover:bg-green-700 flex-1 h-10 sm:h-11 text-sm font-medium"
                    size="sm"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button - Enhanced */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(true)}
          className={`
            fixed top-4 left-4 z-40 lg:hidden bg-white/95 backdrop-blur-sm shadow-lg border-gray-300
            h-10 w-10 p-0 transition-all duration-200
            €{isSidebarOpen ? 'hidden' : 'flex'}
          `}
        >
          <Menu className="w-4 h-4" />
        </Button>

        {/* RIGHT AREA - 3D MODEL + CONTROLS - Fully Responsive */}
        <div className={`
          flex-1 relative h-screen bg-gradient-to-br from-gray-100 to-gray-200 transition-all duration-300
          €{isSidebarOpen ? 'lg:ml-0' : ''}
        `}>
          {/* Top Controls - hint text moved here and buttons removed */}
          <div className="absolute top-3 sm:top-4 lg:top-6 left-1/2 transform -translate-x-1/2 z-10 px-2 sm:px-4">
            <div className="bg-white/95 backdrop-blur-sm px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm text-gray-600 shadow-lg border border-gray-300 text-center max-w-sm sm:max-w-md">
              <span className="hidden sm:inline">Drag to rotate • Scroll to zoom • Double-click to reset view</span>
              <span className="sm:hidden">Tap &amp; drag • Pinch to zoom</span>
            </div>
          </div>

          {/* 3D Model Viewer - FULL HEIGHT with better styling */}
          <div className="absolute inset-0 w-full h-full rounded-lg lg:rounded-none overflow-hidden">
            <ModelViewer
              key={`model-${configuratorState["jacket-front-style"]?.valueId || 'default'}-${configuratorState["front-pocket"]?.valueId || 'no-pocket'}-${configuratorState["chest-pocket"]?.valueId || 'no-chest'}-${configuratorState["jacket-sleeve-buttons"]?.valueId || 'default-sleeve'}-${configuratorState["jacket-vent-style"]?.valueId || 'default-vent'}`}
              modelUrl={getModelUrl()}
              useGLTF={productType === "jacket" || productType === "pants"}
              gltfModelPath={productType === "jacket" ? "/models/jackets/basic-jacket.gltf" : productType === "pants" ? "/models/pants/Style/Flat/Normal.gltf" : undefined}
              customizations={generateCustomizations()}
              layerControls={generateLayerControls()}
              cameraRotationY={cameraRotationY}
              cameraTargetY={cameraTargetY}
            />
          </div>

          {/* Monogram Preview Box - Small box next to sidebar */}
          {isEmbroideredMonogramStep && monogramData.text && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 ml-2 lg:ml-4">
              <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-500 p-4 w-80 lg:w-96">
                <div className="text-center mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">Monogram Preview</h4>
                </div>
                <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src="/images/threadmonogram.png"
                    alt="Jacket with monogram position"
                    className="w-full h-full object-contain"
                  />
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      color: THREAD_COLORS.find(c => c.id === monogramData.threadColor)?.color || "#1e3a8a",
                      fontFamily: monogramData.monogramFont === 'england'
                        ? "'EdwardianScriptITC', 'Brush Script MT', 'Lucida Handwriting', cursive"
                        : "Arial, sans-serif",
                      fontWeight: monogramData.monogramFont === 'england' ? 'bold' : '600',
                      fontStyle: monogramData.monogramFont === 'england' ? 'italic' : 'normal',
                      fontSize: monogramData.text.length <= 2 ? '2.5rem' : monogramData.text.length > 10 ? '1.2rem' : '1.8rem',
                      left: '50%',
                      top: '52%',
                      transform: 'translate(-50%, -100%)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {monogramData.text}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 text-center">
                  <div>{THREAD_COLORS.find(c => c.id === monogramData.threadColor)?.name || "Navy Blue"} Thread</div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Instructions - removed (moved to top) */}

          {/* Mobile Price Indicator */}
          <div className="absolute top-3 left-3 lg:hidden z-10">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg text-sm shadow-lg border border-gray-300">
              <div className="font-bold text-gray-900">€{currentPrice.toFixed(2)}</div>
            </div>
          </div>

          {/* Responsive Corner Indicators */}
          <div className="absolute bottom-3 right-3 lg:hidden z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="bg-white/95 backdrop-blur-sm h-10 w-10 p-0 shadow-lg border-gray-300"
            >
              <Package className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        orderSummary={generateOrderSummary()}
        onEditConfiguration={handleEditConfiguration}
      />
    </>
  )
}
