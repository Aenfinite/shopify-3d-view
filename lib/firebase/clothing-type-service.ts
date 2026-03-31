// Firebase removed — clothing types are hardcoded.
export interface CustomizationStep { id: string; name: string; type: string }
export interface ClothingType {
  id: string
  name: string
  description: string
  category: string
  basePrice: number
  isActive: boolean
  allowMTM: boolean
  allowMTO: boolean
  thumbnailUrl?: string
  modelUrl?: string
  customizationSteps: CustomizationStep[]
  createdAt: Date
  updatedAt: Date
}
export async function getClothingTypes(): Promise<ClothingType[]> { return [] }
export async function getClothingTypeById(id: string): Promise<ClothingType | null> { return null }
export async function createClothingType(data: Omit<ClothingType, "id" | "createdAt" | "updatedAt">): Promise<string> { return "" }
export async function updateClothingType(id: string, data: Partial<ClothingType>): Promise<void> {}
export async function deleteClothingType(id: string): Promise<void> {}

