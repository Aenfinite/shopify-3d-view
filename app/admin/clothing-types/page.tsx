"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import { getAllProducts, getSystemStatus } from "@/lib/firebase/unified-product-service"
import type { Product } from "@/lib/firebase/product-service"

export default function ClothingTypesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [allProducts, status] = await Promise.all([getAllProducts(), Promise.resolve(getSystemStatus())])

        setProducts(allProducts)
        setSystemStatus(status)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const mockProducts = products.filter((p) => p.id === "shirt-001" || p.id === "pants-001" || p.id === "jacket-001")

  const adminProducts = products.filter((p) => p.id !== "shirt-001" && p.id !== "pants-001" && p.id !== "jacket-001")

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clothing Types</h1>
          <p className="text-gray-600 mt-2">Manage your clothing types and their customization options</p>
        </div>
        <Link href="/admin/clothing-types/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Clothing Type
          </Button>
        </Link>
      </div>

      {/* System Status */}
      {systemStatus && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
            <CardDescription>Overview of your product catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemStatus.mockProducts}</div>
                <div className="text-sm text-gray-600">Mock Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{adminProducts.length}</div>
                <div className="text-sm text-gray-600">Custom Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemStatus.mockCustomizations}</div>
                <div className="text-sm text-gray-600">Mock Customizations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{systemStatus.totalMockOptions}</div>
                <div className="text-sm text-gray-600">Total Options</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Mock Product Customizations:</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Shirt:</span> {systemStatus.customizationStatus["shirt-001"]} options
                </div>
                <div>
                  <span className="font-medium">Pants:</span> {systemStatus.customizationStatus["pants-001"]} options
                </div>
                <div>
                  <span className="font-medium">Jacket:</span> {systemStatus.customizationStatus["jacket-001"]} options
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mock Products Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Built-in Products</h2>
          <Badge variant="secondary">{mockProducts.length} items</Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Always Available
          </Badge>
        </div>
        <p className="text-gray-600 mb-4">
          These are the default products with pre-configured customization options. They demonstrate the system
          capabilities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="mt-1">{product.description.slice(0, 100)}...</CardDescription>
                  </div>
                  <Badge variant="secondary">Mock</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Base Price:</span>
                    <span className="font-semibold">€{product.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Customizations:</span>
                    <span className="text-sm font-medium text-green-600">
                      {systemStatus?.customizationStatus[product.id] || 0} options
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/product/€{product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" disabled>
                      <Settings className="w-4 h-4 mr-1" />
                      Built-in
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Admin Products Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Custom Products</h2>
          <Badge variant="secondary">{adminProducts.length} items</Badge>
          {adminProducts.length === 0 && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Get Started
            </Badge>
          )}
        </div>
        <p className="text-gray-600 mb-4">
          Products you've created with custom configurations. You have full control over these items.
        </p>

        {adminProducts.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👔</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Custom Products Yet</h3>
              <p className="text-gray-600 text-center mb-4 max-w-md">
                Create your first custom clothing type with unique customization options and 3D models.
              </p>
              <Link href="/admin/clothing-types/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="mt-1">{product.description.slice(0, 100)}...</CardDescription>
                    </div>
                    <Badge variant="default">Custom</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Base Price:</span>
                      <span className="font-semibold">€{product.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge variant={product.available ? "default" : "secondary"}>
                        {product.available ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/product/€{product.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      </Link>
                      <Link href={`/admin/clothing-types/€{product.id}/customization`}>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
