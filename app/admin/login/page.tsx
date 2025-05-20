"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Contraseña hardcodeada - en una aplicación real, usarías una autenticación más segura
    const correctPassword = "princesalolo"

    if (password === correctPassword) {
      // Guardar estado de autenticación en localStorage
      localStorage.setItem("adminAuthenticated", "true")
      localStorage.setItem("adminAuthTime", Date.now().toString())

      toast({
        title: "Acceso concedido",
        description: "Bienvenido al panel de administración",
      })

      router.push("/admin/pedidos")
    } else {
      toast({
        title: "Acceso denegado",
        description: "Contraseña incorrecta",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <Image src="/logo.png" alt="Galazzia" width={60} height={60} className="mb-4" />
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p className="text-sm text-muted-foreground">Ingresa la contraseña para acceder</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Ingresa la contraseña"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-black hover:bg-gray-800" disabled={loading}>
            {loading ? "Verificando..." : "Acceder"}
          </Button>
        </form>
      </div>
    </div>
  )
}
