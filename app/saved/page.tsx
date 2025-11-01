import { SavedCustomizations } from "@/components/save-resume/saved-customizations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic'

export default function SavedCustomizationsPage() {
  return (
    <div className="container py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Saved Customizations</CardTitle>
          <CardDescription>View, edit, or add your saved customizations to cart</CardDescription>
        </CardHeader>
        <CardContent>
          <SavedCustomizations />
        </CardContent>
      </Card>
    </div>
  )
}
