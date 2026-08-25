import { SkuLookup } from "@/components/admin/sku-lookup/sku-lookup"

export const dynamic = "force-dynamic"

export default function SkuLookupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SKU Quick-Lookup</h1>
        <p className="text-muted-foreground mt-1">
          Paste or scan a 22-digit SKU to instantly decode its segments, view the linked material specification,
          and see readable names for suppliers, colours, and finishings.
        </p>
      </div>
      <SkuLookup />
    </div>
  )
}
