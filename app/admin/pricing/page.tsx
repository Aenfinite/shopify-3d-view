import { PricingRules } from "@/components/admin/pricing/pricing-rules"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pricing Rules</h1>
        <Button asChild>
          <Link href="/admin/pricing/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Pricing Rule
          </Link>
        </Button>
      </div>
      <PricingRules />
    </div>
  )
}
