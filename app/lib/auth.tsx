"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Tipos para el usuario
export type User = {
  id: string
  name: string
  email: string
  avatar?: string
  provider?: string
}

// Tipos para el contexto de autenticación
type AuthContextType = {
  user: User | null
  loading: boolean
  error: string | null
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>
  logout: () => void
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Proveedor de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Simular inicio de sesión con Google
  const loginWithGoogle = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulación de autenticación con Google
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser: User = {
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

  // Simular inicio de sesión con Facebook
  const loginWithFacebook = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulación de autenticación con Facebook
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser: User = {
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

  // Iniciar sesión con email y contraseña
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

      const newUser: User = {
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

  // Registrar nuevo usuario
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
      const userForContext: User = {
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

  // Cerrar sesión
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        loginWithGoogle,
        loginWithFacebook,
        loginWithEmail,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
