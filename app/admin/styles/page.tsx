import { StyleList } from "@/components/admin/styles/style-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function StylesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Style Options</h1>
        <Button asChild>
          <Link href="/admin/styles/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Style Option
          </Link>
        </Button>
      </div>
      <StyleList />
    </div>
  )
}
