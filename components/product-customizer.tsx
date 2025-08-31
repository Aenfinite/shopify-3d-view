"use client"

import { useEffect, useState } from "react"
import { StepByStepConfigurator } from "./configurator/step-by-step-configurator"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simulate API call - replace with your actual product fetching logic
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Sample product data - replace with actual data fetching
        const sampleProduct: Product = {
          id: productId,
          name: "Custom Dress Shirt",
          description: "Premium custom-tailored dress shirt with unlimited customization options",
          basePrice: 89,
          category: "shirts",
          images: ["/placeholder.svg?height=400&width=400"],
          modelUrl: "sample-shirt",
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

  // Use the beautiful step-by-step configurator for ALL products
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
