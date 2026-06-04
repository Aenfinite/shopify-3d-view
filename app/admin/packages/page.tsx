import { PackagesManager } from "@/components/admin/packages/packages-manager"

export const dynamic = "force-dynamic"

export default function PackagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Packages</h1>
        <p className="text-muted-foreground mt-1">
          Define Kickstarter reward tiers. The importer matches a backer’s reward to a package by code or name,
          then spawns one sub-order per garment (garments × quantity).
        </p>
      </div>
      <PackagesManager />
    </div>
  )
}
