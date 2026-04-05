import { supabase } from "./client"

// ─── Product Types (for fabric-manager dropdown only) ───────
export interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  category: string
  type: string
  images: string[]
}

// Hardcoded product list — used only by fabric admin UI for the filter dropdown
const PRODUCTS: Product[] = [
  { id: "shirt-001", name: "Classic Dress Shirt", description: "", basePrice: 89.99, category: "shirts", type: "shirt", images: [] },
  { id: "pants-001", name: "Tailored Trousers", description: "", basePrice: 129.99, category: "pants", type: "pants", images: [] },
  { id: "jacket-001", name: "Business Blazer", description: "", basePrice: 299.99, category: "jackets", type: "jacket", images: [] },
  { id: "bespoke-shirt", name: "Bespoke Shirt", description: "", basePrice: 149.99, category: "shirts", type: "shirt", images: [] },
  { id: "bespoke-blazer", name: "Bespoke Blazer", description: "", basePrice: 399.99, category: "jackets", type: "jacket", images: [] },
  { id: "bespoke-pants", name: "Bespoke Trousers", description: "", basePrice: 199.99, category: "pants", type: "pants", images: [] },
]

export async function getAllProducts(): Promise<Product[]> {
  return PRODUCTS
}

// ─── Fabric Types ───────────────────────────────────────────
export interface FabricRow {
  id: string
  product_id: string
  name: string
  fabric_type: "cotton" | "linen" | "polyester"
  input_mode: "swatch" | "hex" | "upload"
  color_hex: string | null
  image_url: string | null
  thumbnail_url: string | null
  price: number
  is_printed: boolean
  pbr_settings: {
    normal_scale: number
    roughness: number
    bump_scale: number
    sheen: number
    repeat_x: number
    repeat_y: number
    darkness: number
  }
  sort_order: number
  created_at: string
  updated_at: string
}

// Default PBR presets per fabric type
export const PBR_PRESETS: Record<string, FabricRow["pbr_settings"]> = {
  cotton: {
    normal_scale: 0.45,
    roughness: 0.60,
    bump_scale: 0.20,
    sheen: 0.15,
    repeat_x: 4,
    repeat_y: 4,
    darkness: 0,
  },
  linen: {
    normal_scale: 0.38,
    roughness: 0.55,
    bump_scale: 0.25,
    sheen: 0.20,
    repeat_x: 4,
    repeat_y: 4,
    darkness: 0,
  },
  polyester: {
    normal_scale: 0.10,
    roughness: 0.45,
    bump_scale: 0.05,
    sheen: 0.10,
    repeat_x: 4,
    repeat_y: 4,
    darkness: 0,
  },
}

// ─── Fabrics CRUD ───────────────────────────────────────────
export async function getFabricsByProduct(productId: string): Promise<FabricRow[]> {
  const { data, error } = await supabase
    .from("fabrics")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order")

  if (error || !data) return []
  return data as FabricRow[]
}

export async function getFabricsByType(fabricType: string): Promise<FabricRow[]> {
  const { data, error } = await supabase
    .from("fabrics")
    .select("*")
    .eq("fabric_type", fabricType)
    .order("sort_order")

  if (error || !data) return []
  return data as FabricRow[]
}

export async function getFabricById(id: string): Promise<FabricRow | null> {
  const { data, error } = await supabase
    .from("fabrics")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return null
  return data as FabricRow
}

export async function createFabric(fabric: Omit<FabricRow, "id" | "created_at" | "updated_at">): Promise<FabricRow | null> {
  const { data, error } = await supabase
    .from("fabrics")
    .insert(fabric)
    .select()
    .single()

  if (error || !data) return null
  return data as FabricRow
}

export async function updateFabric(id: string, updates: Partial<FabricRow>): Promise<FabricRow | null> {
  const { data, error } = await supabase
    .from("fabrics")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error || !data) return null
  return data as FabricRow
}

export async function deleteFabric(id: string): Promise<boolean> {
  const { error } = await supabase.from("fabrics").delete().eq("id", id)
  return !error
}

// ─── Fabric Image Upload ────────────────────────────────────
export async function uploadFabricImage(
  file: File,
  productId: string
): Promise<string | null> {
  const ext = file.name.split(".").pop()
  const fileName = `${productId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from("fabrics")
    .upload(fileName, file, { cacheControl: "3600", upsert: false })

  if (error) return null

  const { data } = supabase.storage.from("fabrics").getPublicUrl(fileName)
  return data.publicUrl
}

export async function deleteFabricImage(url: string): Promise<boolean> {
  // Extract path from full URL
  const match = url.match(/\/fabrics\/(.+)$/)
  if (!match) return false

  const { error } = await supabase.storage.from("fabrics").remove([match[1]])
  return !error
}

// ─── System Status ──────────────────────────────────────────
export async function getSystemStatus() {
  const { count: fabricCount } = await supabase
    .from("fabrics")
    .select("*", { count: "exact", head: true })

  return {
    supabaseConnected: true,
    totalFabrics: fabricCount || 0,
    lastSync: new Date().toISOString(),
  }
}
