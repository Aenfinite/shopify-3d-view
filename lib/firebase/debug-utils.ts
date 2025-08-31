import { db, auth } from "./firebase-config"
import { collection, getDocs, query, limit, enableNetwork, disableNetwork } from "firebase/firestore"

// Check if Firebase is properly initialized
export async function checkFirebaseConnection(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  // Skip if we're on the server or if db is not available
  if (typeof window === "undefined" || !db) {
    return {
      success: false,
      message: "Firebase is not available in this environment",
      details: {
        environment: typeof window === "undefined" ? "server" : "client",
        firestoreInstance: !!db,
        authInstance: !!auth,
      },
    }
  }

  try {
    // Try to make a simple query
    const testQuery = query(collection(db, "products"), limit(1))
    const snapshot = await getDocs(testQuery)

    return {
      success: true,
      message: `Connection successful. Retrieved €{snapshot.size} documents.`,
      details: {
        firestoreInstance: !!db,
        authInstance: !!auth,
        documentsRetrieved: snapshot.size,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: €{error instanceof Error ? error.message : "Unknown error"}`,
      details: {
        error,
        firestoreInstance: !!db,
        authInstance: !!auth,
      },
    }
  }
}

// Reset Firebase connection
export async function resetFirebaseConnection(): Promise<{
  success: boolean
  message: string
}> {
  // Skip if we're on the server or if db is not available
  if (typeof window === "undefined" || !db) {
    return {
      success: false,
      message: "Firebase is not available in this environment",
    }
  }

  try {
    // Disable network
    await disableNetwork(db)

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Re-enable network
    await enableNetwork(db)

    return {
      success: true,
      message: "Firebase connection reset successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to reset connection: €{error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Get Firebase configuration info
export function getFirebaseConfigInfo() {
  // Skip if we're on the server or if db is not available
  if (typeof window === "undefined" || !db) {
    return {
      firestoreInitialized: false,
      authInitialized: false,
      projectId: "unavailable",
      authDomain: "unavailable",
      usingEmulator: false,
      environment: typeof window === "undefined" ? "server" : "client",
    }
  }

  return {
    firestoreInitialized: !!db,
    authInitialized: !!auth,
    projectId: db?.app?.options?.projectId || "unknown",
    authDomain: auth?.app?.options?.authDomain || "unknown",
    usingEmulator: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true",
    environment: "client",
  }
}

// Clear Firebase cache
export async function clearFirebaseCache(): Promise<{
  success: boolean
  message: string
}> {
  // Skip if we're on the server
  if (typeof window === "undefined") {
    return {
      success: false,
      message: "Cannot clear cache on server",
    }
  }

  try {
    // Clear IndexedDB
    if (window.indexedDB) {
      const databases = await window.indexedDB.databases()
      databases.forEach((database) => {
        if (database.name?.includes("firestore")) {
          window.indexedDB.deleteDatabase(database.name)
        }
      })
    }

    // Reload the page to reinitialize Firebase
    window.location.reload()

    return {
      success: true,
      message: "Firebase cache cleared successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to clear cache: €{error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
