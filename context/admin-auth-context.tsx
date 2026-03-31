"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  supabaseUser: User | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  loading: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setSupabaseUser(session.user)
          await loadAdminProfile(session.user.id)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user)
          await loadAdminProfile(session.user.id)
        } else {
          setSupabaseUser(null)
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadAdminProfile = async (authUserId: string) => {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("auth_user_id", authUserId)
      .single()

    if (error || !data) {
      // User exists in auth but not in admin_users table
      setUser(null)
      return
    }

    setUser({
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
    })
  }

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      // Verify user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("auth_user_id", data.user.id)
        .single()

      if (adminError || !adminData) {
        await supabase.auth.signOut()
        return { error: "You do not have admin access." }
      }

      setUser({
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
        role: adminData.role,
      })
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
  }

  const value: AdminAuthContextType = {
    user,
    supabaseUser,
    signIn,
    signOut,
    isAuthenticated: !!user,
    loading,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
