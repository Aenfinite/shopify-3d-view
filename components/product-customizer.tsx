"use client"

import { useEffect, useState } from "react"
import { StepByStepConfigurator } from "./configurator/step-by-step-configurator"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ModularJacketViewer from "./modular-jacket-viewer-r3f"
import FabricColorController from "./configurator/fabric-color-controller"
import { BasicJacketCustomization } from "@/lib/3d/modular-jacket-loader"
import { useJacketConfigurator } from "@/hooks/use-jacket-configurator"

interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  category: string
  images: string[]
  modelUrl?: string
}

interface ProductCustomizerProps {
  productId: string
}

export function ProductCustomizer({ productId }: ProductCustomizerProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Use the jacket configurator hook for enhanced functionality
  const {
    jacketCustomizations,
    updateJacketCustomizations,
    getCustomizationPrice,
    isConfiguratorConnected
  } = useJacketConfigurator()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simulate API call - replace with your actual product fetching logic
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Updated product data for jacket
        const sampleProduct: Product = {
          id: productId,
          name: "Custom Suit Jacket",
          description: "Premium custom-tailored suit jacket with real-time 3D visualization and color customization",
          basePrice: 299,
          category: "jackets",
          images: ["/placeholder.svg?height=400&width=400"],
          modelUrl: "modular-jacket",
        }

        setProduct(sampleProduct)
      } catch (err) {
        setError("Failed to load product. Please try again.")
        console.error("Error fetching product:", err)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading your custom product...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || "Product not found. Please check the product ID and try again."}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show jacket customizer for jacket products
  if (product.category === "jackets" || product.modelUrl === "modular-jacket") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">{product.description}</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 3D Jacket Viewer */}
            <div className="lg:col-span-2">
              <Card className="h-[600px]">
                <CardContent className="p-0 h-full">
                  <ModularJacketViewer 
                    customizations={jacketCustomizations}
                    frontStyle={jacketCustomizations.frontStyle || "2button"}
                    className="w-full h-full rounded-lg"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Color Controller */}
            <div className="lg:col-span-1">
              <FabricColorController
                onCustomizationChange={updateJacketCustomizations}
                className="sticky top-8"
              />
              
              {/* Price Display */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      {isConfiguratorConnected ? "Configurator Price" : "Starting Price"}
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      ${getCustomizationPrice()}
                    </p>
                    <button className="w-full mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Use the step-by-step configurator for other products
  return (
    <StepByStepConfigurator
      productId={product.id}
      productName={product.name}
      productDescription={product.description}
      basePrice={product.basePrice}
      modelUrl={product.modelUrl || "sample-shirt"}
    />
  )
}
