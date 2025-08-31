"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, ShoppingCart, Maximize2, RotateCcw, Check, Ruler } from "lucide-react"
import { ModelViewer } from "@/components/3d-model-viewer"
import { motion, AnimatePresence } from "framer-motion"
import { MeasurementModal } from "./enhanced-measurement-modal"
import { FabricTypeSelector } from "./fabric-type-selector"
import { FabricColorSelector } from "./fabric-color-selector"

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
  // Jacket specific
  lapelStyle?: string
  ventStyle?: string
  pocketStyle?: string
  liningColor?: string
  shoulderPadding?: string
  threadColor?: string
  pocketDetails?: string
  // Pants specific
  waistStyle?: string
  legStyle?: string
  cuffType?: string
  pleats?: string
  rise?: string
  collarOutsideColor?: string
  collarInsideColor?: string
  cuffOutsideColor?: string
  cuffInsideColor?: string
  placketInsideColor?: string
  placketOutsideColor?: string
}

// JACKET CUSTOMIZATION STEPS
const JACKET_STEPS = [
  {
    id: 1,
    title: "Select Fabric Type",
    key: "fabric-type",
    options: [
      {
        id: "wool-blend",
        name: "Wool Blend",
        price: 0,
        image: "/placeholder.svg?height=60&width=60&text=Wool",
        description: "Classic business fabric - Perfect for year-round wear",
        weight: "Medium weight",
        season: "All seasons",
        availableColors: ["charcoal", "navy", "black", "brown", "gray"]
      },
      {
        id: "premium-wool",
        name: "Premium Wool",
        price: 50,
        image: "/placeholder.svg?height=60&width=60&text=Premium",
        description: "Luxury Italian wool - Superior drape and comfort",
        weight: "Medium-heavy weight",
        season: "Fall/Winter",
        availableColors: ["charcoal", "navy", "black", "brown"]
      },
      {
        id: "cashmere-blend",
        name: "Cashmere Blend",
        price: 120,
        image: "/placeholder.svg?height=60&width=60&text=Cashmere",
        description: "Ultra-soft cashmere blend - Ultimate luxury",
        weight: "Light-medium weight",
        season: "Fall/Winter/Spring",
        availableColors: ["charcoal", "navy", "brown", "camel"]
      },
      {
        id: "summer-wool",
        name: "Summer Wool",
        price: 30,
        image: "/placeholder.svg?height=60&width=60&text=Summer",
        description: "Lightweight tropical wool - Breathable and cool",
        weight: "Lightweight",
        season: "Spring/Summer",
        availableColors: ["light-gray", "navy", "charcoal", "beige"]
      },
      {
        id: "tweed",
        name: "Tweed",
        price: 80,
        image: "/placeholder.svg?height=60&width=60&text=Tweed",
        description: "Traditional tweed - Textured and durable",
        weight: "Heavy weight",
        season: "Fall/Winter",
        availableColors: ["brown", "green", "gray", "charcoal"]
      },
      {
        id: "linen-blend",
        name: "Linen Blend",
        price: 40,
        image: "/placeholder.svg?height=60&width=60&text=Linen",
        description: "Linen-wool blend - Natural and breathable",
        weight: "Lightweight",
        season: "Spring/Summer",
        availableColors: ["beige", "light-blue", "white", "light-gray"]
      },
    ],
  },
  {
    id: 2,
    title: "Select Fabric Color",
    key: "fabric-color",
    colors: [
      { id: "charcoal", name: "Charcoal", hex: "#36454F", fabrics: ["wool-blend", "premium-wool", "cashmere-blend", "summer-wool", "tweed"] },
      { id: "navy", name: "Navy", hex: "#000080", fabrics: ["wool-blend", "premium-wool", "cashmere-blend", "summer-wool"] },
      { id: "black", name: "Black", hex: "#000000", fabrics: ["wool-blend", "premium-wool"] },
      { id: "brown", name: "Brown", hex: "#8B4513", fabrics: ["wool-blend", "premium-wool", "cashmere-blend", "tweed"] },
      { id: "gray", name: "Gray", hex: "#808080", fabrics: ["wool-blend", "tweed"] },
      { id: "light-gray", name: "Light Gray", hex: "#D3D3D3", fabrics: ["summer-wool", "linen-blend"] },
      { id: "green", name: "Forest Green", hex: "#228B22", fabrics: ["tweed"] },
      { id: "beige", name: "Beige", hex: "#F5F5DC", fabrics: ["summer-wool", "linen-blend"] },
      { id: "camel", name: "Camel", hex: "#C19A6B", fabrics: ["cashmere-blend"] },
      { id: "light-blue", name: "Light Blue", hex: "#ADD8E6", fabrics: ["linen-blend"] },
      { id: "white", name: "White", hex: "#FFFFFF", fabrics: ["linen-blend"] },
    ],
  },
  {
    id: 3,
    title: "Jacket Style",
    key: "style",
    lapels: [
      {
        id: "notched",
        name: "Notched Lapel",
        price: 0,
        image: "/placeholder.svg?height=80&width=60&text=Notched",
        description: "Classic business style",
      },
      {
        id: "peaked",
        name: "Peaked Lapel",
        price: 25,
        image: "/placeholder.svg?height=80&width=60&text=Peaked",
        description: "Formal evening style",
      },
      {
        id: "shawl",
        name: "Shawl Lapel",
        price: 35,
        image: "/placeholder.svg?height=80&width=60&text=Shawl",
        description: "Tuxedo style",
      },
    ],
    vents: [
      {
        id: "single-vent",
        name: "Single Vent",
        price: 0,
        image: "/placeholder.svg?height=60&width=60&text=Single",
        description: "Traditional back vent",
      },
      {
        id: "double-vent",
        name: "Double Vent",
        price: 15,
        image: "/placeholder.svg?height=60&width=60&text=Double",
        description: "Modern side vents",
      },
      {
        id: "no-vent",
        name: "No Vent",
        price: 0,
        image: "/placeholder.svg?height=60&width=60&text=None",
        description: "Clean back design",
      },
    ],
    pockets: [
      {
        id: "flap-pockets",
        name: "Flap Pockets",
        price: 0,
        image: "/placeholder.svg?height=60&width=60&text=Flap",
        description: "Classic with flaps",
      },
      {
        id: "jetted-pockets",
        name: "Jetted Pockets",
        price: 20,
        image: "/placeholder.svg?height=60&width=60&text=Jetted",
        description: "Sleek formal style",
      },
      {
        id: "patch-pockets",
        name: "Patch Pockets",
        price: 10,
        image: "/placeholder.svg?height=60&width=60&text=Patch",
        description: "Casual style",
      },
    ],
  },
  {
    id: 4,
    title: "Lining & Details",
    key: "details",
    linings: [
      { id: "standard-black", name: "Standard Black", hex: "#000000", price: 0 },
      { id: "navy-silk", name: "Navy Silk", hex: "#000080", price: 30 },
      { id: "burgundy", name: "Burgundy", hex: "#800020", price: 25 },
      { id: "forest-green", name: "Forest Green", hex: "#228B22", price: 25 },
      { id: "gold", name: "Gold", hex: "#FFD700", price: 35 },
    ],
    shoulderPadding: [
      { id: "minimal", name: "Minimal", price: 0, description: "Natural shoulder" },
      { id: "light", name: "Light", price: 10, description: "Slight structure" },
      { id: "medium", name: "Medium", price: 15, description: "Classic structure" },
      { id: "full", name: "Full", price: 20, description: "Strong shoulder" },
    ],
  },
  {
    id: 5,
    title: "Buttons & Monogram",
    key: "finishing",
    buttons: [
      {
        id: "horn-dark",
        name: "Dark Horn",
        price: 0,
        image: "/placeholder.svg?height=40&width=40&text=Horn",
        description: "Classic dark horn",
      },
      {
        id: "mother-of-pearl",
        name: "Mother of Pearl",
        price: 25,
        image: "/placeholder.svg?height=40&width=40&text=Pearl",
        description: "Elegant white pearl",
      },
      {
        id: "metal-gold",
        name: "Gold Metal",
        price: 40,
        image: "/placeholder.svg?height=40&width=40&text=Gold",
        description: "Luxury gold buttons",
      },
      {
        id: "metal-silver",
        name: "Silver Metal",
        price: 35,
        image: "/placeholder.svg?height=40&width=40&text=Silver",
        description: "Modern silver buttons",
      },
    ],
    monogramPositions: [
      { id: "inside-pocket", name: "Inside Pocket", price: 25 },
      { id: "sleeve", name: "Sleeve", price: 25 },
      { id: "none", name: "No Monogram", price: 0 },
    ],
  },
  {
    id: 6,
    title: "Size & Fit",
    key: "sizing",
    fits: [
      { id: "classic", name: "Classic Fit", price: 0, description: "Traditional relaxed fit" },
      { id: "modern", name: "Modern Fit", price: 15, description: "Contemporary tailored" },
      { id: "slim", name: "Slim Fit", price: 20, description: "Close-fitting modern" },
    ],
    sizes: [
      { id: "36r", name: "36R", price: 0, measurements: 'Chest: 91cm, Regular length' },
      { id: "38r", name: "38R", price: 0, measurements: 'Chest: 97cm, Regular length' },
      { id: "40r", name: "40R", price: 0, measurements: 'Chest: 102cm, Regular length' },
      { id: "42r", name: "42R", price: 0, measurements: 'Chest: 107cm, Regular length' },
      { id: "44r", name: "44R", price: 5, measurements: 'Chest: 112cm, Regular length' },
      { id: "custom", name: "Custom", price: 50, measurements: "Professional measurements required" },
    ],
  },
]

