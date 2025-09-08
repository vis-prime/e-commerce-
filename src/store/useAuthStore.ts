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
  resetPassword: (email: string) => Promise<any>
  updatePassword: (newPassword: string) => Promise<any>
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

  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    console.log("Password updated:", data)
    return data
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.href}update-password`,
    })

    if (error) throw error
    console.log("Password reset email sent:", data)
    return data
  },
}))
