"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Session, User } from "@supabase/supabase-js"

function decodeJwtClaims(token: string | null) {
  if (!token) return null
  try {
    const parts = token.split(".")
    if (parts.length < 2) return null
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    )
    return payload
  } catch {
    return null
  }
}

export default function LoginLogout() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [claims, setClaims] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Init session & subscribe to auth changes
  useEffect(() => {
    let mounted = true

    async function init() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session ?? null)
      setUser(data.session?.user ?? null)
      setClaims(decodeJwtClaims(data.session?.access_token ?? null))
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session ?? null)
      setUser(session?.user ?? null)
      setClaims(decodeJwtClaims(session?.access_token ?? null))
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignUp = async () => {
    setLoading(true)
    setMessage(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else
      setMessage(
        data.session
          ? "Signed up & logged in!"
          : "Signed up, check email to confirm."
      )
    setLoading(false)
  }

  const handleSignIn = async () => {
    setLoading(true)
    setMessage(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setMessage(error.message)
    else setMessage("Signed in.")
    setLoading(false)
  }

  const handleSignOut = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signOut()
    if (error) setMessage(error.message)
    else setMessage("Signed out.")
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6  rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-center">Supabase Auth Test</h2>

      <div className="space-y-2">
        <input
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Sign Up
        </button>
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Sign In
        </button>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Sign Out
        </button>
      </div>

      {message && <div className="text-center text-gray-700">{message}</div>}

      <div className="text-xs">
        <strong>Session:</strong>
        <pre className=" p-2 rounded">{JSON.stringify(session, null, 2)}</pre>
      </div>

      <div className="text-xs">
        <strong>User:</strong>
        <pre className=" p-2 rounded">{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div className="text-xs">
        <strong>JWT Claims:</strong>
        <pre className=" p-2 rounded">{JSON.stringify(claims, null, 2)}</pre>
      </div>
    </div>
  )
}