// PANTS CUSTOMIZATION STEPS
const PANTS_STEPS = [
  {
    id: 1,
    title: "Select Fabric",
    key: "fabric",
    options: [
      {
        id: "wool-trouser",
        name: "Wool Trouser",
        price: 0,
        color: "#2C2C2C",
        image: "/placeholder.svg?height=60&width=60&text=Wool",
        description: "Classic dress pants",
      },
      {
        id: "cotton-chino",
        name: "Cotton Chino",
        price: -20,
        color: "#D2B48C",
        image: "/placeholder.svg?height=60&width=60&text=Cotton",
        description: "Casual everyday wear",
      },
      {
        id: "linen-summer",
        name: "Linen Summer",
        price: 15,
        color: "#F5F5DC",
        image: "/placeholder.svg?height=60&width=60&text=Linen",
        description: "Breathable summer fabric",
      },
    ],
    colors: [
      { id: "charcoal", name: "Charcoal", hex: "#36454F" },
      { id: "navy", name: "Navy", hex: "#000080" },
      { id: "khaki", name: "Khaki", hex: "#C3B091" },
      { id: "olive", name: "Olive", hex: "#808000" },
      { id: "black", name: "Black", hex: "#000000" },
    ],
  },
  {
    id: 2,
    title: "Pants Style",
    key: "style",
    waistStyles: [
      {
        id: "flat-front",
        name: "Flat Front",
        price: 0,
        image: "/placeholder.svg?height=60&width=60&text=Flat",
        description: "Modern clean look",
      },
      {
        id: "single-pleat",
        name: "Single Pleat",
        price: 10,
        image: "/placeholder.svg?height=60&width=60&text=Single",
        description: "Classic with one pleat",
      },
      {
        id: "double-pleat",
        name: "Double Pleat",
        price: 15,
        image: "/placeholder.svg?height=60&width=60&text=Double",
        description: "Traditional with two pleats",
      },
    ],
    legStyles: [
      {
        id: "straight",
        name: "Straight Leg",
        price: 0,
        image: "/placeholder.svg?height=80&width=40&text=Straight",
        description: "Classic straight cut",
      },
      {
        id: "tapered",
        name: "Tapered",
        price: 10,
        image: "/placeholder.svg?height=80&width=40&text=Tapered",
        description: "Narrower at ankle",
      },
      {
        id: "slim",
        name: "Slim Fit",
        price: 15,
        image: "/placeholder.svg?height=80&width=40&text=Slim",
        description: "Close-fitting modern",
      },
    ],
    rise: [
      { id: "low", name: "Low Rise", price: 0, description: "Sits below waist" },
      { id: "mid", name: "Mid Rise", price: 0, description: "Classic waist position" },
      { id: "high", name: "High Rise", price: 10, description: "Above waist, vintage style" },
    ],
  },
  {
    id: 3,
    title: "Cuffs & Details",
    key: "details",
    cuffs: [
      { id: "no-cuff", name: "No Cuff", price: 0, description: "Clean hem finish" },
      { id: "cuffed", name: "Cuffed", price: 15, description: "Traditional folded cuff" },
    ],
    pockets: [
      { id: "side-pockets", name: "Side Pockets", price: 0 },
      { id: "back-pockets", name: "Back Pockets", price: 10 },
      { id: "watch-pocket", name: "Watch Pocket", price: 15 },
    ],
  },
  {
    id: 4,
    title: "Waistband & Closure",
    key: "waistband",
    closures: [
      { id: "button-fly", name: "Button Fly", price: 0 },
      { id: "zip-fly", name: "Zip Fly", price: 0 },
    ],
    waistband: [
      { id: "standard", name: "Standard", price: 0 },
      { id: "extended-tab", name: "Extended Tab", price: 10 },
      { id: "side-adjusters", name: "Side Adjusters", price: 20 },
    ],
  },
  {
    id: 5,
    title: "Size & Fit",
    key: "sizing",
    sizes: [
      { id: "30", name: "30", price: 0, measurements: 'Waist: 76cm' },
      { id: "32", name: "32", price: 0, measurements: 'Waist: 81cm' },
      { id: "34", name: "34", price: 0, measurements: 'Waist: 86cm' },
      { id: "36", name: "36", price: 0, measurements: 'Waist: 91cm' },
      { id: "38", name: "38", price: 0, measurements: 'Waist: 97cm' },
      { id: "custom", name: "Custom", price: 30, measurements: "Professional measurements required" },
    ],
    inseam: [
      { id: "30", name: '76cm', price: 0 },
      { id: "32", name: '81cm', price: 0 },
      { id: "34", name: '86cm', price: 0 },
      { id: "36", name: '91cm', price: 5 },
    ],
  },
]

