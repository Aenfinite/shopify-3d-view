import { Button } from "@/components/ui/button"
import { ModelList } from "@/components/admin/models/model-list"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function ModelsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">3D Models</h1>
          <p className="text-muted-foreground">Manage 3D models and their customization options</p>
        </div>
        <Button asChild>
          <Link href="/admin/models/new">
            <Plus className="mr-2 h-4 w-4" /> Add Model
          </Link>
        </Button>
      </div>

      <ModelList />
    </div>
  )
}
