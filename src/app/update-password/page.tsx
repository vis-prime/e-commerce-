"use client"
import { useAuthStore } from "@/store/useAuthStore"
import React, { useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)

  const { updatePassword, session, init } = useAuthStore((s) => s)
  useEffect(() => {
    init()
  }, [init])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }
    setLoading(true)
    try {
      const result = await updatePassword(newPassword)
      if (result?.error) {
        setMessage("There was an error updating your password.")
      } else {
        setMessage("Password updated successfully!")
      }
    } catch (err) {
      setMessage("There was an error updating your password.")
    }
    setLoading(false)
  }

  const email = session?.user?.email

  if (!email) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 border border-border rounded-lg shadow-sm bg-card text-card-foreground">
        <h2 className="mb-6 text-2xl font-bold text-center">
          No user session found. Can't Reset Password.
        </h2>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-border rounded-lg shadow-sm bg-card text-card-foreground">
      <h2 className="mb-6 text-2xl font-bold text-center">
        Reset Password for {session?.user?.email}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type={showPasswords ? "text" : "password"}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground pr-12"
            required
          />
        </div>
        <div className="relative">
          <input
            type={showPasswords ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground pr-12"
            required
          />
        </div>
        <button
          type="button"
          onClick={() => setShowPasswords((v) => !v)}
          className="w-full py-2 rounded-md bg-muted text-muted-foreground font-semibold hover:bg-muted/80 transition flex items-center justify-center gap-2"
        >
          {showPasswords ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
          {showPasswords ? "Hide Passwords" : "Show Passwords"}
        </button>
        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
      {message && (
        <div
          className={`mt-4 text-center font-medium ${
            message.includes("successfully")
              ? "text-green-600"
              : "text-destructive"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}
export default ResetPasswordPage