// SHIRT CUSTOMIZATION STEPS (existing)
const SHIRT_STEPS = [
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
        image: "/placeholder.svg?height=60&width=60&text=Cotton",
        description: "Classic everyday fabric",
      },
      {
        id: "premium-cotton",
        name: "Premium Cotton",
        price: 15,
        color: "#F8F8FF",
        image: "/placeholder.svg?height=60&width=60&text=Premium",
        description: "Luxury cotton blend",
      },
      {
        id: "linen-blend",
        name: "Linen Blend",
        price: 25,
        color: "#FAF0E6",
        image: "/placeholder.svg?height=60&width=60&text=Linen",
        description: "Breathable summer fabric",
      },
      {
        id: "silk-blend",
        name: "Silk Blend",
        price: 45,
        color: "#FFF8DC",
        image: "/placeholder.svg?height=60&width=60&text=Silk",
        description: "Premium silk finish",
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
        image: "/placeholder.svg?height=80&width=60&text=Classic",
        description: "Traditional relaxed fit",
      },
      {
        id: "slim-fit",
        name: "Slim Fit",
        price: 5,
        image: "/placeholder.svg?height=80&width=60&text=Slim",
        description: "Modern tailored fit",
      },
      {
        id: "tailored-fit",
        name: "Tailored Fit",
        price: 10,
        image: "/placeholder.svg?height=80&width=60&text=Tailored",
        description: "Custom fitted silhouette",
      },
    ],
    sleeves: [
      {
        id: "regular-sleeve",
        name: "Regular Sleeve",
        price: 0,
        image: "/placeholder.svg?height=60&width=60&text=Regular",
      },
      {
        id: "french-cuff",
        name: "French Cuff",
        price: 10,
        image: "/placeholder.svg?height=60&width=60&text=French",
      },
      {
        id: "rolled-sleeve",
        name: "Rolled Sleeve",
        price: 5,
        image: "/placeholder.svg?height=60&width=60&text=Rolled",
      },
    ],
    collars: [
      {
        id: "spread",
        name: "Spread Collar",
        price: 0,
        image: "/placeholder.svg?height=60&width=60&text=Spread",
      },
      {
        id: "button-down",
        name: "Button Down",
        price: 0,
        image: "/placeholder.svg?height=60&width=60&text=Button",
      },
      {
        id: "cutaway",
        name: "Cutaway",
        price: 8,
        image: "/placeholder.svg?height=60&width=60&text=Cutaway",
      },
      {
        id: "band",
        name: "Band Collar",
        price: 5,
        image: "/placeholder.svg?height=60&width=60&text=Band",
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
        name: "Standard",
        price: 0,
        image: "/placeholder.svg?height=40&width=40&text=Std",
      },
      {
        id: "mother-of-pearl",
        name: "Mother of Pearl",
        price: 12,
        image: "/placeholder.svg?height=40&width=40&text=Pearl",
      },
      {
        id: "horn",
        name: "Horn",
        price: 15,
        image: "/placeholder.svg?height=40&width=40&text=Horn",
      },
      {
        id: "metal",
        name: "Metal",
        price: 20,
        image: "/placeholder.svg?height=40&width=40&text=Metal",
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
      { id: "xs", name: "XS", price: 0, measurements: 'Chest: 86-91cm' },
      { id: "s", name: "S", price: 0, measurements: 'Chest: 91-97cm' },
      { id: "m", name: "M", price: 0, measurements: 'Chest: 97-102cm' },
      { id: "l", name: "L", price: 0, measurements: 'Chest: 102-107cm' },
      { id: "xl", name: "XL", price: 0, measurements: 'Chest: 107-112cm' },
      { id: "xxl", name: "XXL", price: 5, measurements: 'Chest: 112-117cm' },
      { id: "custom", name: "Custom", price: 25, measurements: "Professional measurements required" },
    ],
  },
]

