"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Search, Trash, Copy, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for garments
const mockGarments = [
  {
    id: "garment-1",
    name: "Classic Oxford Shirt",
    category: "shirt",
    basePrice: 99.99,
    isActive: true,
    availableForMTM: true,
    availableForMTO: true,
    thumbnailUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "garment-2",
    name: "Slim Fit Chinos",
    category: "pants",
    basePrice: 129.99,
    isActive: true,
    availableForMTM: true,
    availableForMTO: false,
    thumbnailUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "garment-3",
    name: "Wool Blazer",
    category: "jacket",
    basePrice: 299.99,
    isActive: false,
    availableForMTM: true,
    availableForMTO: true,
    thumbnailUrl: "/placeholder.svg?height=100&width=100",
  },
]

export function GarmentList() {
  const [garments, setGarments] = useState(mockGarments)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [garmentToDelete, setGarmentToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  // Filter garments based on search query and category
  const filteredGarments = garments.filter(
    (garment) =>
      (garment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        garment.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (categoryFilter === "all" || garment.category === categoryFilter),
  )

  const handleDeleteClick = (id: string) => {
    setGarmentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!garmentToDelete) return

    try {
      // In a real implementation, you would delete the garment from Firestore
      setGarments(garments.filter((garment) => garment.id !== garmentToDelete))
      toast({
        title: "Success",
        description: "Garment deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting garment:", error)
      toast({
        title: "Error",
        description: "Failed to delete garment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setGarmentToDelete(null)
    }
  }

  const handleDuplicate = (id: string) => {
    const garmentToDuplicate = garments.find((g) => g.id === id)
    if (garmentToDuplicate) {
      const duplicatedGarment = {
        ...garmentToDuplicate,
        id: `garment-€{Date.now()}`,
        name: `€{garmentToDuplicate.name} (Copy)`,
      }
      setGarments([...garments, duplicatedGarment])
      toast({
        title: "Success",
        description: "Garment duplicated successfully",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search garments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="shirt">Shirts</SelectItem>
            <SelectItem value="pants">Pants</SelectItem>
            <SelectItem value="jacket">Jackets</SelectItem>
            <SelectItem value="suit">Suits</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading garments...
                </TableCell>
              </TableRow>
            ) : filteredGarments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No garments found. Try a different search or add a new garment.
                </TableCell>
              </TableRow>
            ) : (
              filteredGarments.map((garment) => (
                <TableRow key={garment.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-md overflow-hidden">
                      <img
                        src={garment.thumbnailUrl || "/placeholder.svg"}
                        alt={garment.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{garment.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {garment.category}
                    </Badge>
                  </TableCell>
                  <TableCell>€{garment.basePrice.toFixed(2)}</TableCell>
                  <TableCell>
                    {garment.isActive ? (
                      <Badge variant="default" className="bg-green-500">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {garment.availableForMTM && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          MTM
                        </Badge>
                      )}
                      {garment.availableForMTO && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          MTO
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/garments/edit/€{garment.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(garment.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/preview/€{garment.id}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteClick(garment.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this garment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
