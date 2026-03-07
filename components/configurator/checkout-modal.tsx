"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Loader2, Scissors, ExternalLink, Shield } from "lucide-react"

interface OrderSummary {
  productName: string
  basePrice: number
  customizations: Array<{
    category: string
    value: string
    price: number
  }>
  measurementData: {
    sizeType: "standard" | "custom"
    standardSize?: string
    fitType?: string
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
  totalPrice: number
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  orderSummary: OrderSummary
  onEditConfiguration?: () => void
}

export function CheckoutModal({ isOpen, onClose, orderSummary, onEditConfiguration }: CheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleProceedToCheckout = async () => {
    setIsProcessing(true)
    setError(null)
    try {
      const res = await fetch("/api/shopify/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderSummary }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ? JSON.stringify(data.error) : "Failed to create checkout. Please try again.")
        setIsProcessing(false)
        return
      }
      // Use window.top so it breaks out of Shopify iframe overlay
      const target = window.top || window
      target.location.href = data.checkoutUrl
    } catch (err) {
      setError("Network error - please check your connection and try again.")
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Review Your Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-0">
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{orderSummary.productName}</h3>
                <Badge variant="outline">
                  {orderSummary.measurementData.sizeType === "custom" ? "Bespoke" : "Made to Order"}
                </Badge>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Base Price</span>
                  <span>{"\u20AC"}{orderSummary.basePrice.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />

                {orderSummary.customizations.map((customization, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">
                      {customization.category}: {customization.value}
                    </span>
                    <span className="text-sm">
                      {customization.price > 0 ? `+${"\u20AC"}${customization.price.toFixed(2)}` : "Included"}
                    </span>
                  </div>
                ))}

                <Separator className="my-2" />

                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span>{"\u20AC"}{orderSummary.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-1">Delivery</h4>
                <p className="text-sm text-blue-700">
                  Estimated delivery time: 3–4 weeks from order confirmation (may vary in peak seasons).
                </p>
              </div>

              {onEditConfiguration && (
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    onEditConfiguration()
                    onClose()
                  }}
                >
                  <Scissors className="w-4 h-4 mr-2" />
                  Edit Configuration
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Secure checkout powered by Shopify - your payment is handled safely on their platform.</span>
            </div>

            <Button
              onClick={handleProceedToCheckout}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Preparing Checkout...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {`Proceed to Checkout - \u20AC${orderSummary.totalPrice.toFixed(2)}`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}