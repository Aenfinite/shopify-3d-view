"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  Edit3, 
  User, 
  Mail, 
  Ruler, 
  Save, 
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShoppingBag
} from "lucide-react"
import type { MeasurementProfile } from "@/lib/firebase/measurement-profile-service"
import type { ShopifyCustomer } from "@/lib/shopify/shopify-customer-detection"

// ─── Measurement label mapping ────────────────────────────────────────────────

const MEASUREMENT_LABELS: Record<string, string> = {
  neck: "Neck",
  chest: "Chest",
  waist: "Waist",
  hip: "Hip",
  front_length: "Front Length",
  back_width: "Back Width",
  back_length: "Back Length",
  shoulder: "Shoulder",
  sleeve_length: "Sleeve Length",
  armhole: "Armhole",
  biceps: "Biceps",
  wrist: "Wrist",
  stomach: "Stomach",
  length: "Length",
  sleeve: "Sleeve",
  inseam: "Inseam",
  thigh: "Thigh",
  knee: "Knee",
  outseam: "Outseam",
  rise: "Rise",
  crotch_total: "Crotch (Total)",
  forearm: "Forearm",
  yoke: "Yoke",
  front_width: "Front Width",
  hem_width: "Hem Width",
  lapel_width: "Lapel Width",
  button_stance: "Button Stance",
  vent_length: "Vent Length",
  backmass: "Back Mass",
  sleeve_opening: "Sleeve Opening",
  first_button: "First Button",
  hem: "Hem"
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MeasurementConfirmStepProps {
  garmentType: "pants" | "jacket" | "shirt" | "suit" | "blazer"
  savedProfile: MeasurementProfile | null
  currentMeasurements: Record<string, number>
  customerEmail: string
  onCustomerEmailChange: (email: string) => void
  onConfirm: (measurements: Record<string, number>, email: string) => void
  onEditMeasurements: () => void // go to full measurement step
  onNewMeasurements: () => void  // start fresh measurements
  isLoading: boolean
  onLookup: (email: string) => void
  /** Shopify customer object when auto-detected from embed URL */
  shopifyCustomer?: ShopifyCustomer | null
  /** Whether the customer was auto-detected (Shopify login) */
  autoDetected?: boolean
}

export function MeasurementConfirmStep({
  garmentType,
  savedProfile,
  currentMeasurements,
  customerEmail,
  onCustomerEmailChange,
  onConfirm,
  onEditMeasurements,
  onNewMeasurements,
  isLoading,
  onLookup,
  shopifyCustomer,
  autoDetected = false,
}: MeasurementConfirmStepProps) {
  const [editMode, setEditMode] = useState(false)
  const [editedMeasurements, setEditedMeasurements] = useState<Record<string, number>>({})
  const [emailInput, setEmailInput] = useState(customerEmail)
  const [hasSearched, setHasSearched] = useState(autoDetected) // auto-detected = already searched
  const [showAllDetails, setShowAllDetails] = useState(false)

  // Determine which measurements to show
  const measurements = savedProfile?.measurements || currentMeasurements || {}

  useEffect(() => {
    setEditedMeasurements({ ...measurements })
  }, [savedProfile, currentMeasurements])

  useEffect(() => {
    setEmailInput(customerEmail)
  }, [customerEmail])

  // If auto-detected, mark as searched immediately
  useEffect(() => {
    if (autoDetected && customerEmail) {
      setHasSearched(true)
    }
  }, [autoDetected, customerEmail])

  const handleEmailLookup = () => {
    if (!emailInput.trim()) return
    onCustomerEmailChange(emailInput.trim())
    onLookup(emailInput.trim())
    setHasSearched(true)
  }

  const handleEditValue = (key: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setEditedMeasurements(prev => ({
      ...prev,
      [key]: numValue
    }))
  }

  const handleConfirmMeasurements = () => {
    const finalMeasurements = editMode ? editedMeasurements : measurements
    onConfirm(finalMeasurements, emailInput.trim())
  }

  const measurementEntries = Object.entries(measurements).filter(([_, v]) => v > 0)
  const hasAnyMeasurements = measurementEntries.length > 0

  // ─── Shared measurement table component ────────────────────────────────
  const MeasurementTable = () => (
    <Card className="border-blue-200">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-200 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-blue-600" />
            <h5 className="font-medium text-blue-900">Your Measurements in cm</h5>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            {editMode ? "Cancel Edit" : "Edit"}
          </Button>
        </div>

        <div className="divide-y divide-gray-100">
          {measurementEntries.map(([key, value], index) => (
            <div
              key={key}
              className={`flex items-center justify-between px-4 py-2.5 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <span className="text-sm text-gray-700 capitalize">
                {MEASUREMENT_LABELS[key] || key.replace(/_/g, " ")}
              </span>
              {editMode ? (
                <Input
                  type="number"
                  value={editedMeasurements[key] || ""}
                  onChange={(e) => handleEditValue(key, e.target.value)}
                  className="w-24 h-8 text-right text-sm"
                  step="0.5"
                />
              ) : (
                <span className="text-sm font-medium text-gray-900">
                  {value} cm
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6" style={{ fontFamily: 'Concord W00 ExtraLight, Arial, sans-serif' }}>

      {/* ── Customer Identification ─────────────────────────────────────── */}
      {autoDetected && shopifyCustomer ? (
        /* ── Shopify auto-detected customer ──────────────────────────── */
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Customer Detected</h4>
          </div>
          <Alert className="border-green-200 bg-green-50">
            <User className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center gap-2 flex-wrap">
                <strong>{shopifyCustomer.name || shopifyCustomer.email}</strong>
                {shopifyCustomer.verified ? (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    ✓ Verified Shopify Account
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    Shopify Account
                  </Badge>
                )}
              </div>
              <span className="block text-xs mt-1 text-green-700">
                {shopifyCustomer.email}
                {shopifyCustomer.phone && ` · ${shopifyCustomer.phone}`}
              </span>
            </AlertDescription>
          </Alert>
        </div>
      ) : customerEmail ? (
        /* ── Email already entered on measurement step ────────────────── */
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Order Contact</h4>
          </div>
          <Alert className="border-blue-100 bg-blue-50">
            <User className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 flex items-center gap-2">
              <span>{customerEmail}</span>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Confirmed</Badge>
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        /* ── Manual email lookup for guests ──────────────────────────── */
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Customer Identification</h4>
          </div>
          <p className="text-sm text-gray-600">
            Enter your email to check if we already have your measurements on file.
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailLookup()}
              className="flex-1"
            />
            <Button 
              onClick={handleEmailLookup}
              disabled={!emailInput.trim() || isLoading}
              className="flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Look up"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Loading State ─────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm text-gray-600">Checking for saved measurements...</p>
          </div>
        </div>
      )}

      {/* ── Profile Found: Show Measurement Table ─────────────────────── */}
      {!isLoading && hasSearched && savedProfile && (
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Welcome back!</strong> We found your {garmentType} measurements from a previous order.
              {savedProfile.orderCount > 1 && (
                <span className="block text-xs mt-1">
                  Used in {savedProfile.orderCount} previous orders · Last updated: {new Date(savedProfile.updatedAt).toLocaleDateString()}
                </span>
              )}
            </AlertDescription>
          </Alert>

          {/* Fit Preference Summary */}
          {savedProfile.fitPreference && (
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <Badge variant="secondary" className="text-blue-700">
                Fit: {savedProfile.fitPreference}
              </Badge>
              {savedProfile.shoulderType && (
                <Badge variant="outline" className="text-gray-600">
                  Shoulder: {savedProfile.shoulderType}
                </Badge>
              )}
              {savedProfile.backShape && (
                <Badge variant="outline" className="text-gray-600">
                  Back: {savedProfile.backShape}
                </Badge>
              )}
              {savedProfile.bellyType && (
                <Badge variant="outline" className="text-gray-600">
                  Belly: {savedProfile.bellyType}
                </Badge>
              )}
            </div>
          )}

          <MeasurementTable />

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleConfirmMeasurements}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {editMode ? "Save Changes & Confirm" : "Confirm Measurements"}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onNewMeasurements}
                className="flex-1 text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Take New Measurements
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── No Profile Found (after search or auto-detect) ────────────── */}
      {!isLoading && hasSearched && !savedProfile && (
        <div className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              {autoDetected ? (
                <>No saved measurements found for your account ({garmentType}). Let's take your measurements!</>
              ) : (
                <>No saved measurements found for <strong>{emailInput}</strong> ({garmentType}). This appears to be your first order — let's take your measurements!</>
              )}
            </AlertDescription>
          </Alert>

          <Button
            onClick={onNewMeasurements}
            className="w-full"
            size="lg"
          >
            <Ruler className="w-4 h-4 mr-2" />
            Take My Measurements
          </Button>
        </div>
      )}

      {/* ── Measurements Just Taken (no profile, show for confirmation) ── */}
      {!isLoading && !savedProfile && hasAnyMeasurements && !hasSearched && (
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Your measurements have been recorded. Please review and confirm below.
            </AlertDescription>
          </Alert>

          <MeasurementTable />

          <Button
            onClick={handleConfirmMeasurements}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {editMode ? "Save Changes & Confirm" : "Confirm Measurements"}
          </Button>
        </div>
      )}

      {/* ── Not yet searched, no measurements ─────────────────────────── */}
      {!isLoading && !hasSearched && !hasAnyMeasurements && (
        <div className="text-center py-4 text-sm text-gray-500">
          Enter your email above to get started.
        </div>
      )}
    </div>
  )
}
