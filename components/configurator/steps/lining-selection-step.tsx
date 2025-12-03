"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Info,
  Check,
  Sparkles,
  X,
  ChevronRight
} from "lucide-react"

interface LiningSelectionStepProps {
  selectedLiningType: "standard" | "custom" | "none"
  selectedCustomType?: "custom-coloured" | "unlined" | "quilted"
  selectedLiningFabric?: string
  onUpdate: (updates: { 
    liningType?: string
    customType?: string
    liningFabric?: string
    liningColor?: string 
  }) => void
}

// Lining Fabrics - All fabrics from LiningFabrics folder
// These will be applied as textures to the fully lined layer
const LINING_FABRICS = [
  { id: "lining-bm001-2", name: "BM001-2", image: "/fabrics/LiningFabrics/BM001-2.jpg" },
  { id: "lining-bm001-10", name: "BM001-10", image: "/fabrics/LiningFabrics/BM001-10.jpg" },
  { id: "lining-bm002-6", name: "BM002-6", image: "/fabrics/LiningFabrics/BM002-6.jpg" },
  { id: "lining-bm003-6", name: "BM003-6", image: "/fabrics/LiningFabrics/BM003-6.jpg" },
  { id: "lining-bm003-11", name: "BM003-11", image: "/fabrics/LiningFabrics/BM003-11.jpg" },
  { id: "lining-bm005-14", name: "BM005-14", image: "/fabrics/LiningFabrics/BM005-14.jpg" },
  { id: "lining-bm005-16", name: "BM005-16", image: "/fabrics/LiningFabrics/BM005-16.jpg" },
  { id: "lining-bm005-18", name: "BM005-18", image: "/fabrics/LiningFabrics/BM005-18.jpg" },
  { id: "lining-bm005-22", name: "BM005-22", image: "/fabrics/LiningFabrics/BM005-22.jpg" },
  { id: "lining-bm005-26", name: "BM005-26", image: "/fabrics/LiningFabrics/BM005-26.jpg" },
  { id: "lining-bm005-38", name: "BM005-38", image: "/fabrics/LiningFabrics/BM005-38.jpg" },
  { id: "lining-bm005-39", name: "BM005-39", image: "/fabrics/LiningFabrics/BM005-39.jpg" },
  { id: "lining-ln1119", name: "LN-1119", image: "/fabrics/LiningFabrics/LN-1119.jpg" },
  { id: "lining-ln1120", name: "LN1120", image: "/fabrics/LiningFabrics/LN1120.jpg" },
  { id: "lining-ln1122", name: "LN1122", image: "/fabrics/LiningFabrics/LN1122.jpg" },
  { id: "lining-ln1127", name: "LN1127", image: "/fabrics/LiningFabrics/LN1127.jpg" },
  { id: "lining-ln1128", name: "LN1128", image: "/fabrics/LiningFabrics/LN1128.jpg" },
  { id: "lining-ln1131", name: "LN1131", image: "/fabrics/LiningFabrics/LN1131.jpg" },
  { id: "lining-ln1133", name: "LN1133", image: "/fabrics/LiningFabrics/LN1133.jpg" },
  { id: "lining-ln1134", name: "LN1134", image: "/fabrics/LiningFabrics/LN1134.jpg" },
  { id: "lining-ln1136", name: "LN1136", image: "/fabrics/LiningFabrics/LN1136.jpg" },
  { id: "lining-ln1137", name: "LN1137", image: "/fabrics/LiningFabrics/LN1137.jpg" },
  { id: "lining-ln1140", name: "LN1140", image: "/fabrics/LiningFabrics/LN1140.jpg" },
  { id: "lining-ln1142", name: "LN1142", image: "/fabrics/LiningFabrics/LN1142.jpg" },
  { id: "lining-ln1143", name: "LN1143", image: "/fabrics/LiningFabrics/LN1143.jpg" },
  { id: "lining-ln1157", name: "LN1157", image: "/fabrics/LiningFabrics/LN1157.jpg" },
  { id: "lining-ln1160", name: "LN1160", image: "/fabrics/LiningFabrics/LN1160.jpg" },
  { id: "lining-ln1163", name: "LN1163", image: "/fabrics/LiningFabrics/LN1163.jpg" },
  { id: "lining-ln1166", name: "LN1166", image: "/fabrics/LiningFabrics/LN1166.jpg" },
]

