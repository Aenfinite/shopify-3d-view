// Firebase removed — using Supabase for fabric management.
import type { FabricOption } from "@/types/configurator"

export async function getFabrics(): Promise<FabricOption[]> {
  return []
}

export async function getFabricsByCategory(category: string): Promise<FabricOption[]> {
  return []
}

export async function getFabricById(id: string): Promise<FabricOption | null> {
  return null
}

export async function createFabric(fabric: FabricOption): Promise<void> {}
export async function updateFabric(id: string, fabric: Partial<FabricOption>): Promise<void> {}
export async function deleteFabric(id: string): Promise<void> {}
