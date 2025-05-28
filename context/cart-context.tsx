"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { checkProductStock } from "@/lib/actions"

// Definir el tipo para un item del carrito
export type CartItem = {
  id: number
  name: string
  price: number
  originalPrice?: number
  quantity: number
  image: string
  color: string
  size: string
  category: string
}

// Definir el tipo para el contexto del carrito
type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => Promise<boolean>
  updateItemQuantity: (id: number, color: string, size: string, quantity: number) => Promise<boolean>
  removeItem: (id: number, color: string, size: string) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
  lastAddedItem: CartItem | null
}

// Crear el contexto
export const CartContext = createContext<CartContextType | undefined>(undefined)

// Proveedor del contexto
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null)
  const { toast } = useToast()

  // Calcular el número total de items en el carrito
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  // Calcular el subtotal del carrito
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  // Agregar un item al carrito
  const addItem = async (newItem: CartItem): Promise<boolean> => {
    try {
      // Verificar stock antes de agregar
      const hasStock = await checkProductStock(newItem.id, newItem.quantity)

      if (!hasStock) {
        toast({
          title: "Sin stock suficiente",
          description: "Lo sentimos, no hay suficiente stock disponible para este producto.",
          variant: "destructive",
        })
        return false
      }

      // Buscar si el item ya existe en el carrito (mismo id, color y talle)
      const existingItemIndex = items.findIndex(
        (item) => item.id === newItem.id && item.color === newItem.color && item.size === newItem.size,
      )

      if (existingItemIndex >= 0) {
        // Si existe, actualizar la cantidad
        const updatedItems = [...items]
        const newQuantity = updatedItems[existingItemIndex].quantity + newItem.quantity

        // Verificar stock para la cantidad actualizada
        const hasEnoughStock = await checkProductStock(newItem.id, newQuantity)

        if (!hasEnoughStock) {
          toast({
            title: "Sin stock suficiente",
            description: "Lo sentimos, no hay suficiente stock disponible para la cantidad solicitada.",
            variant: "destructive",
          })
          return false
        }

        updatedItems[existingItemIndex].quantity = newQuantity
        setItems(updatedItems)
      } else {
        // Si no existe, agregar como nuevo item
        setItems((prevItems) => [...prevItems, newItem])
      }

      // Guardar el último item agregado para mostrar notificación
      setLastAddedItem(newItem)
      return true
    } catch (error) {
      console.error("Error al agregar item al carrito:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito.",
        variant: "destructive",
      })
      return false
    }
  }

  // Actualizar la cantidad de un item
  const updateItemQuantity = async (id: number, color: string, size: string, quantity: number): Promise<boolean> => {
    try {
      if (quantity <= 0) {
        removeItem(id, color, size)
        return true
      }

      // Verificar stock antes de actualizar
      const hasStock = await checkProductStock(id, quantity)

      if (!hasStock) {
        toast({
          title: "Sin stock suficiente",
          description: "Lo sentimos, no hay suficiente stock disponible para la cantidad solicitada.",
          variant: "destructive",
        })
        return false
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id && item.color === color && item.size === size ? { ...item, quantity } : item,
        ),
      )
      return true
    } catch (error) {
      console.error("Error al actualizar cantidad:", error)
      return false
    }
  }

  // Eliminar un item del carrito
  const removeItem = (id: number, color: string, size: string) => {
    setItems((prevItems) => prevItems.filter((item) => !(item.id === id && item.color === color && item.size === size)))
  }

  // Limpiar el carrito
  const clearCart = () => {
    setItems([])
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        lastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook para usar el contexto del carrito
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
