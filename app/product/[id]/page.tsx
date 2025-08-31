import { UniversalConfigurator } from "@/components/configurator/universal-configurator"
import { getProductById } from "@/lib/firebase/unified-product-service"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const product = await getProductById(resolvedParams.id)

  if (!product) {
    notFound()
  }

  // Determine product type from category or name
  const getProductType = () => {
    if (product.category === "pants" || product.name.toLowerCase().includes("pant")) {
      return "pants"
    }
    if (
      product.category === "jackets" ||
      product.name.toLowerCase().includes("jacket") ||
      product.name.toLowerCase().includes("blazer")
    ) {
      return "jacket"
    }
    if (product.category === "dresses" || product.name.toLowerCase().includes("dress")) {
      return "dress"
    }
    return "shirt" // default
  }

  return (
    <div className="min-h-screen">
      <UniversalConfigurator
        productId={product.id}
        productName={product.name}
        basePrice={product.basePrice}
        productType={getProductType()}
      />
    </div>
  )
}
