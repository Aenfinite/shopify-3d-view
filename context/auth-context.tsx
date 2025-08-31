"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  user: any | null // Replace 'any' with a more specific type if available
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null) // Replace 'any' with a more specific type if available
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Simulate authentication check
    const simulateAuthCheck = async () => {
      setLoading(true)
      // Simulate fetching user data
      setTimeout(() => {
        setUser(null) // Set to null for now, can be replaced with actual user data
        setLoading(false)
      }, 1000)
    }

    simulateAuthCheck()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    // Simulate signing in
    setTimeout(() => {
      setUser({ email }) // Set user data upon successful sign-in
      setLoading(false)
    }, 1000)
  }

  const signOut = async () => {
    setLoading(true)
    // Simulate signing out
    setTimeout(() => {
      setUser(null) // Clear user data upon sign-out
      setLoading(false)
    }, 1000)
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
