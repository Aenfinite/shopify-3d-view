"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash, MoreHorizontal, Loader2, PackageOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

interface Pkg {
  id: string
  code: string
  name: string
  description: string | null
  garment_count: number
  allowed_garment_types: string[]
  item_rules: Record<string, unknown>
  base_value: number
  currency: string
  is_active: boolean
  sort_order: number
}

const GARMENT_TYPES = ["jacket", "shirt", "pants"]

const emptyForm = {
  code: "", name: "", description: "", garment_count: 1,
  allowed_garment_types: [] as string[], base_value: 0, currency: "EUR",
  is_active: true, sort_order: 0, item_rules_text: "{}",
}

export function PackagesManager() {
  const { toast } = useToast()
  const [packages, setPackages] = useState<Pkg[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/packages")
      const data = await res.json()
      setPackages(Array.isArray(data) ? data : [])
    } catch {
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setDialogOpen(true)
  }

  const openEdit = (p: Pkg) => {
    setEditingId(p.id)
    setForm({
      code: p.code, name: p.name, description: p.description ?? "",
      garment_count: p.garment_count, allowed_garment_types: p.allowed_garment_types ?? [],
      base_value: p.base_value, currency: p.currency, is_active: p.is_active,
      sort_order: p.sort_order, item_rules_text: JSON.stringify(p.item_rules ?? {}, null, 2),
    })
    setDialogOpen(true)
  }

  const toggleType = (t: string) => {
    setForm((f) => ({
      ...f,
      allowed_garment_types: f.allowed_garment_types.includes(t)
        ? f.allowed_garment_types.filter((x) => x !== t)
        : [...f.allowed_garment_types, t],
    }))
  }

  const save = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast({ title: "Code and name are required", variant: "destructive" })
      return
    }
    let item_rules: unknown
    try {
      item_rules = JSON.parse(form.item_rules_text || "{}")
    } catch {
      toast({ title: "Item rules must be valid JSON", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const payload = {
        code: form.code, name: form.name, description: form.description,
        garment_count: form.garment_count, allowed_garment_types: form.allowed_garment_types,
        base_value: form.base_value, currency: form.currency,
        is_active: form.is_active, sort_order: form.sort_order, item_rules,
      }
      const res = await fetch(
        editingId ? `/api/admin/packages/${editingId}` : "/api/admin/packages",
        { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Save failed")
      toast({ title: editingId ? "Package updated" : "Package created" })
      setDialogOpen(false)
      void load()
    } catch (e) {
      toast({ title: "Could not save", description: e instanceof Error ? e.message : String(e), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/packages/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      setPackages((prev) => prev.filter((p) => p.id !== deleteId))
      toast({ title: "Package deleted" })
    } catch {
      toast({ title: "Delete failed", variant: "destructive" })
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New package</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground"><Loader2 className="h-6 w-6 mx-auto animate-spin" /></div>
          ) : packages.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <PackageOpen className="h-8 w-8 mx-auto mb-2" />
              <p>No packages yet. Create one to map Kickstarter reward tiers to garments.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Garments</TableHead>
                  <TableHead>Allowed types</TableHead>
                  <TableHead className="text-right">Base value</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.code}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-center">{p.garment_count}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {p.allowed_garment_types?.length
                          ? p.allowed_garment_types.map((t) => <Badge key={t} variant="outline" className="capitalize">{t}</Badge>)
                          : <span className="text-muted-foreground text-sm italic">any</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{p.base_value ? `${p.base_value} ${p.currency}` : "—"}</TableCell>
                    <TableCell className="text-center">
                      {p.is_active ? <Badge className="bg-green-600 hover:bg-green-600">active</Badge> : <Badge variant="secondary">inactive</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(p)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(p.id)}>
                            <Trash className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit package" : "New package"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Code *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="KS-2JKT" />
              </div>
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="2-Jacket Backer Tier" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Garments / package</Label>
                <Input type="number" min={1} value={form.garment_count} onChange={(e) => setForm({ ...form, garment_count: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Base value</Label>
                <Input type="number" min={0} value={form.base_value} onChange={(e) => setForm({ ...form, base_value: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Allowed garment types</Label>
              <div className="flex gap-4">
                {GARMENT_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
                    <Checkbox checked={form.allowed_garment_types.includes(t)} onCheckedChange={() => toggleType(t)} />
                    {t}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Leave empty to allow any type. The first selected type is used when spawning sub-orders.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Item rules (JSON, advanced)</Label>
              <Textarea
                value={form.item_rules_text}
                onChange={(e) => setForm({ ...form, item_rules_text: e.target.value })}
                rows={4}
                className="font-mono text-xs"
                placeholder='{ "allowed_fabrics": [], "max_monograms": 1 }'
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? "Save changes" : "Create package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete package?</AlertDialogTitle>
            <AlertDialogDescription>
              Orders already linked to this package will keep their data but lose the package reference. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
