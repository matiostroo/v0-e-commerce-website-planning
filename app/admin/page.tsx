"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AdminRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    const authenticated = localStorage.getItem("adminAuthenticated") === "true"
    const authTime = Number.parseInt(localStorage.getItem("adminAuthTime") || "0")

    // Sesión expira después de 24 horas
    const sessionValid = authenticated && Date.now() - authTime < 24 * 60 * 60 * 1000

    if (sessionValid) {
      router.push("/admin/pedidos")
    } else {
      router.push("/admin/login")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  )
}
