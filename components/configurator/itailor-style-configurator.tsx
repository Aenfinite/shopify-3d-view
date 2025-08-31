"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModelViewer } from "@/components/3d-model-viewer"
import { Star } from "lucide-react"

interface ConfiguratorState {
  selectedCategory: string
  selectedFabric: string
  selectedStyle: string
  selectedColorContrast: string
  measurements: any
}

const CATEGORIES = [
  {
    id: "fabric",
    name: "FABRIC",
    subcategories: [
      { id: "view-all", name: "VIEW ALL" },
      { id: "shirt-of-day", name: "SHIRT OF THE DAY", price: "39.95€" },
      { id: "the-white", name: "THE WHITE", price: "49.95€" },
      { id: "solid-colors", name: "SOLID COLORS", price: "55.95€" },
      { id: "premium-solid", name: "PREMIUM SOLID", price: "59.95€" },
      { id: "tone-on-tone", name: "TONE-ON-TONE", price: "69.95€" },
      { id: "pattern-organic", name: "PATTERN/ORGANIC", price: "69.95€" },
    ],
  },
  { id: "style", name: "STYLE" },
  { id: "color-contrast", name: "COLOR CONTRAST" },
  { id: "measurements", name: "MEASUREMENTS" },
]

const FABRIC_OPTIONS = [
  { id: "454573", name: "SKYBLUE x WHITE", price: "39.95€", color: "#87CEEB", pattern: "striped", badge: "BEST" },
  { id: "premium-white", name: "PREMIUM WHITE", price: "59.95€", color: "#FFFFFF", selected: true },
  { id: "light-gray", name: "LIGHT GRAY", price: "49.95€", color: "#D3D3D3" },
  { id: "black", name: "BLACK", price: "55.95€", color: "#000000" },
  { id: "sky-blue", name: "SKY BLUE", price: "55.95€", color: "#87CEEB" },
  { id: "light-pink", name: "LIGHT PINK", price: "55.95€", color: "#FFB6C1" },
  { id: "454513", name: "454513", price: "55.95€", color: "#DDA0DD" },
  { id: "454519", name: "454519", price: "55.95€", color: "#9370DB" },
  { id: "454524", name: "454524", price: "55.95€", color: "#4B0082" },
  { id: "454525", name: "454525", price: "55.95€", color: "#191970" },
  { id: "454516", name: "454516", price: "55.95€", color: "#9ACD32" },
  { id: "454512", name: "454512", price: "55.95€", color: "#F0E68C" },
  { id: "454515", name: "454515", price: "55.95€", color: "#DAA520" },
  { id: "454517", name: "454517", price: "55.95€", color: "#CD853F" },
  { id: "454514", name: "454514", price: "55.95€", color: "#20B2AA" },
  { id: "454521", name: "454521", price: "55.95€", color: "#008B8B", badge: "BEST" },
  { id: "454527", name: "454527", price: "55.95€", color: "#708090" },
  { id: "454510", name: "454510", price: "55.95€", color: "#2F4F4F" },
  { id: "454529", name: "454529", price: "55.95€", color: "#000000" },
]

interface ITailorStyleConfiguratorProps {
  productId: string
  productName: string
  basePrice: number
}

