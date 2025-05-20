"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { toast } = useToast()
  const { items, updateQuantity, removeItem } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState("")

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = 0 // El envío se calculará en el checkout
  const discountAmount = (subtotal * discount) / 100
  const total = subtotal - discountAmount // Sin incluir el costo de envío

  const applyCoupon = () => {
    // Limpiar mensaje de error anterior
    setCouponError("")

    if (couponApplied) {
      toast({
        title: "Error",
        description: "Ya has aplicado un cupón a esta compra.",
        variant: "destructive",
      })
      return
    }

    if (couponCode.toUpperCase() === "GALAZZIALOLITA") {
      setDiscount(15) // 15% de descuento
      setCouponApplied(true)
      toast({
        title: "Cupón aplicado",
        description: "Se ha aplicado un 15% de descuento a tu compra.",
      })
    } else {
      setCouponError("Cupón inválido. Intenta con otro código.")
      toast({
        title: "Cupón inválido",
        description: "El código ingresado no es válido o ha expirado.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container px-4 py-6 md:py-12">
          <h1 className="text-3xl font-bold mb-6">Tu Carrito</h1>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">Tu carrito está vacío</h2>
              <p className="text-muted-foreground mb-6">Parece que aún no has agregado productos a tu carrito.</p>
              <Link href="/productos">
                <Button>Explorar productos</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="space-y-6">
                  {items.map((item, index) => (
                    <div key={`${item.id}-${item.color}-${item.size}-${index}`} className="flex gap-4 pb-6 border-b">
                      <div className="w-24 h-24 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={120}
                          height={150}
                          className="rounded-md object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between">
                          <h3 className="font-semibold">{item.name}</h3>
                          <div className="font-semibold">${(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Color: {item.color}</p>
                          <p>Talle: {item.size}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}
                              className="px-2 py-1 border-r"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3 py-1 text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                              className="px-2 py-1 border-l"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id, item.color, item.size)}
                            className="text-muted-foreground hover:text-black"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link href="/productos">
                    <Button variant="outline" className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Continuar comprando
                    </Button>
                  </Link>
                </div>
              </div>
              <div>
                <div className="border rounded-lg p-6 space-y-6">
                  <h2 className="text-xl font-semibold">Resumen de compra</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento ({discount}%)</span>
                        <span>-${discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Envío</span>
                      <span>Se calculará en el checkout</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coupon">Cupón de descuento</Label>
                    <div className="flex gap-2">
                      <Input
                        id="coupon"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value)
                          // Limpiar mensaje de error cuando el usuario comienza a escribir
                          if (couponError) setCouponError("")
                        }}
                        placeholder="Ingresa tu código"
                        disabled={couponApplied}
                      />
                      <Button variant="outline" onClick={applyCoupon} disabled={couponApplied}>
                        Aplicar
                      </Button>
                    </div>
                    {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
                    {couponApplied && (
                      <p className="text-xs text-green-600 mt-1">Cupón GALAZZIALOLITA aplicado (15% de descuento)</p>
                    )}
                  </div>
                  {/* Agregamos más espacio antes del botón de finalizar compra */}
                  <div className="pt-6">
                    <Link href="/checkout">
                      <Button className="w-full bg-black hover:bg-gray-800 text-white gap-2">
                        Finalizar compra
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
