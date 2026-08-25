"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Plus, Edit, Trash, Loader2, Barcode, Download, Info } from "lucide-react"
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

// ─── Types ──────────────────────────────────────────────────────────────────

interface SegValue { id: string; segment_no: number; code: string; label: string; supplier_code: string | null; sort_order: number }
interface Sku {
  id: string; sku_key: string; product_category: string; color: string | null; label: string | null
  fabric_composition: string | null; article_human: string; article_machine: string
}
interface MaterialSpecItem {
  id: string; spec_id: string; supplier_code: string | null; supplier_name: string | null
  supplier_article_number: string | null; supplier_colour_number: string | null
  supplier_colour_name: string | null; our_colour_code: string | null
  fabric_type: string | null; fabric_composition: string | null
  fabric_weight_gsm: string | null; finishings: string[]
}
interface Colour {
  id: string; code: string; label: string; family_label: string
  family_range_start: number; sort_order: number
}

const emptyCodes: Record<SegmentKey, string> = {
  target_group: "", product_category: "", fabric_family: "", fabric_type: "",
  supplier: "", our_colour: "", reserved: "000", material_spec_id: "",
}
const emptySku = {
  id: "", sku_key: "", product_category: "", color: "", label: "",
  fabric_composition: "", codes: { ...emptyCodes },
  selectedMaterialId: "",
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ArticleCodesManager() {
  const { toast } = useToast()
  const { can } = useAdminAuth()
  const canManage = can("articleCodes:manage")

  const [segValues, setSegValues] = useState<SegValue[]>([])
  const [skus, setSkus] = useState<Sku[]>([])
  const [loading, setLoading] = useState(true)

  // Material specs + colours for the New SKU dialog
  const [materialSpecs, setMaterialSpecs] = useState<MaterialSpecItem[]>([])
  const [colours, setColours] = useState<Colour[]>([])

  const [segDialog, setSegDialog] = useState(false)
  const [segForm, setSegForm] = useState<{ id?: string; segment_no: number; code: string; label: string; supplier_code: string; sort_order: number }>({
    segment_no: 1, code: "", label: "", supplier_code: "", sort_order: 0,
  })
  const [skuDialog, setSkuDialog] = useState(false)
  const [skuForm, setSkuForm] = useState({ ...emptySku })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [acRes, matRes] = await Promise.all([
        fetch("/api/admin/article-codes"),
        fetch("/api/admin/materials"),
      ])
      const acData = await acRes.json()
      const matData = await matRes.json()
      setSegValues(acData.segmentValues ?? [])
      setSkus(acData.skus ?? [])
      setMaterialSpecs(matData.specs ?? [])
      setColours(matData.colours ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  // ── Segment values grouped by number ──────────────────────────────────────

  const segByNo = useMemo(() => {
    const m = new Map<number, SegValue[]>()
    for (const s of segValues) { if (!m.has(s.segment_no)) m.set(s.segment_no, []); m.get(s.segment_no)!.push(s) }
    return m
  }, [segValues])

  // ── Material specs filtered by selected supplier ──────────────────────────

  const filteredMaterialSpecs = useMemo(() => {
    if (!skuForm.codes.supplier) return materialSpecs
    return materialSpecs.filter((m) => m.supplier_code === skuForm.codes.supplier)
  }, [materialSpecs, skuForm.codes.supplier])

  // ── Selected material spec info ───────────────────────────────────────────

  const selectedMaterial = useMemo(() => {
    if (!skuForm.selectedMaterialId) return null
    return materialSpecs.find((m) => m.id === skuForm.selectedMaterialId) ?? null
  }, [materialSpecs, skuForm.selectedMaterialId])

  // ── Live preview ──────────────────────────────────────────────────────────

  const livePreview = useMemo(() => {
    try { return generateArticleCode(skuForm.codes as any) } catch { return null }
  }, [skuForm.codes])

  // ── Colour lookup ─────────────────────────────────────────────────────────

  const getColourInfo = (code: string | null) => {
    if (!code) return null
    return colours.find((c) => c.code === code)
  }

  // ── Colour families for dropdown ──────────────────────────────────────────

  const colourFamilies = useMemo(() => {
    const families = new Map<number, string>()
    for (const c of colours) {
      if (!families.has(c.family_range_start)) {
        families.set(c.family_range_start, c.family_label)
      }
    }
    return Array.from(families.entries()).sort((a, b) => a[0] - b[0])
  }, [colours])

  // ── Segment value save/delete ─────────────────────────────────────────────

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

  // ── SKU save/delete ───────────────────────────────────────────────────────

  const saveSkuAction = async () => {
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

  // ── Material spec selection handler ───────────────────────────────────────

  const handleMaterialSelect = (materialId: string) => {
    const mat = materialSpecs.find((m) => m.id === materialId)
    if (!mat) return
    setSkuForm((prev) => ({
      ...prev,
      selectedMaterialId: materialId,
      fabric_composition: mat.fabric_composition ?? prev.fabric_composition,
      color: mat.supplier_colour_name ?? prev.color,
      codes: {
        ...prev.codes,
        supplier: mat.supplier_code ?? prev.codes.supplier,
        our_colour: mat.our_colour_code ?? prev.codes.our_colour,
        material_spec_id: mat.spec_id,
      },
    }))
  }

  // ── Dropdown change for segment codes ─────────────────────────────────────

  const handleSegmentDropdown = (key: SegmentKey, value: string) => {
    setSkuForm((prev) => ({
      ...prev,
      codes: { ...prev.codes, [key]: value },
      // Reset material spec when supplier changes
      ...(key === "supplier" ? { selectedMaterialId: "" } : {}),
    }))
  }

  // ── Export SKU CSV ────────────────────────────────────────────────────────

  const exportSkuCsv = () => {
    window.open("/api/admin/article-codes/export", "_blank")
  }

  if (loading) return <Card><CardContent className="p-12 text-center text-muted-foreground"><Loader2 className="h-6 w-6 mx-auto animate-spin" /></CardContent></Card>

  return (
    <div className="space-y-8">
      {/* SKU REGISTRY */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><Barcode className="h-4 w-4" /> Product SKUs &amp; Article Codes</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportSkuCsv}>
              <Download className="h-4 w-4 mr-2" />Export CSV
            </Button>
            {canManage && <Button size="sm" onClick={() => { setSkuForm({ ...emptySku, codes: { ...emptyCodes } }); setSkuDialog(true) }}><Plus className="h-4 w-4 mr-2" />New SKU</Button>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>SKU</TableHead><TableHead>Item</TableHead><TableHead>Colour</TableHead>
              <TableHead>Article (human)</TableHead><TableHead>Machine</TableHead>{canManage && <TableHead />}
            </TableRow></TableHeader>
            <TableBody>
              {skus.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No SKUs yet. Click &quot;New SKU&quot; to create one.</TableCell></TableRow>}
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
                          label: s.label ?? "", fabric_composition: s.fabric_composition ?? "",
                          codes: { ...emptyCodes }, selectedMaterialId: "",
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
            {canManage && <Button variant="ghost" size="sm" onClick={() => { setSegForm({ segment_no: seg.no, code: "", label: "", supplier_code: "", sort_order: 0 }); setSegDialog(true) }}><Plus className="h-4 w-4 mr-1" />Add value</Button>}
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

      {/* NEW SKU DIALOG — dropdown-based */}
      <Dialog open={skuDialog} onOpenChange={setSkuDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{skuForm.id ? "Edit SKU" : "New SKU"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>SKU key</Label>
                <Input value={skuForm.sku_key} onChange={(e) => setSkuForm({ ...skuForm, sku_key: e.target.value })} placeholder="chino:midnight-navy" />
              </div>
              <div className="space-y-1.5">
                <Label>Label</Label>
                <Input value={skuForm.label} onChange={(e) => setSkuForm({ ...skuForm, label: e.target.value })} placeholder="SAFE CHINO — Midnight Navy" />
              </div>
            </div>

            {/* Segment dropdowns */}
            <div className="border rounded-md p-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Barcode className="h-4 w-4" /> SKU Segments (22 digits)
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* 1. Target Group */}
                <div className="space-y-1.5">
                  <Label className="text-xs">#1 Target Group (1 digit)</Label>
                  <Select value={skuForm.codes.target_group || "none"} onValueChange={(v) => handleSegmentDropdown("target_group", v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Select —</SelectItem>
                      {(segByNo.get(1) ?? []).map((v) => (
                        <SelectItem key={v.id} value={v.code}>{v.code} — {v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Product Category */}
                <div className="space-y-1.5">
                  <Label className="text-xs">#2 Product Category (2 digits)</Label>
                  <Select value={skuForm.codes.product_category || "none"} onValueChange={(v) => {
                    handleSegmentDropdown("product_category", v === "none" ? "" : v)
                    const seg = (segByNo.get(2) ?? []).find((s) => s.code === v)
                    if (seg) setSkuForm((prev) => ({ ...prev, product_category: seg.label.toLowerCase() }))
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Select —</SelectItem>
                      {(segByNo.get(2) ?? []).map((v) => (
                        <SelectItem key={v.id} value={v.code}>{v.code} — {v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Fabric Family */}
                <div className="space-y-1.5">
                  <Label className="text-xs">#3 Fabric Family (2 digits)</Label>
                  <Select value={skuForm.codes.fabric_family || "none"} onValueChange={(v) => handleSegmentDropdown("fabric_family", v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Select —</SelectItem>
                      {(segByNo.get(3) ?? []).map((v) => (
                        <SelectItem key={v.id} value={v.code}>{v.code} — {v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 4. Fabric Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs">#4 Fabric Type (2 digits)</Label>
                  <Select value={skuForm.codes.fabric_type || "none"} onValueChange={(v) => handleSegmentDropdown("fabric_type", v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Select —</SelectItem>
                      {(segByNo.get(4) ?? []).map((v) => (
                        <SelectItem key={v.id} value={v.code}>{v.code} — {v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 5. Supplier */}
                <div className="space-y-1.5">
                  <Label className="text-xs">#5 Supplier (3 digits)</Label>
                  <Select value={skuForm.codes.supplier || "none"} onValueChange={(v) => handleSegmentDropdown("supplier", v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Select —</SelectItem>
                      {(segByNo.get(5) ?? []).map((v) => (
                        <SelectItem key={v.id} value={v.code}>{v.code} — {v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 6. Our Colour */}
                <div className="space-y-1.5">
                  <Label className="text-xs">#6 Our Colour (3 digits)</Label>
                  <Select value={skuForm.codes.our_colour || "none"} onValueChange={(v) => handleSegmentDropdown("our_colour", v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Select —</SelectItem>
                      {colourFamilies.map(([rangeStart, familyLabel]) => {
                        const familyColours = colours.filter((c) => c.family_range_start === rangeStart)
                        return familyColours.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} — {c.label} ({familyLabel})
                          </SelectItem>
                        ))
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 7. Reserved — read-only */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">#7 Reserved (3 digits)</Label>
                  <Input value="000" disabled className="font-mono bg-muted" />
                </div>

                {/* 8. Material Specification */}
                <div className="space-y-1.5">
                  <Label className="text-xs">#8 Material Spec ID (6 digits) — auto</Label>
                  <Input value={skuForm.codes.material_spec_id || ""} disabled className="font-mono bg-muted" placeholder="Auto-filled" />
                </div>
              </div>

              {/* Material Spec Picker */}
              <div className="space-y-1.5 border-t pt-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" /> Select Material Specification
                  {!skuForm.codes.supplier && <span className="text-xs text-muted-foreground font-normal">(select a supplier first)</span>}
                </Label>
                <Select
                  value={skuForm.selectedMaterialId || "none"}
                  onValueChange={(v) => v !== "none" && handleMaterialSelect(v)}
                  disabled={!skuForm.codes.supplier}
                >
                  <SelectTrigger><SelectValue placeholder="Select material specification" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Select material —</SelectItem>
                    {filteredMaterialSpecs.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.spec_id} — {m.supplier_article_number ?? "?"} — {m.supplier_colour_name ?? "No colour"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Material info card */}
              {selectedMaterial && (
                <div className="bg-accent/50 rounded-md p-3 text-sm space-y-1 border">
                  <p className="font-medium">Material Specification: {selectedMaterial.spec_id}</p>
                  <p>Supplier: {selectedMaterial.supplier_name} ({selectedMaterial.supplier_code})</p>
                  <p>Article #: {selectedMaterial.supplier_article_number}</p>
                  <p>Colour: {selectedMaterial.supplier_colour_name} ({selectedMaterial.supplier_colour_number})</p>
                  {selectedMaterial.fabric_composition && <p>Composition: {selectedMaterial.fabric_composition}</p>}
                  {selectedMaterial.fabric_weight_gsm && <p>Weight: {selectedMaterial.fabric_weight_gsm} GSM</p>}
                  {(selectedMaterial.finishings ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedMaterial.finishings.map((f, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Live preview */}
              {livePreview && (
                <div className="border-t pt-2">
                  <p className="text-xs text-muted-foreground">
                    Preview: <span className="font-mono font-semibold text-foreground">{livePreview.human || "—"}</span>
                    {" · "}machine <span className="font-mono">{livePreview.machine || "—"}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Additional fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Colour value</Label>
                <Input value={skuForm.color} onChange={(e) => setSkuForm({ ...skuForm, color: e.target.value })} placeholder="midnight-navy" />
              </div>
              <div className="space-y-1.5">
                <Label>Fabric composition</Label>
                <Input value={skuForm.fabric_composition} onChange={(e) => setSkuForm({ ...skuForm, fabric_composition: e.target.value })} placeholder="70% PES / 30% Viscose" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSkuDialog(false)}>Cancel</Button>
            <Button onClick={saveSkuAction} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save SKU</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
