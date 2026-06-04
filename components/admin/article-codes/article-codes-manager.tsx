"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Edit, Trash, Loader2, Barcode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAdminAuth } from "@/context/admin-auth-context"
import { generateArticleCode } from "@/lib/article-code/engine"
import { SEGMENTS, type SegmentKey } from "@/lib/article-code/segments"

interface SegValue { id: string; segment_no: number; code: string; label: string; supplier_code: string | null; sort_order: number }
interface Sku {
  id: string; sku_key: string; product_category: string; color: string | null; label: string | null
  fabric_composition: string | null; article_human: string; article_machine: string
}

const emptySeg = { segment_no: 1, code: "", label: "", supplier_code: "", sort_order: 0 }
const emptyCodes: Record<SegmentKey, string> = {
  target_group: "", product_category: "", fabric_family: "", fabric_type: "",
  supplier: "", supplier_article_no: "", specs_finishing: "", reserved: "",
}
const emptySku = { id: "", sku_key: "", product_category: "chino", color: "", label: "", fabric_composition: "", codes: { ...emptyCodes } }

export function ArticleCodesManager() {
  const { toast } = useToast()
  const { can } = useAdminAuth()
  const canManage = can("articleCodes:manage")

  const [segValues, setSegValues] = useState<SegValue[]>([])
  const [skus, setSkus] = useState<Sku[]>([])
  const [loading, setLoading] = useState(true)

  const [segDialog, setSegDialog] = useState(false)
  const [segForm, setSegForm] = useState<typeof emptySeg & { id?: string }>({ ...emptySeg })
  const [skuDialog, setSkuDialog] = useState(false)
  const [skuForm, setSkuForm] = useState({ ...emptySku })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/article-codes")
      const data = await res.json()
      setSegValues(data.segmentValues ?? [])
      setSkus(data.skus ?? [])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void load() }, [])

  const segByNo = useMemo(() => {
    const m = new Map<number, SegValue[]>()
    for (const s of segValues) { if (!m.has(s.segment_no)) m.set(s.segment_no, []); m.get(s.segment_no)!.push(s) }
    return m
  }, [segValues])

  const livePreview = useMemo(() => {
    try { return generateArticleCode(skuForm.codes as any) } catch { return null }
  }, [skuForm.codes])

  // ── Segment value save/delete ───────────────────────────────────────────────
  const saveSeg = async () => {
    if (!segForm.code || !segForm.label) { toast({ title: "Code and label required", variant: "destructive" }); return }
    setSaving(true)
    try {
      const res = await fetch(segForm.id ? `/api/admin/article-codes/segments/${segForm.id}` : "/api/admin/article-codes/segments", {
        method: segForm.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(segForm),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Save failed")
      toast({ title: "Segment value saved" }); setSegDialog(false); void load()
    } catch (e) { toast({ title: "Could not save", description: e instanceof Error ? e.message : String(e), variant: "destructive" }) }
    finally { setSaving(false) }
  }
  const delSeg = async (id: string) => {
    const res = await fetch(`/api/admin/article-codes/segments/${id}`, { method: "DELETE" })
    if (res.ok) { setSegValues((v) => v.filter((x) => x.id !== id)); toast({ title: "Deleted" }) }
  }

  // ── SKU save/delete ─────────────────────────────────────────────────────────
  const saveSku = async () => {
    if (!skuForm.sku_key || !skuForm.product_category) { toast({ title: "SKU key and category required", variant: "destructive" }); return }
    setSaving(true)
    try {
      const body = {
        sku_key: skuForm.sku_key, product_category: skuForm.product_category, color: skuForm.color,
        label: skuForm.label, fabric_composition: skuForm.fabric_composition, codes: skuForm.codes,
      }
      const res = await fetch(skuForm.id ? `/api/admin/article-codes/skus/${skuForm.id}` : "/api/admin/article-codes/skus", {
        method: skuForm.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Save failed")
      toast({ title: "SKU saved" }); setSkuDialog(false); void load()
    } catch (e) { toast({ title: "Could not save", description: e instanceof Error ? e.message : String(e), variant: "destructive" }) }
    finally { setSaving(false) }
  }
  const delSku = async (id: string) => {
    const res = await fetch(`/api/admin/article-codes/skus/${id}`, { method: "DELETE" })
    if (res.ok) { setSkus((v) => v.filter((x) => x.id !== id)); toast({ title: "Deleted" }) }
  }

  if (loading) return <Card><CardContent className="p-12 text-center text-muted-foreground"><Loader2 className="h-6 w-6 mx-auto animate-spin" /></CardContent></Card>

  return (
    <div className="space-y-8">
      {/* SKU REGISTRY */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><Barcode className="h-4 w-4" /> Product SKUs &amp; Article Codes</CardTitle>
          {canManage && <Button size="sm" onClick={() => { setSkuForm({ ...emptySku, codes: { ...emptyCodes } }); setSkuDialog(true) }}><Plus className="h-4 w-4 mr-2" />New SKU</Button>}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>SKU</TableHead><TableHead>Item</TableHead><TableHead>Colour</TableHead>
              <TableHead>Article (human)</TableHead><TableHead>Machine</TableHead>{canManage && <TableHead />}
            </TableRow></TableHeader>
            <TableBody>
              {skus.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No SKUs. Run migration 004 to seed SAFE CHINO, or add one.</TableCell></TableRow>}
              {skus.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.sku_key}</TableCell>
                  <TableCell className="capitalize">{s.product_category}</TableCell>
                  <TableCell>{s.color ?? "—"}</TableCell>
                  <TableCell className="font-mono text-sm font-semibold">{s.article_human}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.article_machine}</TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSkuForm({
                          id: s.id, sku_key: s.sku_key, product_category: s.product_category, color: s.color ?? "",
                          label: s.label ?? "", fabric_composition: s.fabric_composition ?? "", codes: { ...emptyCodes },
                        }); setSkuDialog(true)
                      }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => delSku(s.id)}><Trash className="h-4 w-4" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SEGMENT LOOKUPS */}
      {SEGMENTS.map((seg) => (
        <Card key={seg.no}>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Badge variant="outline">#{seg.no}</Badge>{seg.name}<span className="text-muted-foreground font-normal">· {seg.width} digits{seg.required ? "" : " · optional"}</span>
            </CardTitle>
            {canManage && <Button variant="ghost" size="sm" onClick={() => { setSegForm({ ...emptySeg, segment_no: seg.no }); setSegDialog(true) }}><Plus className="h-4 w-4 mr-1" />Add value</Button>}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Label</TableHead><TableHead>Supplier scope</TableHead>{canManage && <TableHead />}</TableRow></TableHeader>
              <TableBody>
                {(segByNo.get(seg.no) ?? []).length === 0 && <TableRow><TableCell colSpan={4} className="text-muted-foreground text-sm py-3">No values.</TableCell></TableRow>}
                {(segByNo.get(seg.no) ?? []).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono">{v.code}</TableCell>
                    <TableCell>{v.label}</TableCell>
                    <TableCell className="text-muted-foreground">{v.supplier_code ?? "—"}</TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setSegForm({ id: v.id, segment_no: v.segment_no, code: v.code, label: v.label, supplier_code: v.supplier_code ?? "", sort_order: v.sort_order }); setSegDialog(true) }}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => delSeg(v.id)}><Trash className="h-4 w-4" /></Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Segment value dialog */}
      <Dialog open={segDialog} onOpenChange={setSegDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{segForm.id ? "Edit" : "Add"} value · segment #{segForm.segment_no}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Code (digits)</Label><Input value={segForm.code} onChange={(e) => setSegForm({ ...segForm, code: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Label</Label><Input value={segForm.label} onChange={(e) => setSegForm({ ...segForm, label: e.target.value })} /></div>
            {segForm.segment_no === 6 && <div className="space-y-1.5"><Label>Supplier code (scope)</Label><Input value={segForm.supplier_code} onChange={(e) => setSegForm({ ...segForm, supplier_code: e.target.value })} placeholder="021" /></div>}
            <div className="space-y-1.5"><Label>Sort order</Label><Input type="number" value={segForm.sort_order} onChange={(e) => setSegForm({ ...segForm, sort_order: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSegDialog(false)}>Cancel</Button>
            <Button onClick={saveSeg} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SKU dialog */}
      <Dialog open={skuDialog} onOpenChange={setSkuDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{skuForm.id ? "Edit SKU" : "New SKU"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>SKU key</Label><Input value={skuForm.sku_key} onChange={(e) => setSkuForm({ ...skuForm, sku_key: e.target.value })} placeholder="chino:midnight-navy" /></div>
              <div className="space-y-1.5"><Label>Category</Label>
                <Select value={skuForm.product_category} onValueChange={(v) => setSkuForm({ ...skuForm, product_category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["chino", "shirt", "belt"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Colour value</Label><Input value={skuForm.color} onChange={(e) => setSkuForm({ ...skuForm, color: e.target.value })} placeholder="midnight-navy" /></div>
              <div className="space-y-1.5"><Label>Fabric composition</Label><Input value={skuForm.fabric_composition} onChange={(e) => setSkuForm({ ...skuForm, fabric_composition: e.target.value })} placeholder="70% PES / 30% Viscose" /></div>
            </div>
            <div className="space-y-2 rounded-md border border-border p-3">
              <p className="text-sm font-medium">Segment codes</p>
              <div className="grid grid-cols-2 gap-2">
                {SEGMENTS.map((seg) => (
                  <div key={seg.key} className="space-y-1">
                    <Label className="text-xs">#{seg.no} {seg.name} ({seg.width})</Label>
                    <Input value={skuForm.codes[seg.key]} onChange={(e) => setSkuForm({ ...skuForm, codes: { ...skuForm.codes, [seg.key]: e.target.value } })} placeholder={"0".repeat(seg.width)} />
                  </div>
                ))}
              </div>
              {livePreview && (
                <p className="text-xs text-muted-foreground">Preview: <span className="font-mono font-semibold text-foreground">{livePreview.human || "—"}</span> · machine <span className="font-mono">{livePreview.machine || "—"}</span></p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkuDialog(false)}>Cancel</Button>
            <Button onClick={saveSku} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save SKU</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
