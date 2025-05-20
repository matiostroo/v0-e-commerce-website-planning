"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ShoppingBag, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

type CartNotificationProps = {
  show: boolean
  product: {
    name: string
    image: string
    color: string
    size: string
    quantity: number
  } | null
  onClose: () => void
}

export function CartNotification({ show, product, onClose }: CartNotificationProps) {
  const router = useRouter()

  useEffect(() => {
    if (show) {
      // Aumentamos el tiempo a 5 segundos
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  const handleGoToCart = () => {
    onClose() // Cerramos la notificación inmediatamente
    router.push("/carrito") // Navegamos al carrito
  }

  return (
    <AnimatePresence>
      {show && product && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 rounded-full p-1">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-medium">Producto agregado al carrito</h3>
              </div>
              {/* Botón X para cerrar */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar notificación"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-3">
              <div className="w-16 h-20 flex-shrink-0">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={64}
                  height={80}
                  className="rounded-md object-cover w-full h-full"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  Color: {product.color} | Talle: {product.size}
                </p>
                <p className="text-xs text-muted-foreground">Cantidad: {product.quantity}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleGoToCart}
                className="flex-1 bg-black text-white py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1"
              >
                <ShoppingBag className="h-4 w-4" />
                Ver carrito
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 border rounded-md text-sm font-medium text-muted-foreground hover:bg-gray-50"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
