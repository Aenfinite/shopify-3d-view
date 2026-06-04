"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft, Loader2, User, Package as PackageIcon, Shirt,
  Settings2, Ruler, RefreshCw, FileDown, FileSpreadsheet, Tag,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAdminAuth } from "@/context/admin-auth-context"
import { cn } from "@/lib/utils"
import {
  ORDER_STATUSES, SUB_ORDER_STATUSES, STATUS_LABEL, STATUS_DOT, ORIGIN_LABEL,
} from "./status-config"
import { ArticleCodeBadge } from "./article-code-badge"
import { SubOrderConfigurator, type ConfiguratorResult } from "./sub-order-configurator"
import { MeasurementDialog } from "./measurement-dialog"
import { needsMeasurements } from "@/lib/measurements/fields"

interface SubOrder {
  id: string; package_slot_index: number; garment_type: string; status: string
  item_type: string | null; color: string | null; sub_order_ref: string | null
  article_code_human: string | null; article_code_barcode: string | null
  configurator_selections?: Record<string, unknown>
  measurement_id?: string | null
}
interface OrderDetailData {
  id: string; order_number: string; origin: string; status: string
  kickstarter_ref: string | null; packing_note: string | null
  total_value: number; currency: string; notes: string | null; created_at: string
  customer: { name: string; email: string; phone: string | null; shipping_address: Record<string, unknown> | null } | null
  package: { code: string; name: string; garment_count: number } | null
  sub_orders: SubOrder[]
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const { toast } = useToast()
  const { can } = useAdminAuth()
  const canConfigure = can("orders:configure")
  const canMeasure = can("measurements:edit")
  const canExport = can("export:run")
  const canGenerate = can("articleCodes:generate")

  const [order, setOrder] = useState<OrderDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [configuring, setConfiguring] = useState<SubOrder | null>(null)
  const [measuring, setMeasuring] = useState<SubOrder | null>(null)
  const [regenerating, setRegenerating] = useState<string | null>(null)

