"use client"
import Image from "next/image"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "./ui/card"
import { useProductStore } from "@/store/useProductStore"
import React, { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function ProductsGrid() {
  const products = useProductStore((s) => s.products)
  const fetchAllProducts = useProductStore((s) => s.fetchAllProducts)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchAllProducts()
  }, [fetchAllProducts])

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-background p-6 rounded-2xl shadow-lg border border-accent w-full max-w-7xl mx-auto">
      <h1 className="font-bold text-2xl mb-4 text-muted-foreground">
        Products Feed
      </h1>
      <div className="mb-6 flex justify-center">
        <Input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className=" w-full"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

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

function ProductCard({ product }: { product: Product }) {
  const addToScene = useProductStore((s) => s.addToScene)
  const assets = buildProductAssets(product.id)

  return (
    <Card className="h-full flex flex-col justify-between p-1 shadow-md hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-col items-center gap-2 p-1 ">
        <CardTitle className="text-lg text-center mt-2">
          {product.name}
        </CardTitle>
        <CardDescription className="text-center">
          ${product.price}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center p-1">
        <Image
          src={assets.thumbnail}
          alt={product.name}
          width={200}
          height={200}
          className="rounded-lg drop-shadow-sm object-cover"
        />
      </CardContent>
      <CardFooter className="flex justify-center p-1">
        <Button
          variant={"outline"}
          size="sm"
          className="w-full"
          onClick={() => {
            addToScene(product)
            console.log("addToScene", useProductStore.getState())
          }}
        >
          Add
        </Button>
      </CardFooter>
    </Card>
  )
}
