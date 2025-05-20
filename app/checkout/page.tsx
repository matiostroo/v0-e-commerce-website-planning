"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CreditCard, MapPin, Truck, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import { saveOrder } from "@/lib/orders"

// Función para generar un ID único de 5 caracteres alfanuméricos
const generateOrderId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// Modificar la función sendConfirmationEmail para manejar mejor los errores
const sendConfirmationEmail = async (
  email: string,
  orderNumber: string,
  items: any[],
  total: number,
  paymentMethod: string,
) => {
  try {
    console.log("Enviando correo a:", email, "con número de orden:", orderNumber)

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        orderNumber,
        items,
        total,
        paymentMethod,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Error en la respuesta de la API:", data)
      throw new Error(data.error || "Error al enviar el correo")
    }

    return data
  } catch (error) {
    console.error("Error detallado al enviar el correo:", error)
    throw error
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState("transferencia")
  const [shippingMethod, setShippingMethod] = useState("pickup")
  const [loading, setLoading] = useState(false)
  const [processingOrder, setProcessingOrder] = useState(false)

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    province: "",
  })

  // Calcular totales
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = shippingMethod === "delivery" ? 1500 : 0
  const total = subtotal + shipping

  // Verificar si hay items en el carrito
  useEffect(() => {
    if (items.length === 0 && !processingOrder) {
      router.push("/carrito")
    }
  }, [items, router, processingOrder])

  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingInfo((prev) => ({ ...prev, [name]: value }))
  }

  // Función para generar el mensaje de WhatsApp
  const generateWhatsAppMessage = (orderNumber: string) => {
    // Encabezado del mensaje con número de pedido
    let message = `¡Hola! Quiero realizar el siguiente pedido (Nº ${orderNumber}):\n\n`

    // Detalles de los productos
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`
      message += `   - Cantidad: ${item.quantity}\n`
      message += `   - Color: ${item.color}\n`
      message += `   - Talle: ${item.size}\n`
      message += `   - Precio: ${item.price.toLocaleString()}\n\n`
    })

    // Información de envío
    message += `Método de envío: ${shippingMethod === "pickup" ? "Retiro en tienda" : "Envío a domicilio"}\n`
    if (shippingMethod === "delivery") {
      message += `Dirección: ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.province}\n`
    }

    // Información de pago
    message += `Método de pago: ${paymentMethod === "transferencia" ? "Transferencia bancaria" : "Efectivo"}\n\n`

    // Totales
    message += `Subtotal: ${subtotal.toLocaleString()}\n`
    message += `Envío: ${shipping > 0 ? `${shipping.toLocaleString()}` : "Gratis"}\n`
    message += `Total: ${total.toLocaleString()}\n\n`

    // Información de contacto
    message += `Mis datos de contacto:\n`
    message += `Nombre: ${shippingInfo.name}\n`
    message += `Email: ${shippingInfo.email}\n`
    message += `Teléfono: ${shippingInfo.phone}\n`

    return encodeURIComponent(message)
  }

  // Modificar la función saveOrder para que sea asíncrona
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que todos los campos requeridos estén completos
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.phone) {
      toast({
        title: "Información incompleta",
        description: "Por favor completa todos los campos de contacto",
        variant: "destructive",
      })
      return
    }

    if (
      shippingMethod === "delivery" &&
      (!shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.province)
    ) {
      toast({
        title: "Información de envío incompleta",
        description: "Por favor completa todos los campos de la dirección de envío",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setProcessingOrder(true)

    try {
      // Generar número de pedido alfanumérico de 5 caracteres
      const orderNumber = generateOrderId()

      // Crear objeto de pedido
      const orderInfo = {
        id: orderNumber,
        items,
        shipping: shippingInfo,
        total,
        subtotal,
        shippingCost: shipping,
        paymentMethod,
        shippingMethod,
        status: "pendiente",
        date: new Date().toISOString(),
        whatsappSent: false,
      }

      // Guardar la información del pedido en localStorage para la página de confirmación
      localStorage.setItem("lastOrder", JSON.stringify(orderInfo))

      // Guardar el pedido en la "base de datos"
      await saveOrder(orderInfo)

      // Enviar correo de confirmación
      try {
        await sendConfirmationEmail(shippingInfo.email, orderNumber, items, total, paymentMethod)
        toast({
          title: "Correo enviado",
          description: "Hemos enviado un correo de confirmación con los detalles de tu pedido",
        })
      } catch (emailError) {
        console.error("Error al enviar correo:", emailError)
        // No interrumpimos el flujo si falla el envío del correo
        toast({
          title: "No se pudo enviar el correo de confirmación",
          description: "Continuaremos con tu pedido, pero no pudimos enviar el correo de confirmación",
          variant: "destructive",
        })
      }

      // Limpiar carrito
      clearCart()

      // Mostrar mensaje de éxito
      toast({
        title: "Pedido realizado",
        description:
          "Tu pedido ha sido registrado correctamente. Ahora serás redirigido para contactarnos por WhatsApp.",
      })

      // Generar el mensaje para WhatsApp con el número de pedido
      const message = generateWhatsAppMessage(orderNumber)

      // Número de WhatsApp (sin espacios ni caracteres especiales)
      const whatsappNumber = localStorage.getItem("whatsappNumber") || "+5491150535668"

      // Crear la URL de WhatsApp
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${message}`

      // Abrir WhatsApp
      window.open(whatsappUrl, "_blank")

      // Redirigir a página de confirmación
      router.push("/checkout/confirmacion")
    } catch (error) {
      toast({
        title: "Error al procesar el pedido",
        description: "Hubo un problema al procesar tu pedido. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      setProcessingOrder(false)
    } finally {
      setLoading(false)
    }
  }

  // Si no hay items y no estamos procesando un pedido, mostrar mensaje de carga
  if (items.length === 0 && !processingOrder) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p>Cargando...</p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container px-4 py-6 md:py-12">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/carrito" className="text-sm text-muted-foreground hover:text-black">
              Carrito
            </Link>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm">Checkout</span>
          </div>

          <h1 className="text-3xl font-bold mb-8">Finalizar compra</h1>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información de envío */}
                <div className="bg-white p-6 border rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <h2 className="text-xl font-semibold">Información de contacto</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        name="name"
                        value={shippingInfo.name}
                        onChange={handleShippingInfoChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={handleShippingInfoChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={handleShippingInfoChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Método de envío */}
                <div className="bg-white p-6 border rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="h-5 w-5 text-gray-500" />
                    <h2 className="text-xl font-semibold">Método de envío</h2>
                  </div>

                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-3">
                    <div className="flex items-start space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                      <div className="grid gap-1.5">
                        <Label htmlFor="pickup" className="font-medium">
                          Retirar en tienda (Gratis)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Retira tu pedido en nuestra tienda: Av. Corrientes 1234, CABA
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                      <div className="grid gap-1.5 w-full">
                        <Label htmlFor="delivery" className="font-medium">
                          Envío a domicilio ($1.500)
                        </Label>
                        <p className="text-sm text-muted-foreground mb-4">
                          Entrega en 2-3 días hábiles en Capital Federal
                        </p>

                        {shippingMethod === "delivery" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            <div className="space-y-2">
                              <Label htmlFor="address">Dirección</Label>
                              <Input
                                id="address"
                                name="address"
                                value={shippingInfo.address}
                                onChange={handleShippingInfoChange}
                                required={shippingMethod === "delivery"}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="city">Ciudad</Label>
                              <Input
                                id="city"
                                name="city"
                                value={shippingInfo.city}
                                onChange={handleShippingInfoChange}
                                required={shippingMethod === "delivery"}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="postalCode">Código Postal</Label>
                              <Input
                                id="postalCode"
                                name="postalCode"
                                value={shippingInfo.postalCode}
                                onChange={handleShippingInfoChange}
                                required={shippingMethod === "delivery"}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="province">Provincia</Label>
                              <Input
                                id="province"
                                name="province"
                                value={shippingInfo.province}
                                onChange={handleShippingInfoChange}
                                required={shippingMethod === "delivery"}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Método de pago */}
                <div className="bg-white p-6 border rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <h2 className="text-xl font-semibold">Método de pago</h2>
                  </div>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <div className="flex items-start space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="transferencia" id="transferencia" className="mt-1" />
                      <div className="grid gap-1.5">
                        <Label htmlFor="transferencia" className="font-medium">
                          Transferencia bancaria
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Te enviaremos los datos bancarios por WhatsApp para realizar la transferencia
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="efectivo" id="efectivo" className="mt-1" />
                      <div className="grid gap-1.5">
                        <Label htmlFor="efectivo" className="font-medium">
                          Efectivo
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Paga en efectivo al momento de recibir tu pedido o al retirarlo en tienda
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" type="button" asChild>
                    <Link href="/carrito" className="flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Volver al carrito
                    </Link>
                  </Button>
                  <Button
                    type="submit"
                    className="bg-black hover:bg-gray-800 flex items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      "Procesando pedido..."
                    ) : (
                      <>
                        Finalizar y enviar WhatsApp
                        <MessageSquare className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Resumen de compra */}
            <div>
              <div className="bg-white border rounded-lg p-6 space-y-6 sticky top-24">
                <h2 className="text-xl font-semibold">Resumen de compra</h2>

                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={`${item.id}-${item.color}-${item.size}-${index}`} className="flex gap-3">
                      <div className="w-16 h-20 flex-shrink-0 relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="rounded-md object-cover"
                        />
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-xs">
                          {item.quantity}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {item.color} / {item.size}
                        </p>
                        <p className="text-sm font-medium mt-1">${item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span>{shipping > 0 ? `${shipping.toLocaleString()}` : "Gratis"}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
