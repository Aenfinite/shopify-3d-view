"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase/firebase-config"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { enableNetwork, disableNetwork } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

export function FirebaseConnectionMonitor() {
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false)

  // Monitor online/offline status
  useEffect(() => {
    if (!db) return

    const handleOnline = () => {
      enableNetwork(db).then(() => {
        setIsOnline(true)
        console.log("Firebase connection restored")
      })
    }

    const handleOffline = () => {
      disableNetwork(db).then(() => {
        setIsOnline(false)
        console.log("Firebase connection disabled due to offline status")
      })
    }

    // Check initial status
    setIsOnline(navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleReconnect = async () => {
    if (!db) return

    setIsReconnecting(true)
    try {
      await enableNetwork(db)
      setIsOnline(true)
    } catch (error) {
      console.error("Failed to reconnect:", error)
    } finally {
      setIsReconnecting(false)
    }
  }

  if (!isOnline) {
    return (
      <Alert className="fixed bottom-4 right-4 max-w-md z-50 bg-yellow-50 border-yellow-200">
        <WifiOff className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="flex items-center justify-between">
          <span>You are offline. Some features may be limited.</span>
          <Button size="sm" variant="outline" onClick={handleReconnect} disabled={isReconnecting} className="ml-2">
            {isReconnecting ? "Reconnecting..." : "Reconnect"}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
