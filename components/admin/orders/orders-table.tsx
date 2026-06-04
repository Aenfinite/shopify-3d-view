"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, PackageOpen, FileSpreadsheet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdminAuth } from "@/context/admin-auth-context"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  ORDER_STATUSES, STATUS_LABEL, STATUS_DOT, ORIGIN_LABEL,
} from "./status-config"

interface OrderRow {
  id: string
  order_number: string
  origin: string
  status: string
  total_value: number
  currency: string
  created_at: string
  customer_name: string
  customer_email: string
  package_name: string | null
  sub_order_count: number
}

export function OrdersTable() {
  const { can } = useAdminAuth()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("all")
  const [origin, setOrigin] = useState("all")

  function exportCsv() {
    const params = new URLSearchParams()
    if (status !== "all") params.set("status", status)
    if (origin !== "all") params.set("origin", origin)
    window.open(`/api/admin/orders/export?${params}`, "_blank")
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams()
    if (status !== "all") params.set("status", status)
    if (origin !== "all") params.set("origin", origin)
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setOrders(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setOrders([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [status, origin])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={origin} onValueChange={setOrigin}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Origin" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All origins</SelectItem>
            <SelectItem value="kickstarter">Kickstarter</SelectItem>
            <SelectItem value="shopify">Shopify</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        {can("export:run") && (
          <Button variant="outline" className="ml-auto" onClick={exportCsv}>
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 mx-auto animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <PackageOpen className="h-8 w-8 mx-auto mb-2" />
              <p>No orders yet. Import a Kickstarter Backer Report to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead className="text-center">Garments</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">{o.order_number}</Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/orders/${o.id}`} className="block">
                        <span className="font-medium">{o.customer_name || "—"}</span>
                        <span className="block text-xs text-muted-foreground">{o.customer_email}</span>
                      </Link>
                    </TableCell>
                    <TableCell><Badge variant="outline">{ORIGIN_LABEL[o.origin] ?? o.origin}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{o.package_name ?? <span className="italic">unassigned</span>}</TableCell>
                    <TableCell className="text-center">{o.sub_order_count}</TableCell>
                    <TableCell className="text-right">{o.total_value ? `${o.total_value} ${o.currency}` : "—"}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[o.status] ?? "bg-slate-400")} />
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
