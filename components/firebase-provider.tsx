"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { app } from "@/lib/firebase/firebase-config"

interface FirebaseProviderProps {
  children: React.ReactNode
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Firebase is initialized in firebase-config.ts
    // This component just ensures it's ready before rendering children
    if (app) {
      setIsInitialized(true)
    }
  }, [])

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
