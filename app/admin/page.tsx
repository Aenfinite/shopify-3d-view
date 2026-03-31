"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette, Shirt, ExternalLink, Database, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { getSystemStatus } from "@/lib/supabase/service"
import { getAllProducts } from "@/lib/firebase/unified-product-service"
import { SAMPLE_PRODUCTS_WITH_CUSTOMIZATION } from "@/data/sample-products-with-customization"

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    supabaseConnected: boolean
    totalFabrics: number
    totalProducts: number
    productsWithCustomization: number
    categories: string[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [status, products] = await Promise.all([
          getSystemStatus(),
          getAllProducts(),
        ])
        const customizationKeys = Object.keys(SAMPLE_PRODUCTS_WITH_CUSTOMIZATION)
        const categories = [...new Set(products.map((p) => p.category))]

        setStats({
          supabaseConnected: status.supabaseConnected,
          totalFabrics: status.totalFabrics,
          totalProducts: products.length,
          productsWithCustomization: customizationKeys.length,
          categories,
        })
      } catch {
        setStats({
          supabaseConnected: false,
          totalFabrics: 0,
          totalProducts: 0,
          productsWithCustomization: 0,
          categories: [],
        })
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Shopify Made-to-Measure Admin Panel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supabase</CardTitle>
            {stats?.supabaseConnected ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats?.supabaseConnected ? "text-green-600" : "text-red-500"}`}>
              {stats?.supabaseConnected ? "Connected" : "Offline"}
            </div>
            <p className="text-xs text-muted-foreground">Database status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Shirt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.productsWithCustomization ?? 0} with customization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fabrics</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFabrics ?? 0}</div>
            <p className="text-xs text-muted-foreground">Managed in Supabase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.categories.length ?? 0}</div>
            <p className="text-xs text-muted-foreground capitalize">
              {stats?.categories.join(", ") || "None"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/fabrics">
                <Palette className="w-4 h-4 mr-2" />
                Manage Fabrics
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/products">
                <Shirt className="w-4 h-4 mr-2" />
                View Products
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/settings">
                <Database className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Configurators</CardTitle>
            <CardDescription>Preview customer-facing product configurators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/product/shirt-001" target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Shirt Configurator
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/product/jacket-001" target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Jacket Configurator
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/product/pants-001" target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Pants Configurator
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
