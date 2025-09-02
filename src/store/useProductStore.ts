// useProductStore.ts
import { create } from "zustand"
import { fetchProducts } from "@/lib/fetchProducts"

type Product = {
  id: string
  name: string
  price: number
}

interface ProductState {
  products: Product[]
  selectedProduct: string | null
  fetchAllProducts: () => Promise<void>
  selectProduct: (id: string | null) => void
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  selectedProduct: null,
  fetchAllProducts: async () => {
    const data = await fetchProducts()
    set({ products: data })
  },
  selectProduct: (id) => set({ selectedProduct: id }),
}))
