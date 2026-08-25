import { MaterialsManager } from "@/components/admin/materials/materials-manager"

export const dynamic = "force-dynamic"

export default function MaterialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Material Specifications</h1>
        <p className="text-muted-foreground mt-1">
          Central material database covering all suppliers. Each material receives an automatically generated
          6-digit <strong>Specification ID</strong> and stores the supplier&apos;s article number, colour, composition,
          construction, weight, and finishings.
        </p>
      </div>
      <MaterialsManager />
    </div>
  )
}
