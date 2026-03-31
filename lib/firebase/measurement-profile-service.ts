// Firebase removed — measurement profiles stored in localStorage.

export interface MeasurementProfile {
  id: string
  userId: string
  garmentType: "jacket" | "pants" | "shirt" | "suit" | "blazer"
  profileName: string
  measurements: Record<string, number>
  measurementMethod: "videos" | "sketches"
  fitPreference?: "slim" | "regular" | "comfort"
  shoulderType?: string
  backShape?: string
  bellyType?: string
  createdAt: string
  updatedAt: string
  orderCount: number
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

export async function findCustomerByEmail(email: string): Promise<CustomerIdentity | null> { return null }
export async function upsertCustomer(data: { email: string; name?: string; phone?: string; shopifyCustomerId?: string }): Promise<CustomerIdentity> {
  return { id: "guest", email: data.email, createdAt: new Date().toISOString() }
}
export async function getCustomerProfiles(customerId: string): Promise<MeasurementProfile[]> { return [] }
export async function getProfileByGarmentType(customerId: string, garmentType: string): Promise<MeasurementProfile | null> { return null }
export async function saveMeasurementProfile(data: { customerId: string; garmentType: string; measurements: Record<string, number>; profileName?: string; measurementMethod?: string }): Promise<string> { return "" }
export async function deleteMeasurementProfile(profileId: string): Promise<void> {}
export function saveGuestProfile(data: { garmentType: string; measurements: Record<string, number>; profileName?: string }): void {}
export function getGuestProfiles(): any[] { return [] }
export function getGuestProfileByGarmentType(garmentType: string): any | null { return null }
export function clearGuestProfiles(): void {}
export async function migrateGuestProfilesToCustomer(email: string): Promise<void> {}


