import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { fetchProducts } from "@/lib/fetchProducts"
import { RapierTest } from "@/components/RapierTest"
import MainEditor from "@/components/MainEditor"

export default function Home() {
  return (
    <>
      <NavBar />
      <MainEditor />
    </>
  )
}

function NavBar() {
  return (
    <nav className="flex justify-between items-center p-1 h-16 bg-accent">
      <div className="text-lg font-bold">E-Commerce</div>
      <ThemeToggle />
    </nav>
  )
}
