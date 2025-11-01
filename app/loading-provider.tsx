"use client"

import { useEffect } from "react"
import { preloadAllParts } from "@/lib/3d/modular-jacket-loader"

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    preloadAllParts()
  }, [])
  
  return children
}