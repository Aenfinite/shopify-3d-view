"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, Loader2 } from "lucide-react"
import { getSystemStatus } from "@/lib/supabase/service"
import { useAdminAuth } from "@/context/admin-auth-context"

export default function SettingsPage() {
  const { user } = useAdminAuth()
  const [status, setStatus] = useState<{ supabaseConnected: boolean; totalFabrics: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSystemStatus()
      .then(setStatus)
      .catch(() => setStatus({ supabaseConnected: false, totalFabrics: 0 }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">System configuration and status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supabase Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase Connection
            </CardTitle>
            <CardDescription>Database and storage backend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  {status?.supabaseConnected ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" /> Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" /> Disconnected
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fabrics in database</span>
                  <span className="text-sm font-medium">{status?.totalFabrics ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Project URL</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configured" : "Not set"}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Admin Account */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Account</CardTitle>
            <CardDescription>Currently signed-in administrator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email</span>
              <span className="text-sm font-medium">{user?.email ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Name</span>
              <span className="text-sm font-medium">{user?.name || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Role</span>
              <Badge variant="outline" className="capitalize">{user?.role ?? "—"}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Data Architecture */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Data Architecture</CardTitle>
            <CardDescription>How data is managed in this system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-medium text-sm">Supabase (Dynamic)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Fabrics — full CRUD with image upload</li>
                  <li>• Admin users — authentication & authorization</li>
                  <li>• Storage — fabric images (public bucket)</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-medium text-sm">Application Code (Static)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Products — defined in unified-product-service</li>
                  <li>• Customization options — sample-products-with-customization</li>
                  <li>• 3D models — bundled in public/models</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
