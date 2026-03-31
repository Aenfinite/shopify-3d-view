import { FabricManager } from "@/components/admin/fabrics/fabric-manager"

export default function FabricsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fabric Management</h1>
          <p className="text-muted-foreground mt-1">Manage fabrics for all products. Add cotton, linen, or polyester fabrics with 3D preview.</p>
        </div>
      </div>
      <FabricManager />
    </div>
  )
}
