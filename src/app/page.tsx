import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { fetchProducts } from "@/lib/fetchProducts"

const STORAGE_URL =
  "https://yziafoqkerugqyjazqua.supabase.co/storage/v1/object/public/productStorage"

function buildProductAssets(id: string) {
  return {
    thumbnail: `${STORAGE_URL}/${id}/thumb.webp`,
    glb: `${STORAGE_URL}/${id}/model.glb`,
  }
}

type Product = {
  id: string
  name: string
  price: number
}

export async function ProductCard({ product }: { product: Product }) {
  const assets = buildProductAssets(product.id)

  return (
    <div className="border rounded-xl p-4 shadow">
      <Image
        src={assets.thumbnail}
        alt={product.name}
        width={400}
        height={400}
        className="rounded-lg drop-shadow-xl drop-shadow-card/90"
        priority
      />
      <h2 className="text-xl font-semibold mt-2">{product.name}</h2>
      <p>{product.price} $</p>
      {/* Example 3D viewer for GLB */}
      {/* <ModelViewer url={assets.glb} /> */}
    </div>
  )
}

export default function Home() {
  return (
    <>
      <NavBar />
      <ProductsGrid />
    </>
  )
}

async function ProductsGrid() {
  const products = await fetchProducts()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-7xl">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function NavBar() {
  return (
    <nav className="flex justify-between items-center p-4">
      <div className="text-lg font-bold">E-Commerce</div>
      <ThemeToggle />
    </nav>
  )
}
