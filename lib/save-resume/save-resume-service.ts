import { db } from "@/lib/firebase/firebase-config"
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import type { FabricOption, StyleOption, SizeOption, MeasurementSet } from "@/types/configurator"

// Local storage key
const STORAGE_KEY = "garment_customization"

// Interface for saved customization
export interface SavedCustomization {
  id: string
  userId?: string
  name: string
  mode: "MTM" | "MTO"
  productId: string
  fabric: FabricOption | null
  styles: Record<string, StyleOption>
  size?: SizeOption | null
  measurements?: MeasurementSet | null
  price: number
  createdAt: string
  updatedAt: string
}

// Save customization for guest user
export function saveGuestCustomization(
  customization: Omit<SavedCustomization, "id" | "createdAt" | "updatedAt">,
): string {
  try {
    const id = `guest-€{Date.now()}`
    const timestamp = new Date().toISOString()

    const savedCustomization: SavedCustomization = {
      ...customization,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // Get existing saved customizations
    const existingSaved = localStorage.getItem(STORAGE_KEY)
    let savedCustomizations: SavedCustomization[] = []

    if (existingSaved) {
      savedCustomizations = JSON.parse(existingSaved)
    }

    // Add new customization
    savedCustomizations.push(savedCustomization)

    // Save to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCustomizations))

    return id
  } catch (error) {
    console.error("Error saving guest customization:", error)
    throw error
  }
}

// Get all guest customizations
export function getGuestCustomizations(): SavedCustomization[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return []
    }

    return JSON.parse(saved)
  } catch (error) {
    console.error("Error getting guest customizations:", error)
    return []
  }
}

// Get a specific guest customization
export function getGuestCustomizationById(id: string): SavedCustomization | null {
  try {
    const customizations = getGuestCustomizations()
    return customizations.find((c) => c.id === id) || null
  } catch (error) {
    console.error("Error getting guest customization by ID:", error)
    return null
  }
}

// Delete a guest customization
export function deleteGuestCustomization(id: string): boolean {
  try {
    const customizations = getGuestCustomizations()
    const filtered = customizations.filter((c) => c.id !== id)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))

    return true
  } catch (error) {
    console.error("Error deleting guest customization:", error)
    return false
  }
}

// Save customization for logged-in user
export async function saveUserCustomization(
  userId: string,
  customization: Omit<SavedCustomization, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<string> {
  try {
    const id = `user-€{Date.now()}`
    const timestamp = new Date().toISOString()

    const savedCustomization: SavedCustomization = {
      ...customization,
      id,
      userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // Save to Firestore
    await setDoc(doc(db, "savedCustomizations", id), savedCustomization)

    return id
  } catch (error) {
    console.error("Error saving user customization:", error)
    throw error
  }
}

// Get all customizations for a user
export async function getUserCustomizations(userId: string): Promise<SavedCustomization[]> {
  try {
    const customizationsRef = collection(db, "savedCustomizations")
    const q = query(customizationsRef, where("userId", "==", userId))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => doc.data() as SavedCustomization)
  } catch (error) {
    console.error("Error getting user customizations:", error)
    return []
  }
}

// Get a specific user customization
export async function getUserCustomizationById(id: string): Promise<SavedCustomization | null> {
  try {
    const docRef = doc(db, "savedCustomizations", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as SavedCustomization
    }

    return null
  } catch (error) {
    console.error("Error getting user customization by ID:", error)
    return null
  }
}

// Delete a user customization
export async function deleteUserCustomization(id: string): Promise<boolean> {
  try {
    await setDoc(
      doc(db, "savedCustomizations", id),
      {
        deleted: true,
        deletedAt: new Date().toISOString(),
      },
      { merge: true },
    )

    return true
  } catch (error) {
    console.error("Error deleting user customization:", error)
    return false
  }
}

// Migrate guest customizations to user account
export async function migrateGuestCustomizationsToUser(userId: string): Promise<number> {
  try {
    const guestCustomizations = getGuestCustomizations()

    if (guestCustomizations.length === 0) {
      return 0
    }

    let migratedCount = 0

    for (const customization of guestCustomizations) {
      const { id, ...rest } = customization

      await saveUserCustomization(userId, rest)
      migratedCount++
    }

    // Clear guest customizations after migration
    localStorage.removeItem(STORAGE_KEY)

    return migratedCount
  } catch (error) {
    console.error("Error migrating guest customizations:", error)
    throw error
  }
}
