"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminDashboardStats } from "@/components/admin/dashboard/admin-dashboard-stats"
import { AdminDashboardCharts } from "@/components/admin/dashboard/admin-dashboard-charts"
import { AdminDashboardRecent } from "@/components/admin/dashboard/admin-dashboard-recent"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSystemStatus } from "@/lib/firebase/unified-product-service"
import { CheckCircle, Info, ExternalLink } from "lucide-react"

export default function AdminDashboard() {
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSystemStatus = async () => {
      try {
        const status = getSystemStatus()
        setSystemStatus(status)
      } catch (error) {
        console.error("Error loading system status:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSystemStatus()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome to the Shopify MTM System Management Panel</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Demo Environment
          </Badge>
        </div>

        {/* Demo Notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode:</strong> This is a demonstration environment. All data is for testing purposes only. The
            system is currently running with mock products and sample customization options.
          </AlertDescription>
        </Alert>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mock Products</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStatus?.mockProducts || 0}</div>
              <p className="text-xs text-muted-foreground">{systemStatus?.mockProductsActive || 0} active products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customization Options</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStatus?.totalMockOptions || 0}</div>
              <p className="text-xs text-muted-foreground">Across {systemStatus?.mockCustomizations || 0} products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Product Categories</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStatus?.mockCategories?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{systemStatus?.mockCategories?.join(", ") || "None"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Product Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Customization Status</CardTitle>
              <CardDescription>Breakdown of customization options per product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemStatus?.customizationStatus &&
                Object.entries(systemStatus.customizationStatus).map(([productId, count]) => (
                  <div key={productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">
                        {productId === "shirt-001"
                          ? "Premium Custom Shirt"
                          : productId === "pants-001"
                            ? "Custom Tailored Chinos"
                            : productId === "jacket-001"
                              ? "Bespoke Blazer"
                              : productId}
                      </span>
                    </div>
                    <Badge variant="secondary">{count} options</Badge>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <a href="/product/shirt-001" target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Shirt Configurator
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <a href="/product/pants-001" target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Pants Configurator
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <a href="/product/jacket-001" target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Jacket Configurator
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <a href="/admin/clothing-types">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Clothing Types
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AdminDashboardCharts />
          </div>
          <div>
            <AdminDashboardRecent />
          </div>
        </div>

        <AdminDashboardStats />
      </div>
    </AdminLayout>
  )
}
