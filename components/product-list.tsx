"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getProducts, type Product } from "@/lib/firebase/product-service"
import { Loader2, ShoppingCart, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ProductListProps {
  category?: string
  limit?: number
}

export default function ProductList({ category, limit = 12 }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching products with category:", category)
        const { products: fetchedProducts } = await getProducts(category, undefined, limit)

        console.log("Fetched products:", fetchedProducts.length)
        setProducts(fetchedProducts)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("Failed to load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, limit])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Products</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
          <p className="text-muted-foreground mb-4">
            {category ? `No products found in the €{category} category.` : "No products available at the moment."}
          </p>
          <Button asChild>
            <Link href="/">Browse All Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {category ? `€{category.charAt(0).toUpperCase() + category.slice(1)}` : "All Products"}
        </h2>
        <p className="text-muted-foreground">{products.length} products found</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                <Image
                  src={product.imageUrl || "/placeholder.svg?height=400&width=300"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.customizable && <Badge className="absolute top-2 left-2 bg-primary">Customizable</Badge>}
                {!product.available && (
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    Out of Stock
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2 line-clamp-1">{product.name}</CardTitle>
              <CardDescription className="text-sm mb-3 line-clamp-2">{product.description}</CardDescription>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">€{product.price.toFixed(2)}</span>
                <Badge variant="outline" className="capitalize">
                  {product.category}
                </Badge>
              </div>
              {product.fabricOptions && product.fabricOptions.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">
                    Fabrics: {product.fabricOptions.slice(0, 2).join(", ")}
                    {product.fabricOptions.length > 2 && ` +€{product.fabricOptions.length - 2} more`}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/product/€{product.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </Button>
              {product.customizable ? (
                <Button asChild className="flex-1" style={{ backgroundColor: '#236495', color: '#fff' }}>
                  <Link href={`/product/€{product.id}`}>Customize Now</Link>
                </Button>
              ) : (
                <Button className="flex-1" disabled={!product.available}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.available ? "Add to Cart" : "Out of Stock"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
