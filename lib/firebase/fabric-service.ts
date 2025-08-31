import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where } from "firebase/firestore"
import { db } from "./firebase-config"
import type { FabricOption } from "@/types/configurator"

const FABRICS_COLLECTION = "fabrics"
const STORAGE_PATH = "fabrics"

// Get all fabrics
export async function getFabrics(): Promise<FabricOption[]> {
  const fabricsCollection = collection(db, FABRICS_COLLECTION)
  const snapshot = await getDocs(fabricsCollection)
  return snapshot.docs.map((doc) => doc.data() as FabricOption)
}

// Get fabrics by category
export async function getFabricsByCategory(category: string): Promise<FabricOption[]> {
  const fabricsCollection = collection(db, FABRICS_COLLECTION)
  const q = query(fabricsCollection, where("category", "==", category))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => doc.data() as FabricOption)
}

// Get a single fabric by ID
export async function getFabricById(id: string): Promise<FabricOption | null> {
  const fabricDoc = doc(db, FABRICS_COLLECTION, id)
  const snapshot = await getDoc(fabricDoc)
  return snapshot.exists() ? (snapshot.data() as FabricOption) : null
}

// Create a new fabric
export async function createFabric(fabric: FabricOption): Promise<void> {
  // Upload thumbnail if it's a File object
  if (fabric.thumbnailUrl && fabric.thumbnailUrl.startsWith("blob:")) {
    // In a real implementation, you would upload the file to Firebase Storage
    // const thumbnailRef = ref(storage, `€{STORAGE_PATH}/€{fabric.id}/thumbnail`)
    // const thumbnailSnapshot = await uploadBytes(thumbnailRef, thumbnailFile)
    // fabric.thumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref)
  }

  // Upload texture if it's a File object
  if (fabric.textureUrl && fabric.textureUrl.startsWith("blob:")) {
    // In a real implementation, you would upload the file to Firebase Storage
    // const textureRef = ref(storage, `€{STORAGE_PATH}/€{fabric.id}/texture`)
    // const textureSnapshot = await uploadBytes(textureRef, textureFile)
    // fabric.textureUrl = await getDownloadURL(textureSnapshot.ref)
  }

  const fabricDoc = doc(db, FABRICS_COLLECTION, fabric.id)
  await setDoc(fabricDoc, fabric)
}

// Update an existing fabric
export async function updateFabric(id: string, fabric: FabricOption): Promise<void> {
  // Handle image uploads similar to createFabric
  const fabricDoc = doc(db, FABRICS_COLLECTION, id)
  await setDoc(fabricDoc, fabric, { merge: true })
}

// Delete a fabric
export async function deleteFabric(id: string): Promise<void> {
  // Get the fabric to check for images to delete
  const fabric = await getFabricById(id)

  if (fabric) {
    // Delete thumbnail from storage if it exists
    if (fabric.thumbnailUrl) {
      try {
        // In a real implementation, you would delete the file from Firebase Storage
        // const thumbnailRef = ref(storage, `€{STORAGE_PATH}/€{id}/thumbnail`)
        // await deleteObject(thumbnailRef)
      } catch (error) {
        console.error("Error deleting thumbnail:", error)
      }
    }

    // Delete texture from storage if it exists
    if (fabric.textureUrl) {
      try {
        // In a real implementation, you would delete the file from Firebase Storage
        // const textureRef = ref(storage, `€{STORAGE_PATH}/€{id}/texture`)
        // await deleteObject(textureRef)
      } catch (error) {
        console.error("Error deleting texture:", error)
      }
    }
  }

  // Delete the fabric document
  const fabricDoc = doc(db, FABRICS_COLLECTION, id)
  await deleteDoc(fabricDoc)
}
