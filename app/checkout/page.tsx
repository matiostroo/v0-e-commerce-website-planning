"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, CreditCard, Truck, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/context/cart-context"
import { generateOrderId } from "@/lib/orders"
import { saveOrder } from "@/lib/orders"
import { checkProductStock } from "@/lib/actions"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, subtotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [stockError, setStockError] = useState(false)

  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    paymentMethod: "transferencia",
    shippingMethod: "envio",
  })

  // Calcular costos
  const shippingCost = formData.shippingMethod === "envio" ? 2000 : 0
  const total = subtotal + shippingCost

  // Verificar stock al cargar la página
  useEffect(() => {
    const verifyStock = async () => {
      setLoading(true)
      try {
        let hasError = false

        for (const item of items) {
          const hasStock = await checkProductStock(item.id, item.quantity)
          if (!hasStock) {
            hasError = true
            break
          }
        }

        setStockError(hasError)

        if (hasError) {
          toast({
            title: "Productos sin stock",
            description: "Algunos productos en tu carrito ya no tienen stock disponible. Por favor, revisa tu carrito.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error verificando stock:", error)
      } finally {
        setLoading(false)
      }
    }

    if (items.length > 0) {
      verifyStock()
    }
  }, [items, toast])

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar cambio de método de pago
  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }))
  }

  // Manejar cambio de método de envío
  const handleShippingMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, shippingMethod: value }))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Verificar stock nuevamente antes de procesar
      let hasStockError = false

      for (const item of items) {
        const hasStock = await checkProductStock(item.id, item.quantity)
        if (!hasStock) {
          hasStockError = true
          break
        }
      }

      if (hasStockError) {
        toast({
          title: "Productos sin stock",
          description: "Algunos productos en tu carrito ya no tienen stock disponible. Por favor, revisa tu carrito.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Generar ID de pedido
      const orderId = generateOrderId()

      // Crear objeto de pedido
      const order = {
        id: orderId,
        user_id: null, // Si el usuario no está autenticado
        status: "pending" as const,
        payment_method: formData.paymentMethod as "transferencia" | "efectivo",
        shipping_method: formData.shippingMethod as "envio" | "retiro",
        subtotal,
        shipping_cost: shippingCost,
        total,
        notes: null,
        viewed: false,
        whatsapp_sent: false,
      }

      // Crear objeto de información de envío
      const shippingInfo = {
        order_id: orderId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.shippingMethod === "envio" ? formData.address : null,
        city: formData.shippingMethod === "envio" ? formData.city : null,
        province: formData.shippingMethod === "envio" ? formData.province : null,
        postal_code: formData.shippingMethod === "envio" ? formData.postalCode : null,
      }

      // Crear array de items del pedido
      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        name: item.name,
        price: item.price,
        original_price: item.originalPrice || null,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        category: item.category,
        image: item.image,
      }))

      // Guardar pedido en la base de datos
      const savedOrderId = await saveOrder(order, shippingInfo, orderItems)

      if (!savedOrderId) {
        throw new Error("No se pudo guardar el pedido")
      }

      // Enviar correo de confirmación
      await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          orderNumber: orderId,
          items,
          total,
          paymentMethod: formData.paymentMethod,
        }),
      })

      // Enviar notificación a Telegram
      await fetch("/api/telegram-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: orderId,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          total,
          paymentMethod: formData.paymentMethod,
          shippingMethod: formData.shippingMethod,
        }),
      })

      // Limpiar carrito
      clearCart()

      // Redirigir a página de confirmación
      router.push(`/checkout/confirmacion?orderId=${orderId}`)
    } catch (error) {
      console.error("Error al procesar el pedido:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar tu pedido. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Si no hay items en el carrito, redirigir a la página del carrito
  if (items.length === 0 && !loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-10">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
            <p className="text-muted-foreground mb-6">Agrega productos a tu carrito antes de proceder al checkout.</p>
            <Button asChild>
              <Link href="/productos">Ver productos</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/carrito">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al carrito
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        {stockError ? (
          <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Productos sin stock</h2>
            <p className="text-red-600 mb-4">
              Algunos productos en tu carrito ya no tienen stock disponible. Por favor, revisa tu carrito y elimina los
              productos sin stock.
            </p>
            <Button asChild>
              <Link href="/carrito">Revisar carrito</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario de checkout */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información personal */}
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <User className="h-5 w-5 mr-2 text-gray-500" />
                    <h2 className="text-lg font-semibold">Información personal</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Método de envío */}
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Truck className="h-5 w-5 mr-2 text-gray-500" />
                    <h2 className="text-lg font-semibold">Método de envío</h2>
                  </div>
                  <RadioGroup
                    value={formData.shippingMethod}
                    onValueChange={handleShippingMethodChange}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="envio" id="envio" />
                      <Label htmlFor="envio" className="flex items-center">
                        <span className="font-medium">Envío a domicilio</span>
                        <span className="ml-2 text-sm text-muted-foreground">($2,000)</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="retiro" id="retiro" />
                      <Label htmlFor="retiro" className="flex items-center">
                        <span className="font-medium">Retiro en tienda</span>
                        <span className="ml-2 text-sm text-muted-foreground">(Gratis)</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.shippingMethod === "envio" && (
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required={formData.shippingMethod === "envio"}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Ciudad</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required={formData.shippingMethod === "envio"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="province">Provincia</Label>
                          <Input
                            id="province"
                            name="province"
                            value={formData.province}
                            onChange={handleInputChange}
                            required={formData.shippingMethod === "envio"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Código postal</Label>
                          <Input
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required={formData.shippingMethod === "envio"}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Método de pago */}
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                    <h2 className="text-lg font-semibold">Método de pago</h2>
                  </div>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={handlePaymentMethodChange}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="transferencia" id="transferencia" />
                      <Label htmlFor="transferencia" className="font-medium">
                        Transferencia bancaria
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="efectivo" id="efectivo" />
                      <Label htmlFor="efectivo" className="font-medium">
                        Efectivo (al retirar o contra entrega)
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.paymentMethod === "transferencia" && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Después de completar tu pedido, recibirás un correo electrónico con los datos bancarios para
                        realizar la transferencia.
                      </p>
                    </div>
                  )}
                </div>

                {/* Botón de finalizar compra */}
                <Button type="submit" className="w-full" size="lg" disabled={loading || stockError}>
                  {loading ? "Procesando..." : "Finalizar compra"}
                </Button>
              </form>
            </div>

            {/* Resumen del pedido */}
            <div>
              <div className="bg-white border rounded-lg p-6 sticky top-6">
                <h2 className="text-lg font-semibold mb-4">Resumen del pedido</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.color}, Talle {item.size}
                        </p>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm">x{item.quantity}</span>
                          <span>${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>{shippingCost > 0 ? `$${shippingCost.toLocaleString()}` : "Gratis"}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
