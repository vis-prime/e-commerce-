"use client"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { supabase } from "@/lib/supabaseClient"
import { UserIcon } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import LoginModal from "./LoginModal"

export default function NavBar() {
  const init = useAuthStore((s) => s.init)
  const logout = useAuthStore((s) => s.logout)
  useEffect(() => {
    init()
  }, [init])
  const session = useAuthStore((s) => s.session) // or session user
  const [showLogin, setShowLogin] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  console.log("NavBar user:", session)

  return (
    <nav className="flex justify-between items-center px-6 py-2 h-16 bg-white dark:bg-accent border-b border-gray-200 dark:border-gray-700 rounded-b-xl shadow-sm">
      <div className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
        E-Commerce
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />

        {/* User/Login */}
        {session ? (
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-red-500"
          >
            <UserIcon size={20} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-blue-500"
          >
            <UserIcon size={20} />
            <span className="hidden sm:inline">Login</span>
          </button>
        )}
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </nav>
  )
}
