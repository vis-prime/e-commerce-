"use client"
import Image from "next/image"
import { useProductStore } from "@/store/useProductStore"
import React, { useEffect, useState } from "react"

export default function ProductsGrid() {
  const products = useProductStore((s) => s.products)
  const fetchAllProducts = useProductStore((s) => s.fetchAllProducts)

  useEffect(() => {
    fetchAllProducts()
  }, [fetchAllProducts])

  return (
    <div className="ring-1 p-2 rounded-2xl">
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
  const assets = buildProductAssets(product.id)

  const selectProduct = useProductStore((s) => s.selectProduct)

  const onClick = React.useCallback(() => {
    selectProduct(product.id)
    console.log("Product selected:", product.id)
    console.log("Store state:", useProductStore.getState())
  }, [product.id, selectProduct])

  return (
    <div
      className="border rounded-xl p-4 shadow cursor-pointer hover:shadow-lg hover:scale-105 transition"
      onClick={onClick}
    >
      <Image
        src={assets.thumbnail}
        alt={product.name}
        width={400}
        height={400}
        className="rounded-lg drop-shadow-xl"
      />
      <h2 className="text-xl font-semibold mt-2">{product.name}</h2>
      <p>{product.price} $</p>
    </div>
  )
}
