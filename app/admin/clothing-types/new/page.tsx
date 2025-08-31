"use client"

import { ClothingTypeForm } from "@/components/admin/clothing-types/clothing-type-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function NewClothingTypePage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Clothing Type</h1>
          <p className="text-muted-foreground">
            Create a new clothing type that will appear alongside your existing mock items
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Clothing Type Details</CardTitle>
          <CardDescription>
            This will be added to your existing collection of shirts, jackets, and pants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClothingTypeForm />
        </CardContent>
      </Card>
    </div>
  )
}