interface WireframeConfiguratorProps {
  productId: string
  productName: string
  basePrice: number
  productType?: "shirt" | "pants" | "jacket" | "dress"
}

export function WireframeConfigurator({
  productId,
  productName,
  basePrice,
  productType = "shirt",
}: WireframeConfiguratorProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false)
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
    collarOutsideColor: undefined,
    collarInsideColor: undefined,
    cuffOutsideColor: undefined,
    cuffInsideColor: undefined,
    placketInsideColor: undefined,
    placketOutsideColor: undefined,
    // Jacket specific
    lapelStyle: undefined,
    ventStyle: undefined,
    pocketStyle: undefined,
    liningColor: undefined,
    shoulderPadding: undefined,
    // Pants specific
    waistStyle: undefined,
    legStyle: undefined,
    cuffType: undefined,
    pleats: undefined,
    rise: undefined,
  })

  // Get the appropriate steps based on product type
  const getStepsForProduct = () => {
    switch (productType) {
      case "jacket":
        return JACKET_STEPS
      case "pants":
        return PANTS_STEPS
      case "shirt":
      default:
        return SHIRT_STEPS
    }
  }

  const CUSTOMIZATION_STEPS = getStepsForProduct()
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
        case "finishing":
          return configuratorState.buttonStyle
        case "sizing":
          return configuratorState.size
        default:
          return false
      }
    }).length

    return Math.round((completedSteps / totalSteps) * 100)
  }

  // Calculate total price based on product type
  const calculatePrice = () => {
    let total = basePrice

    // Add fabric price
    const fabricOption = currentStepData?.options?.find((opt) => opt.id === configuratorState.fabricType)
    if (fabricOption) total += fabricOption.price

    // Add style prices based on product type
    if (productType === "jacket") {
      const lapelOption = JACKET_STEPS[1]?.lapels?.find((opt) => opt.id === configuratorState.lapelStyle)
      if (lapelOption) total += lapelOption.price

      const ventOption = JACKET_STEPS[1]?.vents?.find((opt) => opt.id === configuratorState.ventStyle)
      if (ventOption) total += ventOption.price

      const pocketOption = JACKET_STEPS[1]?.pockets?.find((opt) => opt.id === configuratorState.pocketStyle)
      if (pocketOption) total += pocketOption.price

      const liningOption = JACKET_STEPS[2]?.linings?.find((opt) => opt.id === configuratorState.liningColor)
      if (liningOption) total += liningOption.price

      const shoulderOption = JACKET_STEPS[2]?.shoulderPadding?.find(
        (opt) => opt.id === configuratorState.shoulderPadding,
      )
      if (shoulderOption) total += shoulderOption.price
    }

    // Add button price
    const buttonOption = (currentStepData as any)?.buttons?.find((opt: any) => opt.id === configuratorState.buttonStyle)
    if (buttonOption) total += buttonOption.price

    // Add monogram price
    const monogramOption = (currentStepData as any)?.monogramPositions?.find(
      (opt: any) => opt.id === configuratorState.monogramPosition,
    )
    if (monogramOption) total += monogramOption.price

    // Add size price
    const sizeOption = currentStepData?.sizes?.find((opt) => opt.id === configuratorState.size)
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
    console.log("Updating state:", updates)
    setConfiguratorState((prev) => {
      const newState = { ...prev, ...updates }
      console.log("New state:", newState)
      return newState
    })
  }

  const selectOption = (category: string, optionId: string, price: number, value?: any) => {
    console.log(`Selected €{category}: €{optionId} (€{price})`)
    // This function can be used for analytics or additional processing
    // The actual state update should be done through updateState
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

  const isStepCompleted = (stepKey: string) => {
    switch (stepKey) {
      case "fabric":
        return configuratorState.fabricType && configuratorState.fabricColor
      case "style":
        return configuratorState.sleeveStyle && configuratorState.collarStyle
      case "contrast":
        return true // Optional step
      case "details":
      case "finishing":
        return configuratorState.buttonStyle
      case "sizing":
        return configuratorState.size
      default:
        return false
    }
  }

  const renderStepContent = () => {
    if (productType === "jacket") {
      return renderJacketStepContent()
    } else if (productType === "pants") {
      return renderPantsStepContent()
    } else {
      return renderShirtStepContent()
    }
  }

  // Generic measurement step component that works for all product types
  const renderMeasurementStep = () => {
    return (
      <div className="space-y-6">
        {/* Size Selection - Button to open modal */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-900">Size & Measurements</h3>
          <Button
            onClick={() => setIsMeasurementModalOpen(true)}
            variant="outline"
            className="w-full h-auto p-4 justify-start"
          >
            <div className="flex items-center gap-3">
              <Ruler className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-sm">
                  {configuratorState.size ? 
                    `Size: €{currentStepData?.sizes?.find(s => s.id === configuratorState.size)?.name}` :
                    "Select Size & Measurements"
                  }
                </div>
                <div className="text-xs text-gray-600">
                  {configuratorState.size ? 
                    currentStepData?.sizes?.find(s => s.id === configuratorState.size)?.measurements :
                    "Choose standard sizes or provide custom measurements"
                  }
                </div>
              </div>
            </div>
          </Button>
        </div>

        {/* Quantity */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-900">Quantity</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateState({ quantity: Math.max(1, configuratorState.quantity - 1) })}
              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              -
            </button>
            <span className="text-lg font-semibold w-8 text-center">{configuratorState.quantity}</span>
            <button
              onClick={() => updateState({ quantity: configuratorState.quantity + 1 })}
              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderJacketStepContent = () => {
    switch (currentStep) {
      case 1:
        // Fabric Type Selection
        return (
          <FabricTypeSelector
            selectedFabricType={configuratorState.fabricType}
            onFabricSelect={(fabricId, price) => {
              updateState({ fabricType: fabricId })
              selectOption("fabric-type", fabricId, price, fabricId)
            }}
            fabrics={currentStepData?.options?.map(opt => ({
              id: opt.id,
              name: opt.name,
              price: opt.price,
              image: opt.image,
              description: opt.description,
              weight: (opt as any).weight || "Medium",
              season: (opt as any).season || "All seasons",
              availableColors: (opt as any).availableColors || []
            })) || []}
          />
        )
      
      case 2:
        // Fabric Color Selection (filtered by fabric type)
        return (
          <FabricColorSelector
            selectedFabricType={configuratorState.fabricType}
            selectedColor={configuratorState.fabricColor}
            onColorSelect={(colorId, price) => {
              const colorData = currentStepData?.colors?.find(c => c.id === colorId)
              if (colorData) {
                updateState({ fabricColor: colorData.hex })
                selectOption("fabric-color", colorId, price || 0, colorData.hex)
              }
            }}
            onBack={() => setCurrentStep(1)}
            availableColors={currentStepData?.colors?.map(color => ({
              id: color.id,
              name: color.name,
              hex: color.hex,
              fabrics: (color as any).fabrics || []
            })) || []}
          />
        )

      case 3:
        // Jacket Style (lapels, vents, pockets)
        return (
          <div className="space-y-6">
            {/* Lapel Style */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Lapel Style</h3>
              <div className="space-y-2">
                {(currentStepData as any)?.lapels?.map((lapel: any) => (
                  <div
                    key={lapel.id}
                    onClick={() => updateState({ lapelStyle: lapel.id })}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all
                      €{
                        configuratorState.lapelStyle === lapel.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={lapel.image || "/placeholder.svg"}
                        alt={lapel.name}
                        className="w-10 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{lapel.name}</div>
                        <div className="text-xs text-gray-600">{lapel.description}</div>
                        {lapel.price > 0 && <div className="text-green-600 font-semibold text-sm">+€{lapel.price}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vent Style */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Vent Style</h3>
              <div className="grid grid-cols-1 gap-2">
                {(currentStepData as any)?.vents?.map((vent: any) => (
                  <div
                    key={vent.id}
                    onClick={() => updateState({ ventStyle: vent.id })}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all
                      €{
                        configuratorState.ventStyle === vent.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={vent.image || "/placeholder.svg"}
                        alt={vent.name}
                        className="w-12 h-8 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{vent.name}</div>
                        <div className="text-xs text-gray-600">{vent.description}</div>
                        {vent.price > 0 && <div className="text-green-600 font-semibold text-sm">+€{vent.price}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pocket Style */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Pocket Style</h3>
              <div className="grid grid-cols-1 gap-2">
                {(currentStepData as any)?.pockets?.map((pocket: any) => (
                  <div
                    key={pocket.id}
                    onClick={() => updateState({ pocketStyle: pocket.id })}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all
                      €{
                        configuratorState.pocketStyle === pocket.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={pocket.image || "/placeholder.svg"}
                        alt={pocket.name}
                        className="w-12 h-8 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{pocket.name}</div>
                        <div className="text-xs text-gray-600">{pocket.description}</div>
                        {pocket.price > 0 && (
                          <div className="text-green-600 font-semibold text-sm">+€{pocket.price}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        // Monogram
        return (
          <div className="space-y-6">
            {/* Monogram Position */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Monogram Position</h3>
              <div className="space-y-2">
                {(currentStepData as any)?.positions?.map((position: any) => (
                  <div
                    key={position.id}
                    onClick={() => updateState({ monogramPosition: position.id })}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all
                      €{
                        configuratorState.monogramPosition === position.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={position.image || "/placeholder.svg"}
                        alt={position.name}
                        className="w-10 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{position.name}</div>
                        <div className="text-xs text-gray-600">{position.description}</div>
                        {position.price > 0 && <div className="text-green-600 font-semibold text-sm">+€{position.price}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monogram Text */}
            {configuratorState.monogramPosition && configuratorState.monogramPosition !== "none" && (
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Monogram Text</h3>
                <input
                  type="text"
                  placeholder="Enter initials (ABC)"
                  value={configuratorState.monogramText}
                  onChange={(e) => updateState({ monogramText: e.target.value.slice(0, 3).toUpperCase() })}
                  className="w-full p-2 border rounded-lg mb-3 text-center font-mono"
                  maxLength={3}
                />
              </div>
            )}

            {/* Thread Color */}
            {configuratorState.monogramPosition && configuratorState.monogramPosition !== "none" && (
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Thread Color</h3>
                <div className="grid grid-cols-5 gap-2">
                  {(currentStepData as any)?.threadColors?.map((color: any) => (
                    <div
                      key={color.id}
                      onClick={() => updateState({ threadColor: color.id })}
                      className={`
                        aspect-square rounded-lg border-2 cursor-pointer transition-all relative overflow-hidden
                        €{
                          configuratorState.threadColor === color.id
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }
                      `}
                    >
                      <img
                        src={color.image || `/placeholder.svg?height=60&width=60&text=€{color.name}`}
                        alt={color.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                        {color.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 5:
        // Lining
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Lining Color</h3>
              <div className="space-y-2">
                {currentStepData?.colors?.map((lining) => (
                  <div
                    key={lining.id}
                    onClick={() => updateState({ liningColor: lining.id })}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all
                      €{
                        configuratorState.liningColor === lining.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: lining.hex }} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{lining.name}</div>
                        {(lining as any).price > 0 && (
                          <div className="text-green-600 font-semibold text-sm">+€{(lining as any).price}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 6:
        // Details (pockets)
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Pocket Details</h3>
              <div className="space-y-2">
                {(currentStepData as any)?.pockets?.map((pocket: any) => (
                  <div
                    key={pocket.id}
                    onClick={() => updateState({ pocketDetails: pocket.id })}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all
                      €{
                        configuratorState.pocketDetails === pocket.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={pocket.image || "/placeholder.svg"}
                        alt={pocket.name}
                        className="w-12 h-8 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{pocket.name}</div>
                        <div className="text-xs text-gray-600">{pocket.description}</div>
                        {pocket.price > 0 && (
                          <div className="text-green-600 font-semibold text-sm">+€{pocket.price}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 6:
        // Final Review/Summary Step
        return (
          <div className="space-y-6">
            {/* Size Selection - Button to open modal */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Size & Measurements</h3>
              <Button
                onClick={() => setIsMeasurementModalOpen(true)}
                variant="outline"
                className="w-full h-auto p-4 justify-start"
              >
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-sm">
                      {configuratorState.size ? 
                        `Size: €{currentStepData?.sizes?.find(s => s.id === configuratorState.size)?.name}` :
                        "Select Size & Measurements"
                      }
                    </div>
                    <div className="text-xs text-gray-600">
                      {configuratorState.size ? 
                        currentStepData?.sizes?.find(s => s.id === configuratorState.size)?.measurements :
                        "Choose standard sizes or provide custom measurements"
                      }
                    </div>
                  </div>
                </div>
              </Button>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateState({ quantity: Math.max(1, configuratorState.quantity - 1) })}
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-lg font-semibold w-8 text-center">{configuratorState.quantity}</span>
                <button
                  onClick={() => updateState({ quantity: configuratorState.quantity + 1 })}
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderPantsStepContent = () => {
    switch (currentStep) {
      case 5:
        return renderMeasurementStep()
      default:
        return <div>Pants customization content for step {currentStep}</div>
    }
  }

  const renderShirtStepContent = () => {
    switch (currentStep) {
      case 5:
        return renderMeasurementStep()
      default:
        return <div>Shirt customization content for step {currentStep}</div>
    }
  }

  return (
    <div className="w-full h-screen bg-gray-50 flex">
      {/* LEFT SIDEBAR - FIXED */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{currentStepData?.title}</h1>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-sm">
              Step {currentStep} of {totalSteps}
            </Badge>
            <div className="text-lg font-bold text-gray-900">€{calculatePrice()}</div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{calculateCompletion()}%</span>
            </div>
            <Progress value={calculateCompletion()} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex gap-2">
            {CUSTOMIZATION_STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all
                  €{
                    currentStep === step.id
                      ? "border-blue-500 bg-blue-500 text-white"
                      : isStepCompleted(step.key)
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 text-gray-500 hover:border-gray-400"
                  }
                `}
              >
                {isStepCompleted(step.key) && currentStep !== step.id ? <Check className="w-4 h-4" /> : step.id}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={nextStep} size="sm">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700" size="sm">
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT AREA - 3D MODEL + CONTROLS */}
      <div className="flex-1 relative h-screen">
        {/* Top Controls */}
        <div className="absolute top-0 right-0 z-10 p-6 flex items-center gap-2">
          <div className="text-2xl font-bold text-gray-900">€{calculatePrice()}</div>
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

        {/* 3D Model Viewer - FULL HEIGHT */}
        <div className="absolute inset-0 w-full h-full">
          <ModelViewer
            modelUrl={getModelUrl()}
            customizations={{
              color: configuratorState.fabricColor,
              fabricColor: configuratorState.fabricColor,
              fabricType: configuratorState.fabricType,
              sleeveStyle: configuratorState.sleeveStyle,
              collarStyle: configuratorState.collarStyle,
              buttonStyle: configuratorState.buttonStyle,
              buttonColor: configuratorState.buttonColor,
              // Jacket specific
              lapelStyle: configuratorState.lapelStyle,
              ventStyle: configuratorState.ventStyle,
              pocketStyle: configuratorState.pocketStyle,
              liningColor: configuratorState.liningColor,
              shoulderPadding: configuratorState.shoulderPadding,
              // Pants specific
              waistStyle: configuratorState.waistStyle,
              legStyle: configuratorState.legStyle,
              cuffType: configuratorState.cuffType,
            }}
            layerControls={{}}
          />
        </div>

        {/* Bottom Instructions */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-600 shadow-lg">
            Drag to rotate • Scroll to zoom • Double-click to reset view
          </div>
        </div>
      </div>

      {/* Measurement Modal */}
      <MeasurementModal
        isOpen={isMeasurementModalOpen}
        onClose={() => setIsMeasurementModalOpen(false)}
        title="Size & Measurements"
        sizes={currentStepData?.sizes || []}
        selectedSize={configuratorState.size}
        onSizeSelect={(sizeId) => updateState({ size: sizeId })}
        onConfirm={() => setIsMeasurementModalOpen(false)}
      />
    </div>
  )
}
