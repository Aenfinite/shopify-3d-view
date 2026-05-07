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
    /**
     * Legacy multiplier-based tiling (1–16). Kept for backward compatibility
     * and as a ±20% fine-tune when cm-based tiling is active.
     */
    repeat_x: number
    repeat_y: number
    darkness: number
    /**
     * Real-cm repeat width of the fabric print tile. When > 0 the 3D viewer
     * uses cm-based tiling: repeats_x = garment_width_cm / repeat_width_cm.
     * 0 or undefined falls back to the legacy multiplier system.
     */
    repeat_width_cm?: number
    /** Real-cm repeat height of the fabric print tile. */
    repeat_height_cm?: number
    /**
     * Visual scale factor: higher = larger pattern on garment.
     * 1 = true production scale, 5 = default (5× larger). Saved per fabric.
     */
    fine_tune?: number
    /**
     * Material category. 'outer' = outer shell fabric (default, backward compat).
     * 'lining' = interior lining fabric, shown only in the customer lining picker
     * and applied to lining meshes (interior surfaces) with lining-specific PBR.
     * Stored inside pbr_settings JSONB to avoid a DB schema migration.
     */
    fabric_category?: "outer" | "lining"
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

// ─── Lining PBR Presets ─────────────────────────────────────
// Lining fabrics look different from outer fabrics:
//   - lower roughness (silky / satin-like)
//   - slight sheen (catches light on curves)
//   - almost no normal map (smooth, not textured weave)
//   - minimal bump (flat silk feel)
// V1: one shared preset. Can split per sub-type (silk/cupro/polyester) later.
export const LINING_PBR_PRESETS: Record<string, FabricRow["pbr_settings"]> = {
  silk: {
    normal_scale: 0.05,
    roughness:    0.30,
    bump_scale:   0.02,
    sheen:        0.25,
    repeat_x:     4,
    repeat_y:     4,
    darkness:     0,
    fabric_category: "lining",
  },
  cupro: {
    normal_scale: 0.04,
    roughness:    0.35,
    bump_scale:   0.02,
    sheen:        0.20,
    repeat_x:     4,
    repeat_y:     4,
    darkness:     0,
    fabric_category: "lining",
  },
  polyester: {
    normal_scale: 0.06,
    roughness:    0.38,
    bump_scale:   0.03,
    sheen:        0.18,
    repeat_x:     4,
    repeat_y:     4,
    darkness:     0,
    fabric_category: "lining",
  },
}

/** Read the fabric category, defaulting to 'outer' for legacy rows. */
export function getFabricCategory(fabric: Pick<FabricRow, "pbr_settings">): "outer" | "lining" {
  return fabric.pbr_settings?.fabric_category === "lining" ? "lining" : "outer"
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

/**
 * Fetch all fabrics and filter by category in-memory.
 * Category lives inside pbr_settings JSONB so we can't query via Supabase
 * `.eq()` directly; this helper does the filter client-side.
 */
export async function getFabricsByCategory(
  category: "outer" | "lining",
  productId?: string,
): Promise<FabricRow[]> {
  let query = supabase.from("fabrics").select("*").order("sort_order")
  if (productId) query = query.eq("product_id", productId)
  const { data, error } = await query
  if (error || !data) return []
  return (data as FabricRow[]).filter((f) => getFabricCategory(f) === category)
}

/** Convenience: all lining fabrics, optionally filtered by product. */
export async function getLiningFabrics(productId?: string): Promise<FabricRow[]> {
  return getFabricsByCategory("lining", productId)
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
