"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AdminAuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = () => {
      const authenticated = localStorage.getItem("adminAuthenticated") === "true"
      const authTime = Number.parseInt(localStorage.getItem("adminAuthTime") || "0")

      // Sesión expira después de 24 horas
      const sessionValid = authenticated && Date.now() - authTime < 24 * 60 * 60 * 1000

      if (!sessionValid) {
        // Limpiar datos de autenticación expirados
        localStorage.removeItem("adminAuthenticated")
        localStorage.removeItem("adminAuthTime")
        router.push("/admin/login")
      } else {
        setIsAuthenticated(true)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // No renderizar nada mientras se redirige
  }

  return <>{children}</>
}
