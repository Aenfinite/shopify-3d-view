import { KickstarterImport } from "@/components/admin/kickstarter/kickstarter-import"

export const dynamic = "force-dynamic"

export default function KickstarterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kickstarter Import</h1>
        <p className="text-muted-foreground mt-1">
          Upload the Kickstarter Backer Report to create customers, orders and per-garment sub-orders.
          Errored or dropped pledges are skipped automatically.
        </p>
      </div>
      <KickstarterImport />
    </div>
  )
}
