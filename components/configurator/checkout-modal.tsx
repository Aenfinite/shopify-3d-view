"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, CreditCard, User, MapPin, Phone, Mail, Lock, Shield, CheckCircle, Loader2 } from "lucide-react"

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
}

export function CheckoutModal({ isOpen, onClose, orderSummary }: CheckoutModalProps) {
  const [activeTab, setActiveTab] = useState("summary")
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  // Customer Info State
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  })

  // Payment Info State
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  })

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handlePaymentInfoChange = (field: string, value: string) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }))
  }

  const isCustomerInfoComplete = () => {
    return (
      customerInfo.firstName &&
      customerInfo.lastName &&
      customerInfo.email &&
      customerInfo.phone &&
      customerInfo.address &&
      customerInfo.city &&
      customerInfo.state &&
      customerInfo.zipCode
    )
  }

  const isPaymentInfoComplete = () => {
    return paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv && paymentInfo.nameOnCard
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setIsProcessing(false)
    setOrderComplete(true)

    // Auto close after success
    setTimeout(() => {
      setOrderComplete(false)
      onClose()
    }, 3000)
  }

  if (orderComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-4">Thank you for your order. You'll receive a confirmation email shortly.</p>
            <p className="text-sm text-gray-500">Order #: MTM-{Date.now().toString().slice(-6)}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Complete Your Order
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Order Summary
            </TabsTrigger>
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Info
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment
            </TabsTrigger>
          </TabsList>

          {/* Order Summary Tab */}
          <TabsContent value="summary" className="space-y-6 max-h-[60vh] overflow-y-auto">
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
                  <span>€{orderSummary.basePrice.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />

                {orderSummary.customizations.map((customization, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">
                      {customization.category}: {customization.value}
                    </span>
                    <span className="text-sm">
                      {customization.price > 0 ? `+€${customization.price.toFixed(2)}` : "Included"}
                    </span>
                  </div>
                ))}

                <Separator className="my-2" />

                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">
                    Measurements: {orderSummary.measurementData.sizeType === "custom" ? "Custom Measurement" : "Standard"}
                    {orderSummary.measurementData.sizeType === "custom" && orderSummary.measurementData.customMeasurementMethod && 
                      ` (${orderSummary.measurementData.customMeasurementMethod === "videos" ? "Video Tutorial" : "Sketch Guide"})`}
                    {orderSummary.measurementData.standardSize &&
                      ` (${orderSummary.measurementData.standardSize.toUpperCase()})`}
                    {orderSummary.measurementData.fitType && orderSummary.measurementData.sizeType === "standard" && ` - ${orderSummary.measurementData.fitType}`}
                  </span>
                  <span className="text-sm">
                    {orderSummary.measurementData.sizeType === "custom" ? "+€25.00" : "Included"}
                  </span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span>€{orderSummary.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Delivery & Returns</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Standard delivery: 2-3 weeks</li>
                  <li>• Bespoke items: 4-6 weeks</li>
               
                  <li>• 100% satisfaction guarantee</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Customer Info Tab */}
          <TabsContent value="customer" className="space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={customerInfo.firstName}
                  onChange={(e) => handleCustomerInfoChange("firstName", e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={customerInfo.lastName}
                  onChange={(e) => handleCustomerInfoChange("lastName", e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerInfoChange("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => handleCustomerInfoChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </h4>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => handleCustomerInfoChange("address", e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={customerInfo.city}
                    onChange={(e) => handleCustomerInfoChange("city", e.target.value)}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={customerInfo.state}
                    onChange={(e) => handleCustomerInfoChange("state", e.target.value)}
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={customerInfo.zipCode}
                    onChange={(e) => handleCustomerInfoChange("zipCode", e.target.value)}
                    placeholder="10001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={customerInfo.country}
                    onChange={(e) => handleCustomerInfoChange("country", e.target.value)}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Secure Payment</p>
                <p className="text-sm text-green-700">Your payment information is encrypted and secure</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nameOnCard" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Name on Card
                </Label>
                <Input
                  id="nameOnCard"
                  value={paymentInfo.nameOnCard}
                  onChange={(e) => handlePaymentInfoChange("nameOnCard", e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Card Number
                </Label>
                <Input
                  id="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => handlePaymentInfoChange("cardNumber", e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={paymentInfo.expiryDate}
                    onChange={(e) => handlePaymentInfoChange("expiryDate", e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    value={paymentInfo.cvv}
                    onChange={(e) => handlePaymentInfoChange("cvv", e.target.value)}
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Order Total</span>
                <span>€{orderSummary.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={!isCustomerInfoComplete() || !isPaymentInfoComplete() || isProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Place Order - €{orderSummary.totalPrice.toFixed(2)}
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By placing this order, you agree to our Terms of Service and Privacy Policy. Your payment is processed
              securely through our encrypted payment system.
            </p>
          </TabsContent>
        </Tabs>

        {/* Tab Navigation Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              if (activeTab === "customer") setActiveTab("summary")
              else if (activeTab === "payment") setActiveTab("customer")
            }}
            disabled={activeTab === "summary"}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full €{activeTab === "summary" ? "bg-blue-500" : "bg-gray-300"}`} />
            <div className={`w-2 h-2 rounded-full €{activeTab === "customer" ? "bg-blue-500" : "bg-gray-300"}`} />
            <div className={`w-2 h-2 rounded-full €{activeTab === "payment" ? "bg-blue-500" : "bg-gray-300"}`} />
          </div>

          <Button
            onClick={() => {
              if (activeTab === "summary") setActiveTab("customer")
              else if (activeTab === "customer") setActiveTab("payment")
            }}
            disabled={activeTab === "payment"}
          >
            Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
