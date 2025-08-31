import { GarmentList } from "@/components/admin/garments/garment-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function GarmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Garments</h1>
          <p className="text-muted-foreground">Manage your garment products and their customization options</p>
        </div>
        <Button asChild>
          <Link href="/admin/garments/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Garment
          </Link>
        </Button>
      </div>
      <GarmentList />
    </div>
  )
}
