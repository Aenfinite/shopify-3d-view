"use client"

import { useState } from "react"
import { useConfigurator } from "@/context/configurator-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, ShoppingCart } from "lucide-react"
import { generatePDF } from "@/lib/pdf-generator"

// Shopify product and variant IDs (these would come from your Shopify store)
const SHOPIFY_PRODUCT_ID = "product_12345"
const SHOPIFY_VARIANT_ID = "variant_67890"

export function OrderSummary() {
  const { mode, selectedFabric, selectedStyles, selectedSize, measurements, currentPrice, addToCart } =
    useConfigurator()

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true)

    try {
      await generatePDF({
        mode,
        fabric: selectedFabric,
        styles: selectedStyles,
        size: selectedSize,
        measurements,
        price: currentPrice,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true)

    try {
      await addToCart(SHOPIFY_PRODUCT_ID, SHOPIFY_VARIANT_ID)
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Failed to add item to cart. Please try again.")
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>Review your customized garment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fabric Section */}
          <div>
            <h3 className="font-medium mb-2">Fabric</h3>
            {selectedFabric ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded border"
                  style={{
                    backgroundColor: selectedFabric.color,
                    backgroundImage: selectedFabric.thumbnailUrl ? `url(${selectedFabric.thumbnailUrl})` : undefined,
                    backgroundSize: "cover",
                  }}
                />
                <div>
                  <p className="font-medium">{selectedFabric.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedFabric.description}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No fabric selected</p>
            )}
          </div>

          <Separator />

          {/* Style Options Section */}
          <div>
            <h3 className="font-medium mb-2">Style Options</h3>
            {Object.keys(selectedStyles).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(selectedStyles).map(([category, option]) => (
                  <div key={category} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm capitalize">{category}</p>
                      <p className="text-xs text-muted-foreground">{option.name}</p>
                    </div>
                    {option.priceDelta > 0 && <p className="text-sm">+€${option.priceDelta.toFixed(2)}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No style options selected</p>
            )}
          </div>

          <Separator />

          {/* Size/Measurements Section */}
          <div>
            <h3 className="font-medium mb-2">{mode === "MTO" ? "Size" : "Measurements"}</h3>

            {mode === "MTO" && selectedSize ? (
              <div className="space-y-1">
                <p className="font-medium">Size {selectedSize.name}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {Object.entries(selectedSize.measurements).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span>{value}"</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : mode === "MTM" && measurements ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {Object.entries(measurements).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span>{value}"</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{mode === "MTO" ? "No size selected" : "No measurements entered"}</p>
            )}
          </div>

          <Separator />

          {/* Price Summary */}
          <div className="space-y-1">
            <div className="flex justify-between font-medium">
              <span>Total Price</span>
              <span>€${currentPrice.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Estimated delivery: 2-3 weeks</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={handleAddToCart} disabled={isAddingToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPdf ? "Generating PDF..." : "Download Summary"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
