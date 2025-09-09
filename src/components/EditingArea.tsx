"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import ProductsGrid from "./ProductsGrid"
import { useProductStore } from "@/store/useProductStore"
import * as THREE from "three"

export default function EditingArea() {
  return (
    <div className="w-full h-full p-2 overflow-y-auto border-t md:border-l md:border-t-0">
      <div className="flex gap-2 mb-4">
        <Button>Save</Button>
        <Button variant="outline">Export</Button>
        <Button variant="secondary">Settings</Button>
      </div>

      <ProductsGrid />
      <MaterialEditor />
    </div>
  )
}

function MaterialEditor() {
  const selectedId = useProductStore((s) => s.selectedId)
  const materials = useProductStore((s) => s.selectedMaterials)
  const updateMaterial = useProductStore((s) => s.updateMaterial)
  const productName = useProductStore(
    (s) => s.products.find((p) => p.id === selectedId)?.name
  )

  if (!selectedId) return null

  if (!materials || materials.length === 0) return null

  return (
    <div className="p-2 space-y-2   ring-1 rounded-2xl ring-accent shadow-md">
      <h3 className="font-semibold">Editing {productName}</h3>
      {materials.map((mat) => (
        <div
          key={mat.uuid}
          className="flex items-center space-x-2  ring-1 rounded-lg p-1 ring-accent shadow-md"
        >
          <span>{mat.name || "Material"}</span>
          <input
            type="color"
            value={"#" + new THREE.Color(mat.color).getHexString()}
            onChange={(e) => {
              const hex = e.target.value
              updateMaterial(mat.uuid, { color: new THREE.Color(hex) })
            }}
          />
        </div>
      ))}
    </div>
  )
}
