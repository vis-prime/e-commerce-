// src/store/useProductStore.ts
import { create } from "zustand"
import { fetchProducts } from "@/lib/fetchProducts"
import * as THREE from "three"
import { RapierRigidBody } from "@react-three/rapier"

type Product = {
  id: string
  name: string
  price: number
}

export type ProductInScene = {
  sceneId: string
  product: Product
  position: THREE.Vector3Tuple
  rotation: THREE.EulerTuple
  scale: THREE.Vector3Tuple
}

type ProductStore = {
  products: Product[] // fetched list
  placed: ProductInScene[] // items currently in scene

  selectedId: string | null
  setSelectedId: (id: string | null) => void

  selectedRigidBodyRef: React.RefObject<RapierRigidBody> | null
  setSelectedRigidBodyRef: (rb: React.RefObject<RapierRigidBody> | null) => void

  selectedMaterials: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[]
  setSelectedMaterials: (
    mats: (THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial)[]
  ) => void
  updateMaterial: (
    matUuid: string,
    updates: Partial<THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial>
  ) => void

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
  setSelectedId: (id: string | null) => set({ selectedId: id }),

  selectedRigidBodyRef: null,
  setSelectedRigidBodyRef: (rb) => set({ selectedRigidBodyRef: rb }),

  selectedMaterials: [],

  setSelectedMaterials: (mats) => set({ selectedMaterials: mats }),
  updateMaterial: (matUuid, updates) =>
    set((state) => {
      const mats = state.selectedMaterials
      const mat = mats.find((m) => m.uuid === matUuid)
      if (mat) {
        Object.assign(mat, updates)
        mat.needsUpdate = true
      }
      return { selectedMaterials: [...mats] }
    }),

  fetchAllProducts: async () => {
    const products = await fetchProducts()
    set({ products })
  },
  addToScene: (product) =>
    set((s) => ({
      placed: [
        ...s.placed,
        {
          sceneId: crypto.randomUUID(),
          product,
          position: [0, 0, 0], // default, can later allow dragging
          rotation: [0, 0, 0, "XYZ"],
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
