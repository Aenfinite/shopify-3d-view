"use client"

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore"
import { db } from "./firebase-config"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MeasurementProfile {
  id: string
  userId: string
  garmentType: "jacket" | "pants" | "shirt" | "suit" | "blazer"
  profileName: string
  measurements: Record<string, number> // key → value in cm
  measurementMethod: "videos" | "sketches"
  fitPreference?: "slim" | "regular" | "comfort"
  shoulderType?: string
  backShape?: string
  bellyType?: string
  createdAt: string   // ISO string
  updatedAt: string   // ISO string
  orderCount: number  // how many orders used this profile
}

export interface CustomerIdentity {
  id: string
  email: string
  name?: string
  phone?: string
  shopifyCustomerId?: string
  createdAt: string
  lastOrderAt?: string
}

// ─── Customer Identification ──────────────────────────────────────────────────

/**
 * Look up a customer by email. Works for both logged-in and guest flows.
 * Returns null if no customer record exists yet.
 */
export async function findCustomerByEmail(email: string): Promise<CustomerIdentity | null> {
  if (!db || !email) return null

  try {
    const customersRef = collection(db, "customers")
    const q = query(customersRef, where("email", "==", email.toLowerCase().trim()))
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    const docData = snapshot.docs[0]
    return {
      id: docData.id,
      ...docData.data()
    } as CustomerIdentity
  } catch (error) {
    console.error("Error finding customer:", error)
    return null
  }
}

/**
 * Create or update a customer record.
 * If customer with email already exists, updates the record.
 * If not, creates a new one.
 */
