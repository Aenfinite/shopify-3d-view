"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Plus, Edit, Trash, Loader2, Search, Download, Database, X, Check, Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useAdminAuth } from "@/context/admin-auth-context"

// ─── Types ──────────────────────────────────────────────────────────────────

interface Finishing { id: string; code: string; label: string; sort_order: number }
interface Colour {
  id: string; code: string; label: string; family_label: string
  family_range_start: number; sort_order: number
}
interface MaterialSpecItem {
  id: string; spec_id: string; supplier_code: string | null; supplier_name: string | null
  supplier_article_number: string | null; supplier_colour_number: string | null
  supplier_colour_name: string | null; our_colour_code: string | null
  fabric_type: string | null; fabric_composition: string | null
  fabric_weight_gsm: string | null; notes: string | null; finishings: string[]
  created_at: string
}

interface FormData {
  supplier_code: string; supplier_name: string; supplier_article_number: string
  supplier_colour_number: string; supplier_colour_name: string; our_colour_code: string
  fabric_type: string; product_specification: string; fabric_composition: string
  fabric_width: string; fabric_weight_gsm: string; fabric_construction: string
  notes: string; finishing_ids: string[]
}

const emptyForm: FormData = {
  supplier_code: "", supplier_name: "", supplier_article_number: "",
  supplier_colour_number: "", supplier_colour_name: "", our_colour_code: "",
  fabric_type: "", product_specification: "", fabric_composition: "",
  fabric_width: "", fabric_weight_gsm: "", fabric_construction: "",
  notes: "", finishing_ids: [],
}

// ─── Component ──────────────────────────────────────────────────────────────

