// lib/fetchProducts.ts
import { supabase } from "./supabaseClient"

export async function fetchProducts() {
  console.log("Fetching products...")
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data
}
