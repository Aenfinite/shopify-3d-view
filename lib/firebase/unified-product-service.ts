import { SAMPLE_PRODUCTS_WITH_CUSTOMIZATION, type CustomizationOption } from "@/data/sample-products-with-customization"

export interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  category: string
  images: string[]
  type: string
}

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "shirt-001",
    name: "Classic Dress Shirt",
    description: "A timeless dress shirt perfect for any occasion",
    basePrice: 89.99,
    category: "shirts",
    images: ["/placeholder.svg?height=400&width=400&text=Classic+Dress+Shirt"],
    type: "shirt",
  },
  {
    id: "pants-001",
    name: "Tailored Trousers",
    description: "Premium tailored trousers for the modern gentleman",
    basePrice: 129.99,
    category: "pants",
    images: ["/placeholder.svg?height=400&width=400&text=Tailored+Trousers"],
    type: "pants",
  },
  {
    id: "jacket-001",
    name: "Business Blazer",
    description: "Professional blazer for business and formal occasions",
    basePrice: 299.99,
    category: "jackets",
    images: ["/placeholder.svg?height=400&width=400&text=Business+Blazer"],
    type: "jacket",
  },
  {
    id: "bespoke-shirt",
    name: "Bespoke Shirt",
    description: "Fully customizable bespoke shirt",
    basePrice: 149.99,
    category: "shirts",
    images: ["/placeholder.svg?height=400&width=400&text=Bespoke+Shirt"],
    type: "shirt",
  },
  {
    id: "bespoke-blazer",
    name: "Bespoke Blazer",
    description: "Fully customizable bespoke blazer",
    basePrice: 399.99,
    category: "jackets",
    images: ["/placeholder.svg?height=400&width=400&text=Bespoke+Blazer"],
    type: "jacket",
  },
  {
    id: "bespoke-pants",
    name: "Bespoke Trousers",
    description: "Fully customizable bespoke trousers",
    basePrice: 199.99,
    category: "pants",
    images: ["/placeholder.svg?height=400&width=400&text=Bespoke+Trousers"],
    type: "pants",
  },
]

export async function getProductById(productId: string): Promise<Product | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  const product = SAMPLE_PRODUCTS.find((p) => p.id === productId)
  return product || null
}

export async function getCustomizationOptions(productId: string): Promise<CustomizationOption[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  const options = SAMPLE_PRODUCTS_WITH_CUSTOMIZATION[productId as keyof typeof SAMPLE_PRODUCTS_WITH_CUSTOMIZATION]
  return options || []
}

export async function saveCustomizationOptions(productId: string, options: CustomizationOption[]): Promise<void> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  // In a real app, this would save to Firebase
  console.log(`Saving customization options for product €{productId}:`, options)
}

export async function getProductsWithCustomization(): Promise<Product[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  return SAMPLE_PRODUCTS.filter((product) => Object.keys(SAMPLE_PRODUCTS_WITH_CUSTOMIZATION).includes(product.id))
}
