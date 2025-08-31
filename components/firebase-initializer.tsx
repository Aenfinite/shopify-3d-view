"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase/firebase-config"
import { collection, getDocs, limit, query } from "firebase/firestore"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FirebaseConnectionMonitor } from "./firebase-connection-monitor"
import { getFirebaseErrorMessage, retryOperation } from "@/lib/firebase/error-handler"
import { RefreshCw } from "lucide-react"

export function FirebaseInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState<boolean>(false)

  const initializeFirebase = async () => {
    // Skip initialization if we're on the server or if db is not available
    if (typeof window === "undefined" || !db) {
      setIsInitialized(true)
      return
    }

    try {
      setIsRetrying(true)

      // Test the connection by making a simple query
      await retryOperation(
        async () => {
          const testQuery = query(collection(db, "products"), limit(1))
          await getDocs(testQuery)
        },
        3,
        1000,
      )

      setIsInitialized(true)
      setError(null)
    } catch (err) {
      console.error("Firebase initialization error:", err)
      setError(getFirebaseErrorMessage(err))
    } finally {
      setIsRetrying(false)
    }
  }

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      initializeFirebase()
    } else {
      setIsInitialized(true)
    }
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Firebase Connection Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{error}</p>
            <p className="mt-2">
              This could be due to network issues, incorrect Firebase configuration, or Firestore rules.
            </p>
            <Button variant="outline" size="sm" onClick={initializeFirebase} disabled={isRetrying} className="mt-4">
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                "Try Again"
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-lg">Connecting to Firebase...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      {typeof window !== "undefined" && <FirebaseConnectionMonitor />}
    </>
  )
}
