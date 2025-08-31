"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { CustomizationStepBuilder } from "@/components/admin/clothing-types/customization-step-builder"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CustomizationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const clothingTypeId = params.id as string

  // Mock data - in real app this would come from Firebase
  const clothingTypeName = clothingTypeId.includes("shirt")
    ? "Custom Shirt"
    : clothingTypeId.includes("jacket")
      ? "Custom Jacket"
      : clothingTypeId.includes("pants")
        ? "Custom Pants"
        : "New Clothing Type"

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In real implementation, save to Firebase
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Success!",
        description: "Customization steps have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save customization steps.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    // Open preview in new tab
    window.open(`/product/€{clothingTypeId}?preview=true`, "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clothing Types
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customization Setup</h1>
            <p className="text-muted-foreground">Configure customization steps for {clothingTypeName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Alert>
        <AlertDescription>
          This clothing type will appear alongside your existing mock items (shirts, jackets, pants) in the customer
          configurator. Configure the customization steps below.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Customization Steps</CardTitle>
          <CardDescription>
            Define the step-by-step customization process for customers. Each step will appear as a separate screen in
            the configurator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomizationStepBuilder clothingTypeId={clothingTypeId} />
        </CardContent>
      </Card>
    </div>
  )
}
