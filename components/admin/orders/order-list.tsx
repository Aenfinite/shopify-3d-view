"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase/firebase-config"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  orderNumber: string
  customerName: string
  date: any
  total: number
  status: string
  items: number
}

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const ordersCollection = query(collection(db, "orders"), orderBy("date", "desc"))
        const ordersSnapshot = await getDocs(ordersCollection)
        const ordersList = ordersSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            orderNumber: data.orderNumber || `ORD-${doc.id.slice(0, 6)}`,
            customerName: data.customerName || "Customer",
            date: data.date?.toDate() || new Date(),
            total: data.total || 0,
            status: data.status || "pending",
            items: data.items?.length || 0,
          }
        })

        setOrders(ordersList)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) {
    return <div className="flex justify-center p-8">Loading orders...</div>
  }

  // If no orders exist yet, create some sample data
  if (orders.length === 0) {
    const sampleOrders: Order[] = [
      {
        id: "sample1",
        orderNumber: "ORD-123456",
        customerName: "John Doe",
        date: new Date(),
        total: 249.99,
        status: "completed",
        items: 2,
      },
      {
        id: "sample2",
        orderNumber: "ORD-123457",
        customerName: "Jane Smith",
        date: new Date(Date.now() - 86400000),
        total: 349.99,
        status: "processing",
        items: 3,
      },
      {
        id: "sample3",
        orderNumber: "ORD-123458",
        customerName: "Robert Johnson",
        date: new Date(Date.now() - 172800000),
        total: 199.99,
        status: "pending",
        items: 1,
      },
    ]

    return (
      <div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-800">
            No orders found in the database. Showing sample data for demonstration purposes.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </TableBody>
    </Table>
  )
}

function OrderRow({ order }: { order: Order }) {
  const statusVariant = {
    pending: "warning",
    processing: "default",
    completed: "success",
    cancelled: "destructive",
  } as const

  const variant = statusVariant[order.status as keyof typeof statusVariant] || "outline"

  return (
    <TableRow>
      <TableCell className="font-medium">{order.orderNumber}</TableCell>
      <TableCell>{order.customerName}</TableCell>
      <TableCell>{order.date.toLocaleDateString()}</TableCell>
      <TableCell>{order.items}</TableCell>
      <TableCell>€${order.total.toFixed(2)}</TableCell>
      <TableCell>
        <Badge variant={variant as any}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/orders/${order.id}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
