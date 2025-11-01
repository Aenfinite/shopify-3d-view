import { db } from "./firebase-config"
import { collection, getDocs, getDoc, doc, addDoc, query, where, serverTimestamp } from "firebase/firestore"
import { retryOperation } from "./error-handler"
import { SAMPLE_CUSTOMIZATION_OPTIONS } from "@/data/sample-products"

export interface CustomizationValue {
  id: string
  name: string
  value: string
  price?: number
  thumbnail?: string
  layerControls?: {
    show?: string[]
    hide?: string[]
  }
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

export async function getCustomizationOptions(modelId: string): Promise<CustomizationOption[]> {
  console.log("Getting customization options for model:", modelId)

  // First check sample customization options
  const sampleOptions = SAMPLE_CUSTOMIZATION_OPTIONS[modelId as keyof typeof SAMPLE_CUSTOMIZATION_OPTIONS]
  if (sampleOptions) {
    console.log("Found sample customization options:", sampleOptions.length)
    return sampleOptions
  }

  // Try Firebase as fallback
  try {
    const optionsQuery = query(collection(db, "customizationOptions"), where("modelId", "==", modelId))
    const snapshot = await retryOperation(() => getDocs(optionsQuery))

    const options = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CustomizationOption[]

    console.log("Found Firebase customization options:", options.length)
    return options
  } catch (error) {
    console.warn("Firebase unavailable for customization options:", error)
    return []
  }
}

export function buildLayerControls(
  selectedOptions: Record<string, string>,
  customizationOptions: CustomizationOption[],
): Record<string, any> {
  const layerControls: Record<string, any> = {}

  Object.entries(selectedOptions).forEach(([optionId, valueId]) => {
    const option = customizationOptions.find((opt) => opt.id === optionId)
    if (option) {
      const value = option.values.find((val) => val.id === valueId)
      if (value && value.layerControls) {
        layerControls[optionId] = value.layerControls
      }
    }
  })

  return layerControls
}

export async function getModel3D(modelId: string): Promise<Model3D | null> {
  try {
    const docRef = doc(db, "models3d", modelId)
    const docSnap = await retryOperation(() => getDoc(docRef))

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Model3D
    }
  } catch (error) {
    console.warn("Firebase unavailable for 3D model lookup:", error)
  }

  return null
}

export async function addModel3D(model: Omit<Model3D, "id">): Promise<string> {
  try {
    const docRef = await retryOperation(() =>
      addDoc(collection(db, "models3d"), {
        ...model,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
    return docRef.id
  } catch (error) {
    console.error("Error adding 3D model:", error)
    throw error
  }
}

export async function addCustomizationOption(option: Omit<CustomizationOption, "id">): Promise<string> {
  try {
    const docRef = await retryOperation(() => addDoc(collection(db, "customizationOptions"), option))
    return docRef.id
  } catch (error) {
    console.error("Error adding customization option:", error)
    throw error
  }
}

export async function getModels(): Promise<Model3D[]> {
  try {
    const snapshot = await retryOperation(() => getDocs(collection(db, "models3d")))
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Model3D[]
  } catch (error) {
    console.warn("Firebase unavailable for models list:", error)
    return []
  }
}
