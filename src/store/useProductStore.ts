// src/store/useProductStore.ts
import { create } from "zustand"
import { fetchProducts } from "@/lib/fetchProducts"

type Product = {
  id: string
  name: string
  price: number
}

export type ProductInScene = {
  product: Product
  position: [number, number, number] // optional for placing
  rotation: [number, number, number]
  scale: [number, number, number]
}

type ProductStore = {
  products: Product[] // fetched list
  placed: ProductInScene[] // items currently in scene
  selectedId: string | null
  setSelected: (id: string | null) => void
  fetchAllProducts: () => Promise<void>
  addToScene: (p: Product) => void
  removeFromScene: (id: string) => void
  clearScene: () => void
  updateTransform: (id: string, transform: Partial<ProductInScene>) => void
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  placed: [],
  selectedId: null,
  setSelected: (id) => set({ selectedId: id }),
  fetchAllProducts: async () => {
    const products = await fetchProducts()
    set({ products })
  },
  addToScene: (product) =>
    set((s) => ({
      placed: [
        ...s.placed,
        {
          product,
          position: [0, 0, 0], // default, can later allow dragging
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        },
      ],
    })),
  removeFromScene: (id) =>
    set((s) => ({ placed: s.placed.filter((p) => p.product.id !== id) })),
  clearScene: () => set({ placed: [] }),
  updateTransform: (id, transform) =>
    set((s) => ({
      placed: s.placed.map((p) =>
        p.product.id === id ? { ...p, ...transform } : p
      ),
    })),
}))
