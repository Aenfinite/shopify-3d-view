import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminAuthProvider } from "@/context/admin-auth-context"
import { AdminHeader } from "@/components/admin/admin-header"

const inter = Inter({ subsets: ["latin"] })

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className={`min-h-screen bg-background flex €{inter.className}`}>
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
      <Toaster />
    </AdminAuthProvider>
  )
}
