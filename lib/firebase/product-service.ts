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
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentSnapshot,
  serverTimestamp,
} from "firebase/firestore"
import { retryOperation } from "./error-handler"
import { SAMPLE_PRODUCTS } from "@/data/sample-products"

const PRODUCTS_COLLECTION = "products"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  available: boolean
  customizable: boolean
  modelId?: string
  fabricOptions?: string[]
  styleOptions?: string[]
  measurementFields?: string[]
  createdAt: Date
  updatedAt: Date
}

export async function getProducts(
  categoryFilter?: string,
  lastVisible?: DocumentSnapshot,
  pageSize = 10,
): Promise<{ products: Product[]; lastVisible: DocumentSnapshot | null }> {
  console.log("Getting products, categoryFilter:", categoryFilter)

  // Always start with sample products for demo
  let products = [...SAMPLE_PRODUCTS]

  if (categoryFilter) {
    products = products.filter((product) => product.category === categoryFilter)
  }

  console.log("Returning sample products:", products.length)

  // Try to get additional products from Firebase if available
  try {
    let productsQuery = query(collection(db, PRODUCTS_COLLECTION), orderBy("createdAt", "desc"), limit(pageSize))

    if (categoryFilter) {
      productsQuery = query(
        collection(db, PRODUCTS_COLLECTION),
        where("category", "==", categoryFilter),
        orderBy("createdAt", "desc"),
        limit(pageSize),
      )
    }

    if (lastVisible) {
      productsQuery = query(
        collection(db, PRODUCTS_COLLECTION),
        categoryFilter ? where("category", "==", categoryFilter) : orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(pageSize),
      )
    }

    const snapshot = await retryOperation(() => getDocs(productsQuery))
    const firebaseProducts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Product[]

    // Add Firebase products to sample products (avoiding duplicates)
    const existingIds = new Set(products.map((p) => p.id))
    const newFirebaseProducts = firebaseProducts.filter((p) => !existingIds.has(p.id))
    products = [...products, ...newFirebaseProducts]

    const newLastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
    return { products, lastVisible: newLastVisible }
  } catch (error) {
    console.warn("Firebase unavailable, using sample products only:", error)
    return { products, lastVisible: null }
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  console.log("Getting product by ID:", id)

  // First check sample products
  const sampleProduct = SAMPLE_PRODUCTS.find((p) => p.id === id)
  if (sampleProduct) {
    console.log("Found sample product:", sampleProduct.name)
    return sampleProduct
  }

  // Then try Firebase
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id)
    const docSnap = await retryOperation(() => getDoc(docRef))

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Product
    }
  } catch (error) {
    console.warn("Firebase unavailable for product lookup:", error)
  }

  console.log("Product not found:", id)
  return null
}

export async function addProduct(product: Omit<Product, "id">): Promise<string> {
  try {
    const docRef = await retryOperation(() =>
      addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
    return docRef.id
  } catch (error) {
    console.error("Error adding product:", error)
    throw error
  }
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id)
    await retryOperation(() =>
      updateDoc(docRef, {
        ...product,
        updatedAt: serverTimestamp(),
      }),
    )
  } catch (error) {
    console.error(`Error updating product €{id}:`, error)
    throw error
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id)
    await retryOperation(() => deleteDoc(docRef))
  } catch (error) {
    console.error(`Error deleting product €{id}:`, error)
    throw error
  }
}

// Export sample products for use in other components
export { SAMPLE_PRODUCTS }
