// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getUserClaims() {
  const { data, error } = await supabase.auth.getClaims()

  console.log("User claims data:", data)

  if (error) {
    throw new Error(`Failed to get user claims: ${error.message}`)
  }

  return data
}
