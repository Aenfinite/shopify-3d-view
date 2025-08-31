import { MeasurementGuideList } from "@/components/admin/guides/measurement-guide-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function GuidesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Measurement Guides</h1>
        <Button asChild>
          <Link href="/admin/guides/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Guide
          </Link>
        </Button>
      </div>
      <MeasurementGuideList />
    </div>
  )
}
