// Firebase removed — 3D models managed via static files.
export interface CustomizationValue {
  id: string
  name: string
  value: string
  price?: number
  thumbnail?: string
  layerControls?: { show?: string[]; hide?: string[] }
}
export interface CustomizationOption {
  id: string
  name: string
  type: "color" | "texture" | "component" | "style"
  category: string
  values: CustomizationValue[]
}
export interface Model3D {
  id: string
  name: string
  category: string
  description: string
  modelUrl: string
  thumbnailUrl?: string
  basePrice: number
  customizationOptions: string[]
  createdAt: Date
  updatedAt: Date
}
export async function getCustomizationOptions(modelId: string): Promise<CustomizationOption[]> { return [] }
export function buildLayerControls(selectedOptions: Record<string, string>, customizationOptions: CustomizationOption[]): Record<string, any> { return {} }
export async function getModel3D(modelId: string): Promise<Model3D | null> { return null }
export async function addModel3D(model: Omit<Model3D, "id">): Promise<string> { return "" }
export async function addCustomizationOption(option: Omit<CustomizationOption, "id">): Promise<string> { return "" }
export async function getModels(): Promise<Model3D[]> { return [] }

