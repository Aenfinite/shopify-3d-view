import ProductList from "@/components/product-list"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Custom Tailored Clothing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Design your perfect garment with our advanced 3D customization system. Every piece is made-to-measure with
            premium materials.
          </p>
        </div>

        <ProductList />
      </div>
    </div>
  )
}