// Quilted Lining fabrics (images 249-256)
const QUILTED_FABRICS = [
  
]

export function LiningSelectionStep({
  selectedLiningType,
  selectedCustomType,
  selectedLiningFabric,
  onUpdate,
}: LiningSelectionStepProps) {
  const [liningType, setLiningType] = useState<"standard" | "custom" | "none">(selectedLiningType || "standard")
  const [customType, setCustomType] = useState<"custom-coloured" | "unlined" | "quilted" | undefined>(selectedCustomType)
  const [showFabricPopup, setShowFabricPopup] = useState(false)
  const [selectedFabric, setSelectedFabric] = useState<string | undefined>(selectedLiningFabric)

  const handleLiningTypeChange = (value: "standard" | "custom" | "none") => {
    setLiningType(value)
    onUpdate({ liningType: value })
    
    // Reset custom options when changing main type
    if (value !== "custom") {
      setCustomType(undefined)
      setSelectedFabric(undefined)
      setShowFabricPopup(false)
    }
  }

  const handleCustomTypeSelect = (type: "custom-coloured" | "unlined" | "quilted") => {
    setCustomType(type)
    
    // Set lining type based on selection
    if (type === "unlined") {
      // No lining at all - update immediately, no fabric selection needed
      onUpdate({ 
        customType: type,
        liningColor: "",
        liningType: "none",
        liningMeshType: "unlined",
        liningFabric: ""
      })
      setSelectedFabric(undefined)
      setShowFabricPopup(false)
      console.log(`🎨 Selected: Unlined - no fabric needed`)
    } else {
      // Half lined or Full lined - open popup for fabric selection
      onUpdate({ 
        customType: type,
        liningMeshType: type, // Set mesh type immediately
        liningType: "custom"
      })
      setShowFabricPopup(true) // Open popup for fabric selection
      console.log(`🎨 Selected lining type:`, { 
        type, 
        liningMeshType: type,
        message: type === "custom-coloured" ? "Half Lined - opening fabric selector" : "Full Lined - opening fabric selector"
      })
    }
  }

  const handleFabricSelect = (fabricId: string, fabricImage: string) => {
    setSelectedFabric(fabricId)
    onUpdate({ 
      liningFabric: fabricId,
      liningColor: fabricImage // Pass texture path for quilted linings
    })
    setShowFabricPopup(false)
  }
  
  const handleLiningFabricSelect = (fabricId: string, fabricImage: string) => {
    setSelectedFabric(fabricId)
    setShowFabricPopup(false)
    
    console.log(`🎨 Fabric selected in popup:`, { 
      fabricId, 
      fabricImage,
      customType,
      liningMeshType: customType
    })
    
    // Update with complete lining configuration
    onUpdate({ 
      liningFabric: fabricId,
      liningColor: fabricImage, // Texture path
      liningMeshType: customType, // "custom-coloured" (half) or "quilted" (full)
      customType: customType,
      liningType: "custom"
    })
    
    console.log(`✅ Lining configuration complete:`, { 
      liningFabric: fabricId,
      liningColor: fabricImage,
      liningMeshType: customType,
      displayName: customType === "custom-coloured" ? "Half Lined" : "Full Lined"
    })
  }

  const getFabricsForType = () => {
    // Return all lining fabrics for both half-lined and full-lined
    return LINING_FABRICS
  }

  const getCustomTypeLabel = () => {
    if (!customType) return "Select type"
    if (customType === "custom-coloured") return "Half Lined"
    if (customType === "unlined") return "Unlined"
    if (customType === "quilted") return "Full Lined"
    return "Select type"
  }

  const getCustomTypePrice = () => {
    if (customType === "custom-coloured") return "+€25.00"
    if (customType === "unlined") return "-€15.00"
    if (customType === "quilted") return "+€35.00"
    return ""
  }

  const getSelectedFabricName = () => {
    const allFabrics = [...LINING_FABRICS, ...QUILTED_FABRICS]
    const fabric = allFabrics.find(f => f.id === selectedFabric)
    return fabric?.name || "Select fabric"
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-semibold text-indigo-900">Jacket Lining</h3>
        </div>
        <p className="text-xs text-indigo-700">
          Choose your interior lining style
        </p>
      </div>

      {/* Main Lining Type Options */}
      <Card>
        <CardContent className="p-4">
          <RadioGroup
            value={liningType}
            onValueChange={handleLiningTypeChange}
            className="space-y-3"
          >
            {/* Standard Lining */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="lining-standard" />
                <Label htmlFor="lining-standard" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="font-medium">Standard Lining</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    Included
                  </Badge>
                </Label>
              </div>
              {liningType === "standard" && (
                <p className="text-xs text-gray-600 ml-6">
                  Premium matching lining that complements your selected fabric
                </p>
              )}
            </div>

            {/* Custom Lining - Shows 3 sub-options as icons */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="lining-custom" />
                <Label htmlFor="lining-custom" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="font-medium">Custom Lining</span>
                </Label>
              </div>
              {liningType === "custom" && (
                <div className="ml-6 space-y-3">
                  <p className="text-xs text-gray-600">
                    Choose your custom lining type:
                  </p>
                  
                  {/* 3 Icon Options */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Unlined */}
                    <button
                      onClick={() => handleCustomTypeSelect("unlined")}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${customType === "unlined"
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <svg className={`w-6 h-6 ${customType === "unlined" ? 'text-amber-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-xs font-medium text-center">Unlined</span>
                        <Badge variant="secondary" className="text-xs">-€15</Badge>
                      </div>
                    </button>

                    {/* Half Lined */}
                    <button
                      onClick={() => handleCustomTypeSelect("custom-coloured")}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${customType === "custom-coloured"
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <svg className={`w-6 h-6 ${customType === "custom-coloured" ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h9" />
                        </svg>
                        <span className="text-xs font-medium text-center">Half Lined</span>
                        <Badge variant="secondary" className="text-xs">+€15</Badge>
                      </div>
                    </button>

                    {/* Full Lined */}
                    <button
                      onClick={() => handleCustomTypeSelect("quilted")}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${customType === "quilted"
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <svg className={`w-6 h-6 ${customType === "quilted" ? 'text-purple-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span className="text-xs font-medium text-center">Full Lined</span>
                        <Badge variant="secondary" className="text-xs">+€25</Badge>
                      </div>
                    </button>
                  </div>
                  
                  {/* Show selected fabric or prompt */}
                  {(customType === "custom-coloured" || customType === "quilted") && (
                    <div className="pt-3">
                      {selectedFabric ? (
                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                              {getSelectedFabricName()}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFabricPopup(true)}
                            className="text-xs"
                          >
                            Change Fabric
                          </Button>
                        </div>
                      ) : (
                        <Alert className="border-blue-200 bg-blue-50">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-sm text-blue-900">
                            Click to select your lining fabric
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* No Lining */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="lining-none" />
                <Label htmlFor="lining-none" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="font-medium">No Lining</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                    -€15.00
                  </Badge>
                </Label>
              </div>
              {liningType === "none" && (
                <Alert className="ml-6 mt-2 border-amber-200 bg-amber-50">
                  <Info className="h-3 w-3 text-amber-600" />
                  <AlertDescription className="text-xs text-amber-800">
                    Unlined body with sleeve lining only for better breathability
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Fabric Selection Popup - Only for Quilted */}
      <Dialog open={showFabricPopup} onOpenChange={setShowFabricPopup}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Select {customType === "custom-coloured" ? "Half Lined" : "Full Lined"} Fabric
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
            {getFabricsForType().map((fabric) => (
              <button
                key={fabric.id}
                onClick={() => handleLiningFabricSelect(fabric.id, fabric.image)}
                className={`
                  relative group overflow-hidden rounded-lg border-2 transition-all
                  ${selectedFabric === fabric.id 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                {/* Fabric Image */}
                <div className="aspect-square relative bg-gray-100">
                  <img
                    src={fabric.image}
                    alt={fabric.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  
                  {/* Check mark when selected */}
                  {selectedFabric === fabric.id && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="bg-blue-500 rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Name */}
                <div className="p-2 bg-white border-t">
                  <p className="text-xs font-medium text-center line-clamp-1">
                    {fabric.name}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <Alert className="mt-4 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-800">
              {customType === "custom-coloured" 
                ? "Half lining applies fabric to upper chest area only" 
                : "Full lining covers the entire interior of the jacket"}
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    </div>
  )
}
