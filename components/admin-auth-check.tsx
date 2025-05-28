"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AdminAuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si el admin está autenticado
    const adminAuthenticated = localStorage.getItem("adminAuthenticated")
    const adminAuthTime = localStorage.getItem("adminAuthTime")

    if (!adminAuthenticated || adminAuthenticated !== "true") {
      // No autenticado, redirigir al login
      router.push("/admin/login")
      return
    }

    // Verificar si la sesión ha expirado (24 horas)
    if (adminAuthTime) {
      const authTime = Number.parseInt(adminAuthTime, 10)
      const now = Date.now()
      const hoursSinceAuth = (now - authTime) / (1000 * 60 * 60)

      if (hoursSinceAuth > 24) {
        // Sesión expirada, redirigir al login
        localStorage.removeItem("adminAuthenticated")
        localStorage.removeItem("adminAuthTime")
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        })
        router.push("/admin/login")
        return
      }
    }

    // Autenticado y sesión válida
    setIsAuthenticated(true)
    setIsLoading(false)
  }, [router, toast])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-200 rounded-full border-t-black"></div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : null
}
