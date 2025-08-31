import { Button } from "@/components/ui/button"
import { CustomerList } from "@/components/admin/customers/customer-list"

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button variant="outline">Export Customers</Button>
      </div>
      <CustomerList />
    </div>
  )
}
