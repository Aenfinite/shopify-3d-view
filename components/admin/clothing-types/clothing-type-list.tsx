"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Settings, MoreHorizontal, Eye, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface ClothingType {
  id: string
  name: string
  description: string
  category: string
  isActive: boolean
  customizationSteps: number
  has3DModel: boolean
  basePrice: number
  createdAt: Date
  updatedAt: Date
}

// Mock data - in real app this would come from Firebase
const MOCK_CLOTHING_TYPES: ClothingType[] = [
  {
    id: "shirt",
    name: "Dress Shirt",
    description: "Classic business and casual dress shirts with full customization",
    category: "tops",
    isActive: true,
    customizationSteps: 5,
    has3DModel: true,
    basePrice: 149.99,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "jacket",
    name: "Suit Jacket",
    description: "Professional suit jackets with premium customization options",
    category: "outerwear",
    isActive: true,
    customizationSteps: 5,
    has3DModel: true,
    basePrice: 399.99,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "pants",
    name: "Dress Pants",
    description: "Tailored dress pants and trousers",
    category: "bottoms",
    isActive: true,
    customizationSteps: 5,
    has3DModel: true,
    basePrice: 199.99,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "dress",
    name: "Evening Dress",
    description: "Elegant evening dresses (coming soon)",
    category: "dresses",
    isActive: false,
    customizationSteps: 0,
    has3DModel: false,
    basePrice: 299.99,
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
  },
]

export function ClothingTypeList() {
  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>(MOCK_CLOTHING_TYPES)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    try {
      // In real app, this would call Firebase
      setClothingTypes((prev) => prev.filter((type) => type.id !== id))
      toast({
        title: "Success",
        description: "Clothing type deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete clothing type",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      setClothingTypes((prev) => prev.map((type) => (type.id === id ? { ...type, isActive: !type.isActive } : type)))
      toast({
        title: "Success",
        description: "Clothing type status updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update clothing type",
        variant: "destructive",
      })
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const original = clothingTypes.find((type) => type.id === id)
      if (original) {
        const duplicate = {
          ...original,
          id: `€{original.id}-copy`,
          name: `€{original.name} (Copy)`,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setClothingTypes((prev) => [...prev, duplicate])
        toast({
          title: "Success",
          description: "Clothing type duplicated successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate clothing type",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Clothing Types</CardTitle>
        <CardDescription>Manage your clothing types and their customization configurations</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead>3D Model</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clothingTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{type.name}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {type.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={type.isActive ? "default" : "secondary"}>
                    {type.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{type.customizationSteps}</span>
                    <span className="text-sm text-muted-foreground">steps</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={type.has3DModel ? "default" : "destructive"}>
                    {type.has3DModel ? "✓ Available" : "✗ Missing"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">€{type.basePrice}</span>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">{type.updatedAt.toLocaleDateString()}</div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/admin/clothing-types/€{type.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/admin/clothing-types/€{type.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/admin/clothing-types/€{type.id}/customization`)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Customization Steps
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(type.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(type.id)}>
                        {type.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the clothing type "{type.name}" and all its customization
                              data. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(type.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
