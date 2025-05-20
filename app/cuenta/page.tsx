"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Facebook, LogOut, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Componente cliente que se renderiza solo en el navegador
export default function AccountPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Detectar cuando estamos en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Si no estamos en el cliente, mostrar un estado de carga
  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-md px-4 text-center">
            <p>Cargando...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  // Renderizar el contenido del cliente
  return <ClientAccountPage />
}

// Componente que contiene toda la lógica de autenticación
function ClientAccountPage() {
  const { toast } = useToast()
  const router = useRouter()

  // Simulación de autenticación sin usar useAuth
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing user from localStorage:", error)
      }
    }
    setLoading(false)
  }, [])

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterData((prev) => ({ ...prev, [name]: value }))
  }

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      // Simulación de autenticación con email
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verificar si el usuario existe en localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const foundUser = users.find((u: any) => u.email === email)

      if (!foundUser) {
        throw new Error("Usuario no encontrado")
      }

      if (foundUser.password !== password) {
        throw new Error("Contraseña incorrecta")
      }

      const newUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
      }

      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulación de autenticación con Google
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser = {
        id: `google-${Date.now()}`,
        name: "Usuario de Google",
        email: "usuario@gmail.com",
        avatar: "https://lh3.googleusercontent.com/a/default-user",
        provider: "google",
      }

      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
    } catch (err) {
      setError("Error al iniciar sesión con Google")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loginWithFacebook = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulación de autenticación con Facebook
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser = {
        id: `facebook-${Date.now()}`,
        name: "Usuario de Facebook",
        email: "usuario@facebook.com",
        avatar: "https://graph.facebook.com/default-user/picture",
        provider: "facebook",
      }

      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
    } catch (err) {
      setError("Error al iniciar sesión con Facebook")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    setLoading(true)
    setError(null)

    try {
      // Validaciones
      if (!name || !email || !password || !confirmPassword) {
        throw new Error("Todos los campos son obligatorios")
      }

      if (password !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden")
      }

      // Simulación de registro
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verificar si el usuario ya existe
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      if (users.some((u: any) => u.email === email)) {
        throw new Error("El email ya está registrado")
      }

      // Crear nuevo usuario
      const newUser = {
        id: `email-${Date.now()}`,
        name,
        email,
        password, // En una aplicación real, esto debería estar hasheado
      }

      // Guardar usuario en "base de datos" (localStorage)
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // Iniciar sesión automáticamente
      const userForContext = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      }

      setUser(userForContext)
      localStorage.setItem("user", JSON.stringify(userForContext))
    } catch (err: any) {
      setError(err.message || "Error al registrar usuario")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await loginWithEmail(loginData.email, loginData.password)
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente",
      })
    } catch (err) {
      // El error ya se maneja en la función loginWithEmail
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(registerData.name, registerData.email, registerData.password, registerData.confirmPassword)
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      })
    } catch (err) {
      // El error ya se maneja en la función register
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión con Google",
      })
    } catch (err) {
      // El error ya se maneja en la función loginWithGoogle
    }
  }

  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook()
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión con Facebook",
      })
    } catch (err) {
      // El error ya se maneja en la función loginWithFacebook
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          {user ? (
            // Perfil de usuario
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  {user.avatar ? (
                    <Image
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-10 w-10 text-gray-500" />
                  )}
                </div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                {user.provider && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded mt-2">Conectado con {user.provider}</span>
                )}
              </div>

              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h2 className="font-medium mb-2">Mis pedidos</h2>
                  <p className="text-sm text-muted-foreground">No tienes pedidos recientes.</p>
                </div>

                <div className="border-t pt-4">
                  <h2 className="font-medium mb-2">Mis direcciones</h2>
                  <p className="text-sm text-muted-foreground">No tienes direcciones guardadas.</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Agregar dirección
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <Button variant="outline" onClick={handleLogout} className="w-full flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Formulario de inicio de sesión/registro
            <div>
              <div className="flex flex-col items-center mb-8">
                <Image src="/logo.png" alt="Galazzia" width={60} height={60} className="mb-4" />
                <h1 className="text-2xl font-bold">Mi Cuenta</h1>
                <p className="text-muted-foreground text-center mt-2">
                  Inicia sesión o crea una cuenta para gestionar tus pedidos y acceder a beneficios exclusivos.
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="register">Registrarse</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
                        <Image src="/google-logo.svg" alt="Google" width={20} height={20} className="mr-2" />
                        Continuar con Google
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleFacebookLogin} disabled={loading}>
                        <Facebook className="mr-2 h-5 w-5 text-blue-600" />
                        Continuar con Facebook
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">O</span>
                      </div>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={loginData.email}
                          onChange={handleLoginChange}
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Contraseña</Label>
                          <Link href="/cuenta/recuperar" className="text-xs text-black hover:underline">
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </div>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-black hover:bg-gray-800" disabled={loading}>
                        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                      </Button>
                    </form>
                  </div>
                </TabsContent>
                <TabsContent value="register">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
                        <Image src="/google-logo.svg" alt="Google" width={20} height={20} className="mr-2" />
                        Registrarse con Google
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleFacebookLogin} disabled={loading}>
                        <Facebook className="mr-2 h-5 w-5 text-blue-600" />
                        Registrarse con Facebook
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">O</span>
                      </div>
                    </div>

                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          name="name"
                          value={registerData.name}
                          onChange={handleRegisterChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-register">Email</Label>
                        <Input
                          id="email-register"
                          name="email"
                          type="email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-register">Contraseña</Label>
                        <Input
                          id="password-register"
                          name="password"
                          type="password"
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                        <Input
                          id="confirm-password"
                          name="confirmPassword"
                          type="password"
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-black hover:bg-gray-800" disabled={loading}>
                        {loading ? "Creando cuenta..." : "Crear cuenta"}
                      </Button>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
