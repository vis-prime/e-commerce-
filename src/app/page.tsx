import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { fetchProducts } from "@/lib/fetchProducts"
import { RapierTest } from "@/components/RapierTest"
import MainEditor from "@/components/MainEditor"
import JointDemo from "@/components/ThreadJointTest"
import { supabase } from "@/lib/supabaseClient"
import NavBar from "@/components/NavBar"

export default function Home() {
  return (
    <>
      <NavBar />
      {/* <LoginLogout /> */}
      <MainEditor />
      {/* <JointDemo /> */}
    </>
  )
}

async function signUp() {
  console.log("Signing up user...")
  const { data, error } = await supabase.auth.signUp({
    email: "vishals1030@gmail.com",
    password: "supersecret123",
  })

  console.log("Signup data:", { data, error })

  if (error) {
    console.error("Signup error:", error.message)
  } else {
    console.log("Signed up user:", data.user)
  }
}
