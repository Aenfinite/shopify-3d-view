"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, MoreHorizontal, Search, Trash, Plus, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getAllProducts,
  updateFabric,
  getFabricCategory,
  type FabricRow,
  type Product,
} from "@/lib/supabase/service"
import FabricWizard from "./fabric-wizard"
import { FabricPreviewDialog } from "./fabric-preview-dialog"

type ViewMode = "list" | "wizard"

export function FabricManager() {
  const [fabrics, setFabrics] = useState<FabricRow[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "outer" | "lining">("all")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fabricToDelete, setFabricToDelete] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [editingFabric, setEditingFabric] = useState<FabricRow | null>(null)
  const [previewFabric, setPreviewFabric] = useState<FabricRow | null>(null)
  const { toast } = useToast()

  const loadProducts = async () => {
    const data = await getAllProducts()
    setProducts(data)
    return data
  }

  const loadFabrics = async (productId?: string) => {
    setLoading(true)
    try {
      const url = productId && productId !== "all"
        ? `/api/admin/fabrics?product=${productId}`
        : `/api/admin/fabrics`
      const res = await fetch(url)
      if (!res.ok) throw new Error(await res.text())
      const data: FabricRow[] = await res.json()
      setFabrics(data)
    } catch (error) {
      console.error("Error loading fabrics:", error)
      toast({ title: "Error", description: "Failed to load fabrics.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts().then(() => loadFabrics())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (viewMode === "list") loadFabrics(selectedProduct)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct])

  const filteredFabrics = fabrics.filter((f) => {
    const matchesQuery =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.fabric_type.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesQuery) return false
    if (selectedCategory === "all") return true
    return getFabricCategory(f) === selectedCategory
  })

  const outerCount = fabrics.filter((f) => getFabricCategory(f) === "outer").length
  const liningCount = fabrics.filter((f) => getFabricCategory(f) === "lining").length

  const handleDelete = async () => {
    if (!fabricToDelete) return
    try {
      const res = await fetch(`/api/admin/fabrics/${fabricToDelete}`, { method: "DELETE" })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
      }
      setFabrics((prev) => prev.filter((f) => f.id !== fabricToDelete))
      toast({ title: "Deleted", description: "Fabric removed successfully." })
    } catch (error) {
      console.error("Error deleting fabric:", error)
      toast({ title: "Error", description: "Failed to delete fabric.", variant: "destructive" })
    } finally {
      setDeleteDialogOpen(false)
      setFabricToDelete(null)
    }
  }

  const handleEdit = (fabric: FabricRow) => {
    setEditingFabric(fabric)
    setViewMode("wizard")
  }

  const handleAdd = () => {
    setEditingFabric(null)
    setViewMode("wizard")
  }

  const handleWizardClose = () => {
    setViewMode("list")
    setEditingFabric(null)
  }

  const handleWizardSaved = () => {
    setViewMode("list")
    setEditingFabric(null)
    loadFabrics(selectedProduct)
  }

  const fabricTypeColor = (type: string) => {
    switch (type) {
      case "cotton": return "bg-blue-100 text-blue-800"
      case "linen": return "bg-amber-100 text-amber-800"
      case "polyester": return "bg-purple-100 text-purple-800"
      default: return ""
    }
  }

  const productName = (pid: string) =>
    products.find((p) => p.id === pid)?.name || pid

  // ─── Wizard Mode ──────────────────────────────────────

  if (viewMode === "wizard") {
    return (
      <FabricWizard
        editingFabric={editingFabric}
        onClose={handleWizardClose}
        onSaved={handleWizardSaved}
      />
    )
  }

  // ─── List Mode ────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="inline-flex rounded-lg border bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            selectedCategory === "all" ? "bg-white shadow font-medium" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          All <span className="text-xs text-gray-400">({fabrics.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("outer")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            selectedCategory === "outer" ? "bg-white shadow font-medium" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🧥 Outer Fabrics <span className="text-xs text-gray-400">({outerCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("lining")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            selectedCategory === "lining" ? "bg-white shadow font-medium" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🧵 Linings <span className="text-xs text-gray-400">({liningCount})</span>
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search fabrics..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Fabric
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Preview</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading fabrics...</TableCell>
              </TableRow>
            ) : filteredFabrics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No fabrics found. Add your first fabric above.
                </TableCell>
              </TableRow>
            ) : (
              filteredFabrics.map((fabric) => (
                <TableRow key={fabric.id}>
                  <TableCell>
                    {fabric.image_url ? (
                      <img
                        src={fabric.image_url}
                        alt={fabric.name}
                        className="w-8 h-8 rounded border object-cover"
                      />
                    ) : fabric.color_hex ? (
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: fabric.color_hex }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded border bg-gray-100" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{fabric.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {productName(fabric.product_id)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={fabricTypeColor(fabric.fabric_type)}>
                      {fabric.fabric_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize text-sm">{fabric.input_mode}</TableCell>
                  <TableCell>${Number(fabric.price).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreviewFabric(fabric)}>
                          <Eye className="mr-2 h-4 w-4" /> Preview 3D
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(fabric)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setFabricToDelete(fabric.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fabric?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this fabric. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 3D Preview Dialog */}
      {previewFabric && (
        <FabricPreviewDialog
          open={!!previewFabric}
          onOpenChange={(open: boolean) => !open && setPreviewFabric(null)}
          fabric={previewFabric}
          products={products}
          onSave={async (newPbr) => {
            const updated = await updateFabric(previewFabric.id, { pbr_settings: newPbr })
            if (updated) {
              setFabrics((prev) => prev.map((f) => f.id === updated.id ? updated : f))
              setPreviewFabric(updated)
              toast({ title: "PBR settings saved", description: `${previewFabric.name} updated.` })
            } else {
              toast({ title: "Save failed", description: "Could not update PBR settings.", variant: "destructive" })
            }
          }}
        />
      )}
    </div>
  )
}
