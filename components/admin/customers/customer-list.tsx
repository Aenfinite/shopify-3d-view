"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase/firebase-config"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import Link from "next/link"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  orders: number
  totalSpent: number
  lastOrder?: Date
  status: "active" | "inactive"
}

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const customersCollection = query(collection(db, "customers"), orderBy("name"))
        const customersSnapshot = await getDocs(customersCollection)
        const customersList = customersSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || "Unknown",
            email: data.email || "",
            phone: data.phone,
            orders: data.orders || 0,
            totalSpent: data.totalSpent || 0,
            lastOrder: data.lastOrder?.toDate(),
            status: data.status || "active",
          }
        })

        setCustomers(customersList)
      } catch (error) {
        console.error("Error fetching customers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  if (loading) {
    return <div className="flex justify-center p-8">Loading customers...</div>
  }

  // If no customers exist yet, create some sample data
  if (customers.length === 0) {
    const sampleCustomers: Customer[] = [
      {
        id: "sample1",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        orders: 3,
        totalSpent: 749.97,
        lastOrder: new Date(),
        status: "active",
      },
      {
        id: "sample2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+1 (555) 987-6543",
        orders: 1,
        totalSpent: 349.99,
        lastOrder: new Date(Date.now() - 86400000),
        status: "active",
      },
      {
        id: "sample3",
        name: "Robert Johnson",
        email: "robert.johnson@example.com",
        orders: 2,
        totalSpent: 399.98,
        lastOrder: new Date(Date.now() - 172800000),
        status: "inactive",
      },
    ]

    return (
      <div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-800">
            No customers found in the database. Showing sample data for demonstration purposes.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleCustomers.map((customer) => (
              <CustomerRow key={customer.id} customer={customer} />
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
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Total Spent</TableHead>
          <TableHead>Last Order</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <CustomerRow key={customer.id} customer={customer} />
        ))}
      </TableBody>
    </Table>
  )
}

function CustomerRow({ customer }: { customer: Customer }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{customer.name}</TableCell>
      <TableCell>{customer.email}</TableCell>
      <TableCell>{customer.phone || "—"}</TableCell>
      <TableCell>{customer.orders}</TableCell>
      <TableCell>€{customer.totalSpent.toFixed(2)}</TableCell>
      <TableCell>{customer.lastOrder ? customer.lastOrder.toLocaleDateString() : "—"}</TableCell>
      <TableCell>
        <Badge variant={customer.status === "active" ? "default" : "outline"}>
          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/customers/€{customer.id}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