export function MaterialsManager() {
  const { toast } = useToast()
  const { can } = useAdminAuth()
  const canManage = can("articleCodes:manage")

  const [specs, setSpecs] = useState<MaterialSpecItem[]>([])
  const [finishings, setFinishings] = useState<Finishing[]>([])
  const [colours, setColours] = useState<Colour[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSupplier, setFilterSupplier] = useState("all")
  const [filterFabricType, setFilterFabricType] = useState("all")

  // Dialog state
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  // ── Segment values for supplier dropdown ──
  const [segValues, setSegValues] = useState<Array<{ code: string; label: string; segment_no: number }>>([])

  // ── Data loading ──────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [matRes, segRes] = await Promise.all([
        fetch("/api/admin/materials"),
        fetch("/api/admin/article-codes"),
      ])
      const matData = await matRes.json()
      const segData = await segRes.json()
      setSpecs(matData.specs ?? [])
      setFinishings(matData.finishings ?? [])
      setColours(matData.colours ?? [])
      setSegValues(segData.segmentValues ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  // ── Derived data ──────────────────────────────────────────────────────────

  const suppliers = useMemo(
    () => segValues.filter((v) => v.segment_no === 5),
    [segValues],
  )

  const fabricTypes = useMemo(
    () => segValues.filter((v) => v.segment_no === 4),
    [segValues],
  )

  const colourFamilies = useMemo(() => {
    const families = new Map<number, string>()
    for (const c of colours) {
      if (!families.has(c.family_range_start)) {
        families.set(c.family_range_start, c.family_label)
      }
    }
    return Array.from(families.entries()).sort((a, b) => a[0] - b[0])
  }, [colours])

  const uniqueSuppliers = useMemo(() => {
    const set = new Map<string, string>()
    for (const s of specs) {
      if (s.supplier_code && s.supplier_name) {
        set.set(s.supplier_code, s.supplier_name)
      }
    }
    return Array.from(set.entries())
  }, [specs])

  const uniqueFabricTypes = useMemo(() => {
    const set = new Set<string>()
    for (const s of specs) if (s.fabric_type) set.add(s.fabric_type)
    return Array.from(set).sort()
  }, [specs])

  // ── Filtered specs ────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = specs
    if (filterSupplier !== "all") {
      result = result.filter((s) => s.supplier_code === filterSupplier)
    }
    if (filterFabricType !== "all") {
      result = result.filter((s) => s.fabric_type === filterFabricType)
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter((s) =>
        s.spec_id.includes(q) ||
        (s.supplier_name?.toLowerCase().includes(q)) ||
        (s.supplier_article_number?.toLowerCase().includes(q)) ||
        (s.supplier_colour_name?.toLowerCase().includes(q)) ||
        (s.fabric_composition?.toLowerCase().includes(q)) ||
        (s.our_colour_code?.includes(q)),
      )
    }
    return result
  }, [specs, filterSupplier, filterFabricType, searchTerm])

  // ── Dialog handlers ───────────────────────────────────────────────────────

  const openNew = () => {
    setEditId(null)
    setForm({ ...emptyForm })
    setDialog(true)
  }

  const openEdit = async (id: string) => {
    setEditId(id)
    try {
      const res = await fetch(`/api/admin/materials/${id}`)
      const data = await res.json()
      setForm({
        supplier_code: data.supplier_code ?? "",
        supplier_name: data.supplier_name ?? "",
        supplier_article_number: data.supplier_article_number ?? "",
        supplier_colour_number: data.supplier_colour_number ?? "",
        supplier_colour_name: data.supplier_colour_name ?? "",
        our_colour_code: data.our_colour_code ?? "",
        fabric_type: data.fabric_type ?? "",
        product_specification: data.product_specification ?? "",
        fabric_composition: data.fabric_composition ?? "",
        fabric_width: data.fabric_width ?? "",
        fabric_weight_gsm: data.fabric_weight_gsm ?? "",
        fabric_construction: data.fabric_construction ?? "",
        notes: data.notes ?? "",
        finishing_ids: (data.finishings ?? []).map((f: Finishing) => f.id),
      })
      setDialog(true)
    } catch {
      toast({ title: "Failed to load material", variant: "destructive" })
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const url = editId ? `/api/admin/materials/${editId}` : "/api/admin/materials"
      const method = editId ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Save failed")
      }
      const data = await res.json()
      toast({ title: editId ? "Material updated" : `Material created — Spec ID: ${data.spec_id}` })
      setDialog(false)
      void load()
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : String(e), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: string) => {
    if (!confirm("Delete this material specification?")) return
    const res = await fetch(`/api/admin/materials/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast({ title: "Deleted" })
      void load()
    } else {
      toast({ title: "Delete failed", variant: "destructive" })
    }
  }

  const exportCsv = () => {
    window.open("/api/admin/materials/export", "_blank")
  }

  // ── Finishing toggle ──────────────────────────────────────────────────────

  const toggleFinishing = (fid: string) => {
    setForm((prev) => ({
      ...prev,
      finishing_ids: prev.finishing_ids.includes(fid)
        ? prev.finishing_ids.filter((id) => id !== fid)
        : [...prev.finishing_ids, fid],
    }))
  }

  // ── Supplier selection auto-fill name ─────────────────────────────────────

  const handleSupplierChange = (code: string) => {
    const supplier = suppliers.find((s) => s.code === code)
    setForm((prev) => ({
      ...prev,
      supplier_code: code,
      supplier_name: supplier?.label ?? prev.supplier_name,
    }))
  }

  // ── Get colour info ───────────────────────────────────────────────────────

  const getColourInfo = (code: string | null) => {
    if (!code) return null
    return colours.find((c) => c.code === code)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 mx-auto animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search & filters bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[240px]">
              <Label className="text-xs text-muted-foreground">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by spec ID, supplier, article #, colour..."
                  className="pl-9"
                />
                {searchTerm && (
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setSearchTerm("")}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="w-[180px]">
              <Label className="text-xs text-muted-foreground">Supplier</Label>
              <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All suppliers</SelectItem>
                  {uniqueSuppliers.map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[180px]">
              <Label className="text-xs text-muted-foreground">Fabric Type</Label>
              <Select value={filterFabricType} onValueChange={setFilterFabricType}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {uniqueFabricTypes.map((ft) => (
                    <SelectItem key={ft} value={ft}>{ft}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {canManage && (
                <Button size="sm" onClick={openNew}>
                  <Plus className="h-4 w-4 mr-2" />Add Material
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={exportCsv}>
                <Download className="h-4 w-4 mr-2" />Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material Specifications Table */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" />
            Material Specifications
            <Badge variant="secondary" className="ml-2">{filtered.length} records</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">Spec ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Article #</TableHead>
                  <TableHead>Supplier Colour</TableHead>
                  <TableHead>Our Colour</TableHead>
                  <TableHead>Composition</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Finishings</TableHead>
                  {canManage && <TableHead className="w-[80px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 9 : 8} className="text-center text-muted-foreground py-8">
                      {specs.length === 0
                        ? "No material specifications yet. Click \"Add Material\" to create one."
                        : "No results match your filters."}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((s) => {
                  const colourInfo = getColourInfo(s.our_colour_code)
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm font-semibold">{s.spec_id}</TableCell>
                      <TableCell>
                        <div className="text-sm">{s.supplier_name ?? "—"}</div>
                        {s.supplier_code && <div className="text-xs text-muted-foreground font-mono">{s.supplier_code}</div>}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{s.supplier_article_number ?? "—"}</TableCell>
                      <TableCell>
                        <div className="text-sm">{s.supplier_colour_name ?? "—"}</div>
                        {s.supplier_colour_number && <div className="text-xs text-muted-foreground">{s.supplier_colour_number}</div>}
                      </TableCell>
                      <TableCell>
                        {colourInfo ? (
                          <div>
                            <div className="text-sm">{colourInfo.label}</div>
                            <div className="text-xs text-muted-foreground">{colourInfo.family_label} · {s.our_colour_code}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{s.our_colour_code ?? "—"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm max-w-[160px] truncate">{s.fabric_composition ?? "—"}</TableCell>
                      <TableCell className="text-sm">{s.fabric_weight_gsm ? `${s.fabric_weight_gsm} GSM` : "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(s.finishings ?? []).length === 0 && <span className="text-muted-foreground text-sm">—</span>}
                          {(s.finishings ?? []).map((f, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => del(s.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Material Specification" : "New Material Specification"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Supplier */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <Select value={form.supplier_code || "none"} onValueChange={(v) => handleSupplierChange(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Select supplier —</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.code} value={s.code}>{s.code} — {s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Supplier Article / Quality Number</Label>
                <Input value={form.supplier_article_number} onChange={(e) => setForm({ ...form, supplier_article_number: e.target.value })} placeholder="e.g. ABC-4587" />
              </div>
            </div>

            {/* Supplier Colour */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Supplier Colour Number</Label>
                <Input value={form.supplier_colour_number} onChange={(e) => setForm({ ...form, supplier_colour_number: e.target.value })} placeholder="e.g. 7432" />
              </div>
              <div className="space-y-1.5">
                <Label>Supplier Colour Name</Label>
                <Input value={form.supplier_colour_name} onChange={(e) => setForm({ ...form, supplier_colour_name: e.target.value })} placeholder="e.g. Midnight Ocean" />
              </div>
            </div>

            {/* Our Colour */}
            <div className="space-y-1.5">
              <Label>Our Colour</Label>
              <Select value={form.our_colour_code || "none"} onValueChange={(v) => setForm({ ...form, our_colour_code: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Select our colour" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Select colour —</SelectItem>
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

            {/* Fabric details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fabric Type</Label>
                <Input value={form.fabric_type} onChange={(e) => setForm({ ...form, fabric_type: e.target.value })} placeholder="e.g. Woven Solid" />
              </div>
              <div className="space-y-1.5">
                <Label>Fabric Composition</Label>
                <Input value={form.fabric_composition} onChange={(e) => setForm({ ...form, fabric_composition: e.target.value })} placeholder="e.g. 100% Cotton" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Fabric Width</Label>
                <Input value={form.fabric_width} onChange={(e) => setForm({ ...form, fabric_width: e.target.value })} placeholder="e.g. 150 cm" />
              </div>
              <div className="space-y-1.5">
                <Label>Weight (GSM)</Label>
                <Input value={form.fabric_weight_gsm} onChange={(e) => setForm({ ...form, fabric_weight_gsm: e.target.value })} placeholder="e.g. 120" />
              </div>
              <div className="space-y-1.5">
                <Label>Construction</Label>
                <Input value={form.fabric_construction} onChange={(e) => setForm({ ...form, fabric_construction: e.target.value })} placeholder="e.g. Plain weave" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Product Specification</Label>
              <Input value={form.product_specification} onChange={(e) => setForm({ ...form, product_specification: e.target.value })} placeholder="Free text specification" />
            </div>

            {/* Finishings multi-select */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Finishings
                {form.finishing_ids.length > 0 && (
                  <Badge variant="secondary">{form.finishing_ids.length} selected</Badge>
                )}
              </Label>
              <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {finishings.map((f) => (
                    <label
                      key={f.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent rounded px-2 py-1"
                    >
                      <Checkbox
                        checked={form.finishing_ids.includes(f.id)}
                        onCheckedChange={() => toggleFinishing(f.id)}
                      />
                      <span className="font-mono text-xs text-muted-foreground">{f.code}</span>
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional technical notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editId ? "Update" : "Create Material"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
