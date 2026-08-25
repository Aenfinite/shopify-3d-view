"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Shirt,
  Palette,
  Settings,
  LogOut,
  Rocket,
  ClipboardList,
  Boxes,
  Barcode,
  Database,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAdminAuth } from "@/context/admin-auth-context"
import type { Permission } from "@/lib/admin/roles"

export function AdminSidebar() {
  const pathname = usePathname()
  const { signOut, can } = useAdminAuth()
  const [collapsed, setCollapsed] = useState(false)

  // `perm` gates a link by role; items without one are visible to everyone.
  const navigation: Array<{ name: string; href: string; icon: typeof LayoutDashboard; perm?: Permission }> = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Shirt, perm: "fabrics:manage" },
    { name: "Fabrics", href: "/admin/fabrics", icon: Palette, perm: "fabrics:manage" },
    { name: "Materials", href: "/admin/materials", icon: Database, perm: "articleCodes:manage" },
    { name: "Kickstarter", href: "/admin/kickstarter", icon: Rocket, perm: "imports:run" },
    { name: "Packages", href: "/admin/packages", icon: Boxes, perm: "packages:manage" },
    { name: "Orders", href: "/admin/orders", icon: ClipboardList },
    { name: "Article Codes", href: "/admin/article-codes", icon: Barcode, perm: "articleCodes:manage" },
    { name: "SKU Lookup", href: "/admin/sku-lookup", icon: Search, perm: "articleCodes:manage" },
    { name: "Settings", href: "/admin/settings", icon: Settings, perm: "settings:manage" },
  ].filter((item) => !item.perm || can(item.perm))

  return (
    <div
      className={cn(
        "bg-card border-r border-border h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && <h1 className="font-bold text-xl">Admin Panel</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={collapsed ? "mx-auto" : ""}
        >
          {collapsed ? "→" : "←"}
        </Button>
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className={cn("w-full justify-start text-muted-foreground", collapsed && "justify-center")}
          onClick={signOut}
        >
          <LogOut className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
          {!collapsed && <span>Sign out</span>}
        </Button>
      </div>
    </div>
  )
}
