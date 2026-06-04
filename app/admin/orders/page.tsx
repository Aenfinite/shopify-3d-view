import { OrdersTable } from "@/components/admin/orders/orders-table"

export const dynamic = "force-dynamic"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-1">
          All Kickstarter, Shopify and manual orders. Click an order to view its sub-orders and update status.
        </p>
      </div>
      <OrdersTable />
    </div>
  )
}