export async function upsertCustomer(data: {
  email: string
  name?: string
  phone?: string
  shopifyCustomerId?: string
}): Promise<CustomerIdentity> {
  if (!db) throw new Error("Firebase not initialized")

  const email = data.email.toLowerCase().trim()
  const existing = await findCustomerByEmail(email)

  if (existing) {
    // Update existing customer
    const docRef = doc(db, "customers", existing.id)
    await updateDoc(docRef, {
      ...(data.name && { name: data.name }),
      ...(data.phone && { phone: data.phone }),
      ...(data.shopifyCustomerId && { shopifyCustomerId: data.shopifyCustomerId }),
      lastOrderAt: new Date().toISOString()
    })
    return {
      ...existing,
      ...data,
      lastOrderAt: new Date().toISOString()
    }
  } else {
    // Create new customer
    const customersRef = collection(db, "customers")
    const newId = `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newCustomer: CustomerIdentity = {
      id: newId,
      email,
      name: data.name,
      phone: data.phone,
      shopifyCustomerId: data.shopifyCustomerId,
      createdAt: new Date().toISOString()
    }

    await setDoc(doc(db, "customers", newId), newCustomer)
    return newCustomer
  }
}

// ─── Measurement Profiles ─────────────────────────────────────────────────────

/**
 * Get all measurement profiles for a customer (by email).
 */
export async function getCustomerProfiles(
  email: string
): Promise<MeasurementProfile[]> {
  if (!db || !email) return []

  try {
    const customer = await findCustomerByEmail(email)
    if (!customer) return []

    const profilesRef = collection(db, "customers", customer.id, "measurement_profiles")
    const snapshot = await getDocs(profilesRef)

    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as MeasurementProfile[]
  } catch (error) {
    console.error("Error getting measurement profiles:", error)
    return []
  }
}

/**
 * Get a measurement profile for a specific garment type.
 * Returns the most recently updated profile for that garment type.
 */
export async function getProfileByGarmentType(
  email: string,
  garmentType: string
): Promise<MeasurementProfile | null> {
  if (!db || !email) return null

  try {
    const profiles = await getCustomerProfiles(email)
    const matching = profiles
      .filter(p => p.garmentType === garmentType)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return matching[0] || null
  } catch (error) {
    console.error("Error getting profile by garment type:", error)
    return null
  }
}

/**
 * Save or update a measurement profile.
 * If a profile already exists for this customer + garment type, it updates it.
 * Otherwise creates a new one.
 */
export async function saveMeasurementProfile(data: {
  email: string
  garmentType: "jacket" | "pants" | "shirt" | "suit" | "blazer"
  profileName?: string
  measurements: Record<string, number>
  measurementMethod: "videos" | "sketches"
  fitPreference?: "slim" | "regular" | "comfort"
  shoulderType?: string
  backShape?: string
  bellyType?: string
}): Promise<MeasurementProfile> {
  if (!db) throw new Error("Firebase not initialized")

  // Ensure customer exists
  const customer = await upsertCustomer({ email: data.email })

  // Check for existing profile for this garment type
  const existingProfile = await getProfileByGarmentType(data.email, data.garmentType)

  const now = new Date().toISOString()

  if (existingProfile) {
    // Update existing profile
    const profileRef = doc(db, "customers", customer.id, "measurement_profiles", existingProfile.id)
    const updatedProfile = {
      ...existingProfile,
      measurements: data.measurements,
      measurementMethod: data.measurementMethod,
      fitPreference: data.fitPreference,
      shoulderType: data.shoulderType,
      backShape: data.backShape,
      bellyType: data.bellyType,
      updatedAt: now,
      orderCount: (existingProfile.orderCount || 0) + 1
    }
    await updateDoc(profileRef, updatedProfile)
    return updatedProfile
  } else {
    // Create new profile
    const profileId = `profile_${data.garmentType}_${Date.now()}`
    const newProfile: MeasurementProfile = {
      id: profileId,
      userId: customer.id,
      garmentType: data.garmentType,
      profileName: data.profileName || `My ${data.garmentType} measurements`,
      measurements: data.measurements,
      measurementMethod: data.measurementMethod,
      fitPreference: data.fitPreference,
      shoulderType: data.shoulderType,
      backShape: data.backShape,
      bellyType: data.bellyType,
      createdAt: now,
      updatedAt: now,
      orderCount: 1
    }

    const profileRef = doc(db, "customers", customer.id, "measurement_profiles", profileId)
    await setDoc(profileRef, newProfile)
    return newProfile
  }
}

/**
 * Delete a measurement profile.
 */
export async function deleteMeasurementProfile(
  email: string,
  profileId: string
): Promise<void> {
  if (!db) return

  const customer = await findCustomerByEmail(email)
  if (!customer) return

  const { deleteDoc } = await import("firebase/firestore")
  const profileRef = doc(db, "customers", customer.id, "measurement_profiles", profileId)
  await deleteDoc(profileRef)
}

// ─── Guest Fallback (localStorage) ───────────────────────────────────────────

const GUEST_PROFILES_KEY = "guest_measurement_profiles"

export function saveGuestProfile(data: {
  garmentType: string
  measurements: Record<string, number>
  measurementMethod: string
  fitPreference?: string
  shoulderType?: string
  backShape?: string
  bellyType?: string
}): void {
  if (typeof window === "undefined") return

  try {
    const existing = getGuestProfiles()
    // Replace existing profile for same garment type, or add new
    const filtered = existing.filter(p => p.garmentType !== data.garmentType)
    filtered.push({
      ...data,
      id: `guest_${data.garmentType}_${Date.now()}`,
      profileName: `My ${data.garmentType} measurements`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    localStorage.setItem(GUEST_PROFILES_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error saving guest profile:", error)
  }
}

export function getGuestProfiles(): any[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(GUEST_PROFILES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function getGuestProfileByGarmentType(garmentType: string): any | null {
  const profiles = getGuestProfiles()
  return profiles.find(p => p.garmentType === garmentType) || null
}

export function clearGuestProfiles(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(GUEST_PROFILES_KEY)
}

/**
 * Migrate guest profiles to a customer account after they provide email.
 */
export async function migrateGuestProfilesToCustomer(email: string): Promise<void> {
  const guestProfiles = getGuestProfiles()
  if (guestProfiles.length === 0) return

  for (const profile of guestProfiles) {
    await saveMeasurementProfile({
      email,
      garmentType: profile.garmentType,
      measurements: profile.measurements,
      measurementMethod: profile.measurementMethod,
      fitPreference: profile.fitPreference,
      shoulderType: profile.shoulderType,
      backShape: profile.backShape,
      bellyType: profile.bellyType
    })
  }

  clearGuestProfiles()
}
