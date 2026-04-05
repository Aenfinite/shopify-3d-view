"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink, Loader2 } from "lucide-react"
import { getAllProducts, getCustomizationOptions, type Product } from "@/lib/firebase/unified-product-service"
import { getFabricsByProduct } from "@/lib/supabase/service"

interface ProductWithDetails extends Product {
  customizationCount: number
  fabricCount: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const allProducts = await getAllProducts()
        const enriched = await Promise.all(
          allProducts.map(async (p) => {
            const [options,  fabrics] = await Promise.all([
              getCustomizationOptions(p.id),
              getFabricsByProduct(p.id),
            ])
            return {
              ...p,
              customizationCount: options.length,
              fabricCount: fabrics.length,
            }
          })
        )
        setProducts(enriched)
      } catch (err) {
        console.error("Error loading products:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categoryColor = (cat: string) => {
    switch (cat) {
      case "shirts": return "bg-blue-100 text-blue-800"
      case "jackets": return "bg-purple-100 text-purple-800"
      case "pants": return "bg-amber-100 text-amber-800"
      default: return ""
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">
          Products and customization options are defined in application code. Fabrics are managed in Supabase.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Customization Steps</TableHead>
                  <TableHead>Fabrics (Supabase)</TableHead>
                  <TableHead className="text-right">Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={categoryColor(product.category)}>
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>${product.basePrice.toFixed(2)}</TableCell>
                    <TableCell>
                      {product.customizationCount > 0 ? (
                        <Badge variant="secondary">{product.customizationCount} steps</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.fabricCount > 0 ? (
                        <Badge>{product.fabricCount} fabrics</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/product/${product.id}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