export function ITailorStyleConfigurator({ productId, productName, basePrice }: ITailorStyleConfiguratorProps) {
  const [selectedCategory, setSelectedCategory] = useState("fabric")
  const [selectedSubcategory, setSelectedSubcategory] = useState("view-all")
  const [selectedFabric, setSelectedFabric] = useState("premium-white")
  const [configuratorState, setConfiguratorState] = useState<ConfiguratorState>({
    selectedCategory: "fabric",
    selectedFabric: "premium-white",
    selectedStyle: "",
    selectedColorContrast: "",
    measurements: {},
  })

  const renderFabricGrid = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-amber-900">ADVANCE SEARCH &gt;&gt;</h2>
        <span className="text-amber-800">VIEW 661 CHOICES</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {FABRIC_OPTIONS.map((fabric) => (
          <Card
            key={fabric.id}
            className={`
              relative cursor-pointer transition-all hover:shadow-lg border-2
              €{selectedFabric === fabric.id ? "border-amber-600 shadow-lg" : "border-gray-300"}
            `}
            onClick={() => setSelectedFabric(fabric.id)}
          >
            {fabric.badge && (
              <Badge className="absolute -top-2 -left-2 bg-red-600 text-white text-xs px-2 py-1 rotate-[-15deg] z-10">
                {fabric.badge}
              </Badge>
            )}
            <CardContent className="p-0">
              <div
                className="h-24 w-full rounded-t-lg"
                style={{
                  backgroundColor: fabric.color,
                  backgroundImage:
                    fabric.pattern === "striped"
                      ? "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)"
                      : undefined,
                }}
              />
              <div className="p-3 text-center">
                {selectedFabric === fabric.id ? (
                  <Button size="sm" className="w-full bg-amber-700 hover:bg-amber-800 text-white">
                    SELECT
                  </Button>
                ) : (
                  <div>
                    <div className="text-xs font-bold text-gray-700 mb-1">{fabric.id}</div>
                    <div className="text-sm font-bold text-red-600">{fabric.price}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case "fabric":
        return renderFabricGrid()
      case "style":
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-6">STYLE OPTIONS</h2>
            <div className="text-center text-gray-600">Style customization options coming soon...</div>
          </div>
        )
      case "color-contrast":
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-6">COLOR CONTRAST</h2>
            <div className="text-center text-gray-600">Color contrast options coming soon...</div>
          </div>
        )
      case "measurements":
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-6">MEASUREMENTS</h2>
            <div className="text-center text-gray-600">Measurement options coming soon...</div>
          </div>
        )
      default:
        return renderFabricGrid()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      {/* Header */}
      <div className="bg-amber-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <span className="font-bold">PRODUCTS | MENU</span>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">iTailor</h1>
              <p className="text-xs text-amber-200">CUSTOM MADE SHIRTS</p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <Badge className="bg-green-600">NEW WORKMANSHIP DETAILS</Badge>
              <span>LANGUAGE: EN</span>
              <span>LOG IN</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 min-h-screen">
          {/* Left Sidebar */}
          <div className="col-span-2 bg-amber-100 border-r border-amber-200">
            <div className="p-4">
              <h2 className="font-bold text-amber-900 mb-4">TAILOR MADE SHIRTS</h2>

              {/* Categories */}
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`
                        w-full text-left px-3 py-2 rounded font-bold text-sm transition-colors
                        €{
                          selectedCategory === category.id
                            ? "bg-red-600 text-white"
                            : "text-amber-900 hover:bg-amber-200"
                        }
                      `}
                    >
                      {category.name}
                    </button>

                    {/* Subcategories for Fabric */}
                    {category.id === "fabric" && selectedCategory === "fabric" && (
                      <div className="ml-4 mt-2 space-y-1">
                        {category.subcategories?.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedSubcategory(sub.id)}
                            className={`
                              w-full text-left px-2 py-1 text-xs rounded transition-colors
                              €{
                                selectedSubcategory === sub.id
                                  ? "bg-amber-200 text-amber-900"
                                  : "text-amber-800 hover:bg-amber-150"
                              }
                            `}
                          >
                            <div className="flex justify-between items-center">
                              <span>{sub.name}</span>
                              {sub.price && <span className="text-red-600 font-bold">{sub.price}</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Trustpilot Section */}
              <div className="mt-8 p-3 bg-white rounded-lg shadow">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-green-500 text-green-500" />
                    ))}
                  </div>
                  <span className="text-sm font-bold">Trustpilot</span>
                </div>
                <div className="text-xs text-gray-600">
                  <div>TrustScore 4.5</div>
                  <div>3,686 reviews</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Content Area */}
          <div className="col-span-6 bg-white">{renderCategoryContent()}</div>

          {/* Right 3D Preview */}
          <div className="col-span-4 bg-gradient-to-br from-amber-200 to-amber-300 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23d4a574&quot; fillOpacity=&quot;0.1&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

            <div className="relative z-10 p-6 h-full flex flex-col">
              <div className="text-right mb-4">
                <span className="text-amber-900 font-bold">Custom Dress Shirt</span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-[600px] bg-gradient-to-b from-transparent to-amber-200/30 rounded-lg overflow-hidden">
                  <ModelViewer
                    modelUrl="sample-shirt"
                    customizations={{
                      fabricColor: FABRIC_OPTIONS.find((f) => f.id === selectedFabric)?.color || "#FFFFFF",
                    }}
                    layerControls={{}}
                  />
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className="text-sm text-amber-800 mb-2">Weight: 125g</div>
                <Button className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-2">ADD TO CART</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
