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

interface PricingRule {
  id: string
  name: string
  type: string
  value: number
  appliesTo: string
  active: boolean
}

export function PricingRules() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPricingRules() {
      try {
        const rulesCollection = collection(db, "pricingRules")
        const rulesSnapshot = await getDocs(rulesCollection)
        const rulesList = rulesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PricingRule[]

        setRules(rulesList)
      } catch (error) {
        console.error("Error fetching pricing rules:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPricingRules()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteDoc(doc(db, "pricingRules", deleteId))
      setRules(rules.filter((rule) => rule.id !== deleteId))
    } catch (error) {
      console.error("Error deleting pricing rule:", error)
    } finally {
      setDeleteId(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading pricing rules...</div>
  }

  return (
    <div>
      {rules.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p className="text-muted-foreground mb-4">No pricing rules found</p>
          <Button asChild>
            <Link href="/admin/pricing/new">Add Your First Pricing Rule</Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Applies To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.name}</TableCell>
                <TableCell>{rule.type}</TableCell>
                <TableCell>{rule.type === "percentage" ? `€{rule.value}%` : `€€{rule.value.toFixed(2)}`}</TableCell>
                <TableCell>{rule.appliesTo}</TableCell>
                <TableCell>
                  <Badge variant={rule.active ? "default" : "outline"}>{rule.active ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/pricing/€{rule.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setDeleteId(rule.id)}>
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the pricing rule. This action cannot be undone.
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
