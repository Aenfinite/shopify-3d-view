// Firebase removed — products are hardcoded in unified-product-service.
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  available: boolean
  images?: string[]
}

export async function getProducts(
  categoryFilter?: string,
  _lastVisible?: any,
  limitCount = 12
): Promise<{ products: Product[]; lastVisible: null }> {
  return { products: [], lastVisible: null }
}

export async function getProductById(id: string): Promise<Product | null> {
  return null
}

export async function createProduct(product: Omit<Product, "id">): Promise<string> {
  return ""
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {}
export async function deleteProduct(id: string): Promise<void> {}
