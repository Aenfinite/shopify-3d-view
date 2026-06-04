import { OrderDetail } from "@/components/admin/orders/order-detail"

export const dynamic = "force-dynamic"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <OrderDetail orderId={id} />
}