  const load = useCallback(() => {
    let cancelled = false
    fetch(`/api/admin/orders/${orderId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (!cancelled) setOrder(data) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [orderId])

  useEffect(() => load(), [load])

  async function setOrderStatus(status: string) {
    const prev = order
    setOrder((o) => (o ? { ...o, status } : o))
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    })
    if (!res.ok) { setOrder(prev); toast({ title: "Update failed", variant: "destructive" }) }
  }

  async function setSubStatus(subId: string, status: string) {
    const prev = order
    setOrder((o) => (o ? { ...o, sub_orders: o.sub_orders.map((s) => (s.id === subId ? { ...s, status } : s)) } : o))
    const res = await fetch(`/api/admin/sub-orders/${subId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    })
    if (!res.ok) { setOrder(prev); toast({ title: "Update failed", variant: "destructive" }) }
  }

  function applyCode(subId: string, result: ConfiguratorResult) {
    setOrder((o) => o ? {
      ...o,
      sub_orders: o.sub_orders.map((s) => s.id === subId
        ? { ...s, article_code_human: result.articleCodeHuman ?? s.article_code_human, article_code_barcode: result.articleCodeBarcode ?? s.article_code_barcode }
        : s),
    } : o)
  }

  async function regenerate(subId: string) {
    setRegenerating(subId)
    try {
      const res = await fetch(`/api/admin/sub-orders/${subId}/article-code`, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed")
      applyCode(subId, { articleCodeHuman: data.human, articleCodeBarcode: data.barcode })
      toast({ title: "Article code regenerated" })
    } catch (e) {
      toast({ title: "Could not regenerate", description: e instanceof Error ? e.message : String(e), variant: "destructive" })
    } finally {
      setRegenerating(null)
    }
  }

  function download(format: "pdf" | "csv") {
    window.open(`/api/admin/orders/${orderId}/export?format=${format}`, "_blank")
  }

  if (loading) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="h-6 w-6 mx-auto animate-spin" /></div>
  if (!order) return <p className="text-muted-foreground">Order not found.</p>

  const addr = order.customer?.shipping_address as Record<string, string> | null

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {order.order_number}
            <Badge variant="outline">{ORIGIN_LABEL[order.origin] ?? order.origin}</Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            {order.kickstarter_ref && <span className="font-mono mr-2">KS {order.kickstarter_ref}</span>}
            {order.total_value ? `${order.total_value} ${order.currency}` : "No value"} · {new Date(order.created_at).toLocaleDateString()}
            {order.packing_note && <span className="block text-xs">{order.packing_note}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canExport && (
            <>
              <Button variant="outline" size="sm" onClick={() => download("pdf")}>
                <FileDown className="h-4 w-4 mr-2" /> Production sheet
              </Button>
              <Button variant="outline" size="sm" onClick={() => download("csv")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" /> CSV
              </Button>
            </>
          )}
          <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT[order.status] ?? "bg-slate-400")} />
          <Select value={order.status} onValueChange={setOrderStatus}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" /> Customer</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{order.customer?.name || "—"}</p>
            <p className="text-muted-foreground">{order.customer?.email}</p>
            {order.customer?.phone && <p className="text-muted-foreground">{order.customer.phone}</p>}
            {addr && Object.values(addr).some(Boolean) ? (
              <p className="text-muted-foreground pt-2">
                {[addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(", ")}
              </p>
            ) : (
              <p className="text-muted-foreground pt-2 italic">No shipping address yet (collected via KS survey later).</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><PackageIcon className="h-4 w-4" /> Package</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            {order.package ? (
              <>
                <p className="font-medium">{order.package.name}</p>
                <p className="text-muted-foreground">Code: {order.package.code}</p>
                <p className="text-muted-foreground">{order.package.garment_count} garment(s) per package</p>
              </>
            ) : (
              <p className="text-muted-foreground italic">No package matched. Define the tier under Packages, then re-import.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Shirt className="h-4 w-4" /> Sub-orders ({order.sub_orders.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {order.sub_orders.length === 0 && <p className="text-sm text-muted-foreground">No sub-orders.</p>}
          {order.sub_orders.map((s) => {
            const item = s.item_type ?? s.garment_type
            return (
            <div key={s.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  <span className="font-mono text-xs text-muted-foreground mr-2">{s.sub_order_ref ?? `slot ${s.package_slot_index + 1}`}</span>
                  <span className="font-medium capitalize">{item}</span>
                  {s.color && <span className="text-muted-foreground"> · {s.color}</span>}
                  {s.measurement_id && <Badge variant="outline" className="ml-2 text-xs">measured</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[s.status] ?? "bg-slate-400")} />
                  <Select value={s.status} onValueChange={(v) => setSubStatus(s.id, v)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUB_ORDER_STATUSES.map((st) => <SelectItem key={st} value={st}>{STATUS_LABEL[st]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ArticleCodeBadge human={s.article_code_human} barcode={s.article_code_barcode} />

              <div className="flex flex-wrap gap-2">
                {canConfigure && (
                  <Button variant="secondary" size="sm" onClick={() => setConfiguring(s)}>
                    <Settings2 className="h-4 w-4 mr-2" /> Configure
                  </Button>
                )}
                {canMeasure && needsMeasurements(item) && (
                  <Button variant="secondary" size="sm" onClick={() => setMeasuring(s)}>
                    <Ruler className="h-4 w-4 mr-2" /> Measurements
                  </Button>
                )}
                {canGenerate && (
                  <Button variant="ghost" size="sm" onClick={() => regenerate(s.id)} disabled={regenerating === s.id}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", regenerating === s.id && "animate-spin")} /> Regenerate code
                  </Button>
                )}
                {s.article_code_barcode && (
                  <Button variant="ghost" size="sm" onClick={() => window.open(`/api/admin/sub-orders/${s.id}/label`, "_blank")}>
                    <Tag className="h-4 w-4 mr-2" /> Barcode label
                  </Button>
                )}
              </div>
            </div>
          )})}
        </CardContent>
      </Card>

      {configuring && (
        <SubOrderConfigurator
          subOrderId={configuring.id}
          itemType={configuring.item_type ?? configuring.garment_type}
          open={!!configuring}
          onOpenChange={(o) => { if (!o) setConfiguring(null) }}
          onSaved={(result) => { applyCode(configuring.id, result); load() }}
          canEdit={canConfigure}
        />
      )}

      {measuring && (
        <MeasurementDialog
          subOrderId={measuring.id}
          garmentType={measuring.item_type ?? measuring.garment_type}
          open={!!measuring}
          onOpenChange={(o) => { if (!o) setMeasuring(null) }}
          onSaved={() => load()}
          canEdit={canMeasure}
        />
      )}
    </div>
  )
}
