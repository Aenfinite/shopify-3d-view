"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase/firebase-config"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import { Edit, Trash } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface StyleOption {
  id: string
  name: string
  category: string
  price: number
  available: boolean
  imageUrl?: string
}

export function StyleList() {
  const [styles, setStyles] = useState<StyleOption[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStyles() {
      try {
        const stylesCollection = collection(db, "styleOptions")
        const stylesSnapshot = await getDocs(stylesCollection)
        const stylesList = stylesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as StyleOption[]

        setStyles(stylesList)
      } catch (error) {
        console.error("Error fetching style options:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStyles()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteDoc(doc(db, "styleOptions", deleteId))
      setStyles(styles.filter((style) => style.id !== deleteId))
    } catch (error) {
      console.error("Error deleting style option:", error)
    } finally {
      setDeleteId(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading style options...</div>
  }

  return (
    <div>
      {styles.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p className="text-muted-foreground mb-4">No style options found</p>
          <Button asChild>
            <Link href="/admin/styles/new">Add Your First Style Option</Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {styles.map((style) => (
              <TableRow key={style.id}>
                <TableCell className="font-medium">{style.name}</TableCell>
                <TableCell>{style.category}</TableCell>
                <TableCell>€{style.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={style.available ? "default" : "outline"}>
                    {style.available ? "Available" : "Unavailable"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/styles/€{style.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setDeleteId(style.id)}>
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the style option. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
