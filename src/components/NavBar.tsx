"use client"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { supabase } from "@/lib/supabaseClient"
import { UserRoundX, UserCheck } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import LoginModal from "./LoginModal"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"
import { AnimatePresence } from "framer-motion"

export default function NavBar() {
  const init = useAuthStore((s) => s.init)
  const logout = useAuthStore((s) => s.logout)
  useEffect(() => {
    init()
  }, [init])
  const session = useAuthStore((s) => s.session) // or session user
  const [showLogin, setShowLogin] = useState(false)

  const email = session?.user?.email || ""

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="flex justify-between items-center px-6 py-2 h-16 bg-secondary dark:bg-accent border-b border-gray-200 dark:border-gray-700 rounded-b-xl shadow-sm">
      <div className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
        E-Commerce
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />

        {/* User/Login Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"outline"}
              className="flex items-center space-x-1 "
            >
              {session ? <UserCheck /> : <UserRoundX />}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {session ? (
              <>
                <DropdownMenuLabel>{email}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 cursor-pointer"
                >
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={() => setShowLogin(true)}
                className="text-blue-500 cursor-pointer"
              >
                Login
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AnimatePresence>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </AnimatePresence>
    </nav>
  )
}
