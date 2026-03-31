// Firebase removed — all customizations stored in localStorage.
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

// Save customization for logged-in user (falls back to localStorage)
export async function saveUserCustomization(
  userId: string,
  customization: Omit<SavedCustomization, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<string> {
  return saveGuestCustomization(customization)
}

export async function getUserCustomizations(userId: string): Promise<SavedCustomization[]> {
  return getGuestCustomizations()
}

export async function getUserCustomizationById(id: string): Promise<SavedCustomization | null> {
  return getGuestCustomizationById(id)
}

export async function deleteUserCustomization(id: string): Promise<boolean> {
  return deleteGuestCustomization(id)
}

export async function migrateGuestCustomizationsToUser(userId: string): Promise<number> {
  return 0
}
