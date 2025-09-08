// store/useAuthStore.ts
import { create } from "zustand"
import { supabase } from "@/lib/supabaseClient"

interface AuthState {
  session: any | null
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  init: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  error: null,

  init: async () => {
    try {
      const { data: sessionData, error } = await supabase.auth.getSession()
      if (error) {
        set({ error: error.message })
        return
      }

      if (sessionData) {
        set({
          session: sessionData.session ?? null,
          error: null,
        })

        console.log("Initialized auth state with user:", sessionData)
      }
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    set({ session: data.session })
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    set({ session: data.session })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ session: null, error: null })
  },
}))
