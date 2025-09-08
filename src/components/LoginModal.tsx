"use client"
import { useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { Input } from "@/components/ui/input"
import { Button } from "./ui/button"
import { AnimatePresence, motion } from "framer-motion"

interface LoginModalProps {
  onClose: () => void
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, error: authError } = useAuthStore((s) => s)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      onClose()
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-secondary/50 backdrop-blur-sm  flex items-center justify-center z-50"
    >
      <motion.div
        className="bg-secondary rounded-xl shadow-lg p-6 w-96 max-w-full"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <h2 className="text-lg font-semibold  mb-4">Login</h2>

        <form className="flex flex-col space-y-3" onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {(error || authError) && (
            <p className="text-red-500 text-sm">{error || authError}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className=" bg-blue-500  hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Button type="button" variant={"outline"} onClick={onClose}>
            Cancel
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
