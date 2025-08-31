"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getGuestCustomizations,
  getUserCustomizations,
  deleteGuestCustomization,
  deleteUserCustomization,
  type SavedCustomization,
} from "@/lib/save-resume/save-resume-service"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { Trash2, Edit, ShoppingCart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { addToShopifyCart, prepareLineItemProperties } from "@/lib/shopify/shopify-service"

export function SavedCustomizations() {
  const [guestCustomizations, setGuestCustomizations] = useState<SavedCustomization[]>([])
  const [userCustomizations, setUserCustomizations] = useState<SavedCustomization[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const loadCustomizations = async () => {
      setLoading(true)

      try {
        // Always load guest customizations
        const guest = getGuestCustomizations()
        setGuestCustomizations(guest)

        // Load user customizations if logged in
        if (user) {
          const userSaved = await getUserCustomizations(user.uid)
          setUserCustomizations(userSaved)
        } else {
          setUserCustomizations([])
        }
      } catch (error) {
        console.error("Error loading customizations:", error)
        toast({
          title: "Error",
          description: "Failed to load saved customizations",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCustomizations()
  }, [user, toast])

  const handleDelete = async (id: string, isUserCustomization: boolean) => {
    try {
      if (isUserCustomization) {
        if (!user) return

        await deleteUserCustomization(id)
        setUserCustomizations((prev) => prev.filter((c) => c.id !== id))
      } else {
        deleteGuestCustomization(id)
        setGuestCustomizations((prev) => prev.filter((c) => c.id !== id))
      }

      toast({
        title: "Success",
        description: "Customization deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting customization:", error)
      toast({
        title: "Error",
        description: "Failed to delete customization",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (customization: SavedCustomization) => {
    // Store the customization in session storage for the configurator to pick up
    sessionStorage.setItem("resume_customization", JSON.stringify(customization))

    // Navigate to the product page
    router.push(`/product/€{customization.productId}`)
  }

  const handleAddToCart = async (customization: SavedCustomization) => {
    try {
      // Prepare line item properties
      const properties = prepareLineItemProperties({
        mode: customization.mode,
        fabric: customization.fabric,
        styles: customization.styles,
        size: customization.size,
        measurements: customization.measurements,
        price: customization.price,
      })

      // Add to Shopify cart
      const result = await addToShopifyCart({
        productId: customization.productId,
        variantId: customization.productId, // This should be the variant ID in a real implementation
        quantity: 1,
        properties,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Item added to cart successfully",
        })

        // Redirect to cart
        window.location.href = result.cartUrl
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
    }
  }

  const renderCustomizationCard = (customization: SavedCustomization, isUserCustomization: boolean) => {
    return (
      <Card key={customization.id} className="mb-4">
        <CardHeader>
          <CardTitle>{customization.name || "Unnamed Customization"}</CardTitle>
          <CardDescription>
            {customization.mode === "MTM" ? "Made-to-Measure" : "Made-to-Order"} • Created{" "}
            {formatDistanceToNow(new Date(customization.createdAt), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-20 font-medium">Fabric:</div>
              <div>{customization.fabric?.name || "Not selected"}</div>
            </div>
            <div className="flex items-center">
              <div className="w-20 font-medium">Styles:</div>
              <div>
                {Object.values(customization.styles || {}).length > 0
                  ? Object.values(customization.styles)
                      .map((style) => style.name)
                      .join(", ")
                  : "Not selected"}
              </div>
            </div>
            {customization.mode === "MTO" && (
              <div className="flex items-center">
                <div className="w-20 font-medium">Size:</div>
                <div>{customization.size?.name || "Not selected"}</div>
              </div>
            )}
            {customization.mode === "MTM" && (
              <div className="flex items-center">
                <div className="w-20 font-medium">Measurements:</div>
                <div>
                  {customization.measurements
                    ? Object.entries(customization.measurements)
                        .map(([key, value]) => `€{key}: €{value}`)
                        .join(", ")
                    : "Not entered"}
                </div>
              </div>
            )}
            <div className="flex items-center">
              <div className="w-20 font-medium">Price:</div>
              <div>€{customization.price.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => handleDelete(customization.id, isUserCustomization)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleEdit(customization)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button size="sm" onClick={() => handleAddToCart(customization)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (loading) {
    return <div className="py-8 text-center">Loading saved customizations...</div>
  }

  return (
    <div>
      <Tabs defaultValue={user ? "account" : "guest"}>
        <TabsList className="mb-4">
          <TabsTrigger value="guest">Guest Customizations</TabsTrigger>
          <TabsTrigger value="account" disabled={!user}>
            Account Customizations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guest">
          {guestCustomizations.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No saved customizations found</p>
              <Button asChild>
                <a href="/products">Start Customizing</a>
              </Button>
            </div>
          ) : (
            guestCustomizations.map((customization) => renderCustomizationCard(customization, false))
          )}
        </TabsContent>

        <TabsContent value="account">
          {!user ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Please log in to view your saved customizations</p>
              <Button asChild>
                <a href="/login">Log In</a>
              </Button>
            </div>
          ) : userCustomizations.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No saved customizations found</p>
              <Button asChild>
                <a href="/products">Start Customizing</a>
              </Button>
            </div>
          ) : (
            userCustomizations.map((customization) => renderCustomizationCard(customization, true))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
