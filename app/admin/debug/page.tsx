"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  checkFirebaseConnection,
  resetFirebaseConnection,
  getFirebaseConfigInfo,
  clearFirebaseCache,
} from "@/lib/firebase/debug-utils"
import { RefreshCw, AlertTriangle, CheckCircle, Trash } from "lucide-react"

export default function FirebaseDebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const [configInfo, setConfigInfo] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    // Get Firebase config info on load
    setConfigInfo(getFirebaseConfigInfo())

    // Check connection on load
    handleCheckConnection()
  }, [])

  const handleCheckConnection = async () => {
    setIsChecking(true)
    try {
      const status = await checkFirebaseConnection()
      setConnectionStatus(status)
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: `Error checking connection: €{error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleResetConnection = async () => {
    setIsResetting(true)
    try {
      const result = await resetFirebaseConnection()
      if (result.success) {
        // Re-check connection after reset
        await handleCheckConnection()
      } else {
        setConnectionStatus({
          success: false,
          message: result.message,
        })
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: `Error resetting connection: €{error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsResetting(false)
    }
  }

  const handleClearCache = async () => {
    setIsClearing(true)
    try {
      await clearFirebaseCache()
      // The page will reload, so no need to update state
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: `Error clearing cache: €{error instanceof Error ? error.message : "Unknown error"}`,
      })
      setIsClearing(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Firebase Debug Tools</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Firebase Configuration</CardTitle>
            <CardDescription>Current Firebase setup information</CardDescription>
          </CardHeader>
          <CardContent>
            {configInfo ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Project ID:</span>
                  <span>{configInfo.projectId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Auth Domain:</span>
                  <span>{configInfo.authDomain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Firestore Initialized:</span>
                  <span>{configInfo.firestoreInitialized ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Auth Initialized:</span>
                  <span>{configInfo.authInitialized ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Using Emulator:</span>
                  <span>{configInfo.usingEmulator ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Persistence Enabled:</span>
                  <span>{configInfo.persistenceEnabled ? "Yes" : "No"}</span>
                </div>
              </div>
            ) : (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Check if Firebase is connected properly</CardDescription>
          </CardHeader>
          <CardContent>
            {connectionStatus ? (
              <Alert variant={connectionStatus.success ? "default" : "destructive"}>
                <div className="flex items-center gap-2">
                  {connectionStatus.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>{connectionStatus.success ? "Connected" : "Connection Issue"}</AlertTitle>
                </div>
                <AlertDescription className="mt-2">{connectionStatus.message}</AlertDescription>
              </Alert>
            ) : (
              <div className="animate-pulse space-y-2">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCheckConnection} disabled={isChecking}>
              {isChecking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Connection
                </>
              )}
            </Button>

            <Button variant="secondary" onClick={handleResetConnection} disabled={isResetting}>
              {isResetting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Connection"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Actions</CardTitle>
          <CardDescription>Advanced actions to fix Firebase issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Clear Firebase Cache</h3>
            <p className="text-gray-500 mb-4">
              This will clear all local Firebase data and reload the page. Use this if you're experiencing persistent
              connection issues.
            </p>
            <Button variant="destructive" onClick={handleClearCache} disabled={isClearing}>
              {isClearing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Clear Firebase Cache
                </>
              )}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">Common Issues & Solutions</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Connection errors:</strong> Check your internet connection and firewall settings.
              </li>
              <li>
                <strong>Permission denied:</strong> Verify your Firestore rules and authentication status.
              </li>
              <li>
                <strong>Quota exceeded:</strong> You may have reached your Firebase usage limits.
              </li>
              <li>
                <strong>Offline persistence issues:</strong> Try clearing the Firebase cache.
              </li>
              <li>
                <strong>Emulator connection problems:</strong> Ensure the emulator is running and properly configured.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
