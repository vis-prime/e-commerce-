"use client"
import { useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login")

  const {
    login,
    signUp,
    error: authError,
    resetPassword,
  } = useAuthStore((s) => s)

  const handleAuth = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === "login") {
        await login(email, password)
        onClose()
      } else if (mode === "signup") {
        await signUp(email, password)
        onClose()
      } else if (mode === "forgot") {
        await resetPassword(email)
        setError("Password reset email sent!")
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-secondary/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{
          y: { type: "spring", stiffness: 100, damping: 10 },
          opacity: { duration: 0.3 },
        }}
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {mode === "login"
                ? "Login to your account"
                : mode === "signup"
                ? "Create an account"
                : "Reset your password"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Enter your email below to login to your account"
                : mode === "signup"
                ? "Enter your email and password to sign up"
                : "Enter your email to receive a password reset link"}
            </CardDescription>
            <CardAction>
              {mode !== "forgot" ? (
                <div className="flex flex-col  gap-2  sm:gap-4 w-full justify-between">
                  <Button
                    variant="link"
                    type="button"
                    onClick={() =>
                      setMode(mode === "login" ? "signup" : "login")
                    }
                    className="p-0"
                  >
                    {mode === "login" ? "Sign Up" : "Login"}
                  </Button>

                  {mode === "login" && (
                    <Button
                      variant="link"
                      type="button"
                      className="p-0 text-sm underline-offset-4 hover:underline"
                      onClick={() => setMode("forgot")}
                    >
                      Forgot your password?
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex w-full justify-end">
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => setMode("login")}
                    className="p-0"
                  >
                    Back to Login
                  </Button>
                </div>
              )}
            </CardAction>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {mode === "login" || mode === "signup" ? (
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              ) : null}
              <p className="text-red-500 text-sm">{error || authError}</p>

              <div className="flex flex-col gap-4 justify-end space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading
                    ? mode === "login"
                      ? "Logging in..."
                      : mode === "signup"
                      ? "Signing up..."
                      : "Sending..."
                    : mode === "login"
                    ? "Login"
                    : mode === "signup"
                    ? "Sign Up"
                    : "Send Reset Link"}
                </Button>
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
