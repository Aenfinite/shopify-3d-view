import { FabricList } from "@/components/admin/fabrics/fabric-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function FabricsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fabrics</h1>
        <Button asChild>
          <Link href="/admin/fabrics/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Fabric
          </Link>
        </Button>
      </div>
      <FabricList />
    </div>
  )
}
