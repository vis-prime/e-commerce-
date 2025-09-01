import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

const STORAGE_URL =
  "https://yziafoqkerugqyjazqua.supabase.co/storage/v1/object/public/productStorage"

function buildProductAssets(id: number) {
  return {
    thumbnail: `${STORAGE_URL}/${id}/thumb.webp`,
    glb: `${STORAGE_URL}/${id}/model.glb`,
  }
}

type Product = {
  id: number
  name: string
  price: number
}

export function ProductCard({ product }: { product: Product }) {
  const assets = buildProductAssets(product.id)
  console.log({ assets })

  return (
    <div className="border rounded-xl p-4 shadow">
      <Image
        src={assets.thumbnail}
        alt={product.name}
        width={400}
        height={400}
        className="rounded-lg"
      />
      <h2 className="text-xl font-semibold mt-2">{product.name}</h2>
      <p>{product.price} ₹</p>
      {/* Example 3D viewer for GLB */}
      {/* <ModelViewer url={assets.glb} /> */}
    </div>
  )
}

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <ThemeToggle />
      <ProductCard product={{ id: 1, name: "Product 1", price: 100 }} />
    </div>
  )
}
