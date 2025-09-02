"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import ProductsGrid from "./ProductsGrid" // <- Server Component, stays async

export default function EditingArea() {
  return (
    <div className="w-full h-full bg-gray-200/50 p-4 overflow-y-auto">
      <div className="flex gap-2 mb-4">
        <Button>Save</Button>
        <Button variant="outline">Export</Button>
        <Button variant="secondary">Settings</Button>
      </div>

      <ProductsGrid />
    </div>
  )
}
