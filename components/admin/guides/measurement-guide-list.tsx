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
import { Edit, MoreHorizontal, Search, Trash, Eye } from "lucide-react"
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

// Mock data for measurement guides
const mockGuides = [
  {
    id: "guide-1",
    name: "Chest Measurement",
    measurementType: "chest",
    showInMTM: true,
    showInMTO: false,
    imageUrl: "/placeholder.svg?height=100&width=100",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "guide-2",
    name: "Waist Measurement",
    measurementType: "waist",
    showInMTM: true,
    showInMTO: true,
    imageUrl: "/placeholder.svg?height=100&width=100",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "guide-3",
    name: "Shoulder Measurement",
    measurementType: "shoulder",
    showInMTM: true,
    showInMTO: false,
    imageUrl: "/placeholder.svg?height=100&width=100",
    videoUrl: "",
  },
]

export function MeasurementGuideList() {
  const [guides, setGuides] = useState(mockGuides)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [guideToDelete, setGuideToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  // Filter guides based on search query
  const filteredGuides = guides.filter(
    (guide) =>
      guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.measurementType.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeleteClick = (id: string) => {
    setGuideToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!guideToDelete) return

    try {
      // In a real implementation, you would delete the guide from Firestore
      setGuides(guides.filter((guide) => guide.id !== guideToDelete))
      toast({
        title: "Success",
        description: "Measurement guide deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting guide:", error)
      toast({
        title: "Error",
        description: "Failed to delete guide. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setGuideToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search guides..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Measurement Type</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Has Video</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading guides...
                </TableCell>
              </TableRow>
            ) : filteredGuides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No guides found. Try a different search or add a new guide.
                </TableCell>
              </TableRow>
            ) : (
              filteredGuides.map((guide) => (
                <TableRow key={guide.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-md overflow-hidden">
                      <img
                        src={guide.imageUrl || "/placeholder.svg"}
                        alt={guide.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{guide.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {guide.measurementType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {guide.showInMTM && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          MTM
                        </Badge>
                      )}
                      {guide.showInMTO && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          MTO
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{guide.videoUrl ? "Yes" : "No"}</TableCell>
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
                          <Link href={`/admin/guides/edit/€{guide.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/preview/guide/€{guide.id}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteClick(guide.id)}
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
              This will permanently delete this measurement guide. This action cannot be undone.
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
