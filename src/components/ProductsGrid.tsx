"use client"
import Image from "next/image"
import { useProductStore } from "@/store/useProductStore"
import React, { useEffect, useState } from "react"
import { Button } from "./ui/button"

export default function ProductsGrid() {
  const products = useProductStore((s) => s.products)
  const fetchAllProducts = useProductStore((s) => s.fetchAllProducts)

  useEffect(() => {
    fetchAllProducts()
  }, [fetchAllProducts])

  return (
    <div className="ring-1 p-2 rounded-2xl ring-accent shadow-md">
      <span className="font-semibold"> Products Feed</span>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full max-w-7xl">
        {products.map((product) => (
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
    <div className="border rounded-xl p-4 shadow">
      <Image
        src={assets.thumbnail}
        alt={product.name}
        width={400}
        height={400}
        className="rounded-lg drop-shadow-xl"
      />
      <h2 className="text-xl font-semibold mt-2">{product.name}</h2>
      <p>{product.price} $</p>
      <Button
        onClick={() => {
          addToScene(product)
          console.log("addToScene", useProductStore.getState())
        }}
      >
        Add
      </Button>
    </div>
  )
}
