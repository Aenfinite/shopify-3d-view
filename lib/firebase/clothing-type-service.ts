import { db } from "./firebase-config"
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { retryOperation } from "./error-handler"

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

export interface CustomizationStep {
  id: number
  title: string
  type: "fabric" | "style" | "details" | "sizing" | "colors" | "custom"
  options: CustomizationOption[]
  required: boolean
  order: number
}

export interface CustomizationOption {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  color?: string
  materialMapping?: string
  values?: OptionValue[]
}

export interface OptionValue {
  id: string
  name: string
  value: string
  price: number
  image?: string
}

const CLOTHING_TYPES_COLLECTION = "clothingTypes"

export async function getClothingTypes(): Promise<ClothingType[]> {
  try {
    const clothingTypesQuery = query(collection(db, CLOTHING_TYPES_COLLECTION), orderBy("createdAt", "desc"))

    const snapshot = await retryOperation(() => getDocs(clothingTypesQuery))

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ClothingType[]
  } catch (error) {
    console.error("Error getting clothing types:", error)
    throw error
  }
}

export async function getClothingTypeById(id: string): Promise<ClothingType | null> {
  try {
    const docRef = doc(db, CLOTHING_TYPES_COLLECTION, id)
    const docSnap = await retryOperation(() => getDoc(docRef))

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as ClothingType
    }

    return null
  } catch (error) {
    console.error(`Error getting clothing type €{id}:`, error)
    throw error
  }
}

export async function createClothingType(
  clothingType: Omit<ClothingType, "id" | "createdAt" | "updatedAt">,
  modelFile?: File,
  thumbnailFile?: File,
): Promise<string> {
  try {
    // In a real implementation, you would:
    // 1. Upload files to Firebase Storage
    // 2. Get download URLs
    // 3. Save the clothing type with URLs

    const docRef = await retryOperation(() =>
      addDoc(collection(db, CLOTHING_TYPES_COLLECTION), {
        ...clothingType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )

    return docRef.id
  } catch (error) {
    console.error("Error creating clothing type:", error)
    throw error
  }
}

export async function updateClothingType(
  id: string,
  updates: Partial<ClothingType>,
  modelFile?: File,
  thumbnailFile?: File,
): Promise<void> {
  try {
    // Handle file uploads if provided
    // Update the document

    const docRef = doc(db, CLOTHING_TYPES_COLLECTION, id)
    await retryOperation(() =>
      updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      }),
    )
  } catch (error) {
    console.error(`Error updating clothing type €{id}:`, error)
    throw error
  }
}

export async function deleteClothingType(id: string): Promise<void> {
  try {
    const docRef = doc(db, CLOTHING_TYPES_COLLECTION, id)
    await retryOperation(() => deleteDoc(docRef))
  } catch (error) {
    console.error(`Error deleting clothing type €{id}:`, error)
    throw error
  }
}

export async function updateCustomizationSteps(clothingTypeId: string, steps: CustomizationStep[]): Promise<void> {
  try {
    const docRef = doc(db, CLOTHING_TYPES_COLLECTION, clothingTypeId)
    await retryOperation(() =>
      updateDoc(docRef, {
        customizationSteps: steps,
        updatedAt: serverTimestamp(),
      }),
    )
  } catch (error) {
    console.error(`Error updating customization steps for €{clothingTypeId}:`, error)
    throw error
  }
}

// Generate configurator steps from clothing type data
export function generateConfiguratorSteps(clothingType: ClothingType) {
  return clothingType.customizationSteps.map((step) => ({
    id: step.id,
    title: step.title,
    key: step.type,
    options: step.options.map((option) => ({
      id: option.id,
      name: option.name,
      price: option.price,
      color: option.color,
      image: option.image,
      description: option.description,
    })),
    // Add type-specific data based on step.type
    ...(step.type === "colors" && {
      colors: step.options.map((option) => ({
        id: option.id,
        name: option.name,
        hex: option.color || "#000000",
      })),
    }),
    ...(step.type === "fabric" && {
      colors: step.options
        .filter((opt) => opt.color)
        .map((option) => ({
          id: option.id,
          name: option.name,
          hex: option.color!,
        })),
    }),
  }))
}
