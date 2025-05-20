"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type CartItem = {
  id: number
  name: string
  price: number
  originalPrice?: number
  color: string
  size: string
  quantity: number
  image: string
  category: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: number, color: string, size: string) => void
  updateQuantity: (id: number, color: string, size: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  lastAddedItem: CartItem | null
  showNotification: boolean
  closeNotification: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null)
  const [showNotification, setShowNotification] = useState(false)

  // Cargar carrito desde localStorage cuando el componente se monta (solo en el cliente)
  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart)
        setItems(parsedCart)

        // Calcular el número total de items
        const count = parsedCart.reduce((total: number, item: CartItem) => total + item.quantity, 0)
        setItemCount(count)
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error)
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(items))

      // Actualizar el contador de items
      const count = items.reduce((total, item) => total + item.quantity, 0)
      setItemCount(count)
    } else {
      localStorage.removeItem("cart")
      setItemCount(0)
    }
  }, [items])

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Verificar si el producto ya existe en el carrito (mismo id, color y talle)
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === newItem.id && item.color === newItem.color && item.size === newItem.size,
      )

      let updatedItems

      if (existingItemIndex >= 0) {
        // Si existe, actualizar la cantidad
        updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += newItem.quantity
      } else {
        // Si no existe, agregar el nuevo item
        updatedItems = [...prevItems, newItem]
      }

      // Guardar el último item agregado para la notificación
      setLastAddedItem(newItem)
      setShowNotification(true)

      return updatedItems
    })
  }

  const removeItem = (id: number, color: string, size: string) => {
    setItems((prevItems) => prevItems.filter((item) => !(item.id === id && item.color === color && item.size === size)))
  }

  const updateQuantity = (id: number, color: string, size: string, quantity: number) => {
    if (quantity < 1) return

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.color === color && item.size === size ? { ...item, quantity } : item,
      ),
    )
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("cart")
  }

  const closeNotification = () => {
    setShowNotification(false)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        lastAddedItem,
        showNotification,
        closeNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
