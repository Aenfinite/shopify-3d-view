import { Button } from "@/components/ui/button"
import { OrderList } from "@/components/admin/orders/order-list"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button variant="outline">Export Orders</Button>
      </div>
      <OrderList />
    </div>
  )
}
