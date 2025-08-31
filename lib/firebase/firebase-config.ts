import { initializeApp, getApps, getApp } from "firebase/app"
import { connectFirestoreEmulator, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"
import { getAuth, connectAuthEmulator } from "firebase/auth"

// Only initialize Firebase on the client side
const initializeFirebaseClient = () => {
  if (typeof window === "undefined") {
    // Return null values for server-side rendering
    return {
      app: null,
      db: null,
      storage: null,
      auth: null,
    }
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  // Initialize Firebase
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

  // Initialize Firestore with persistence settings
  const db = initializeFirestore(app, {
    localCache: {
      // Use LRU cache with unlimited size
      lruGarbageCollector: {
        sizeThreshold: CACHE_SIZE_UNLIMITED,
      },
    },
  })

  const storage = getStorage(app)
  const auth = getAuth(app)

  // Connect to Firebase emulators if enabled
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
    try {
      connectFirestoreEmulator(db, "localhost", 8080)
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
      connectStorageEmulator(storage, "localhost", 9199)
      console.log("Connected to Firebase emulators")
    } catch (err) {
      console.error("Failed to connect to Firebase emulators:", err)
    }
  }

  return { app, db, storage, auth }
}

// Initialize Firebase client
const { app, db, storage, auth } = initializeFirebaseClient()

export { app, db, storage, auth }
