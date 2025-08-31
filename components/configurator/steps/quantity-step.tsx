"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Minus, Plus, ShoppingCart } from "lucide-react"

interface QuantityStepProps {
  quantity: number
  totalPrice: number
  onUpdate: (updates: any) => void
}

export function QuantityStep({ quantity, totalPrice, onUpdate }: QuantityStepProps) {
  const updateQuantity = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      onUpdate({ quantity: newQuantity })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>Final Step:</strong> Choose your quantity and review your custom shirt configuration.
        </p>
      </div>

      {/* Quantity Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Quantity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="quantity" className="font-medium">
              Number of shirts:
            </Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => updateQuantity(Number.parseInt(e.target.value) || 1)}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(quantity + 1)}
                disabled={quantity >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Maximum 10 shirts per order. For larger quantities, please contact us.
          </p>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Base price per shirt:</span>
            <span>€{(totalPrice / quantity).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span>{quantity}</span>
          </div>
          <div className="border-t pt-3 flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span className="text-green-600">€{totalPrice.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-600">Estimated delivery: 2-3 weeks</div>
        </CardContent>
      </Card>

      {/* Final CTA */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-green-600" />
          <h3 className="text-xl font-bold mb-2">Ready to Order?</h3>
          <p className="text-gray-600 mb-4">Your custom shirt is configured and ready to add to cart.</p>
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart - €{totalPrice.toFixed(2)}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
