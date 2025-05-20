"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, ShoppingBag, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useCart } from "@/context/cart-context"
import { Separator } from "@/components/ui/separator"
import { updateOrderWhatsappStatus } from "@/lib/orders"

type OrderInfo = {
  id: string
  date: string
  items: any[]
  total: number
  shipping: {
    name: string
    email: string
    phone: string
    address?: string
    city?: string
    postalCode?: string
    province?: string
  }
  paymentMethod: string
  shippingMethod: string
}

export default function ConfirmationPage() {
  const router = useRouter()
  const { items } = useCart()
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)

  // Cargar información del pedido desde localStorage
  useEffect(() => {
    const storedOrder = localStorage.getItem("lastOrder")

    if (storedOrder) {
      try {
        setOrderInfo(JSON.parse(storedOrder))
      } catch (error) {
        console.error("Error parsing order info:", error)
      }
    } else if (items.length === 0) {
      // Si no hay pedido en localStorage y no hay items en el carrito, redirigir a inicio
      router.push("/")
    }
  }, [items, router])

  // Función para generar el mensaje de WhatsApp nuevamente
  const generateWhatsAppMessage = () => {
    if (!orderInfo) return ""

    // Encabezado del mensaje con número de pedido
    let message = `¡Hola! Quiero realizar el siguiente pedido (Nº ${orderInfo.id}):\n\n`

    // Detalles de los productos
    orderInfo.items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`
      message += `   - Cantidad: ${item.quantity}\n`
      message += `   - Color: ${item.color}\n`
      message += `   - Talle: ${item.size}\n`
      message += `   - Precio: ${item.price.toLocaleString()}\n\n`
    })

    // Información de envío
    const isDelivery = orderInfo.shippingMethod === "delivery"
    message += `Método de envío: ${isDelivery ? "Envío a domicilio" : "Retiro en tienda"}\n`
    if (isDelivery && orderInfo.shipping.address && orderInfo.shipping.city) {
      message += `Dirección: ${orderInfo.shipping.address}, ${orderInfo.shipping.city}, ${orderInfo.shipping.postalCode}, ${orderInfo.shipping.province}\n`
    }

    // Información de pago
    message += `Método de pago: ${orderInfo.paymentMethod === "transferencia" ? "Transferencia bancaria" : "Efectivo"}\n\n`

    // Totales
    message += `Total: ${orderInfo.total.toLocaleString()}\n\n`

    // Información de contacto
    message += `Mis datos de contacto:\n`
    message += `Nombre: ${orderInfo.shipping.name}\n`
    message += `Email: ${orderInfo.shipping.email}\n`
    message += `Teléfono: ${orderInfo.shipping.phone}\n`

    return encodeURIComponent(message)
  }

  const handleContactWhatsApp = () => {
    if (!orderInfo) return

    const message = generateWhatsAppMessage()
    const whatsappNumber = "+5491150535668"
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

    // Actualizar el estado del pedido para indicar que se envió por WhatsApp
    updateOrderWhatsappStatus(orderInfo.id, true)

    window.open(whatsappUrl, "_blank")
  }

  if (!orderInfo) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p>Cargando información del pedido...</p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  // Formatear fecha
  const orderDate = new Date(orderInfo.date)
  const formattedDate = orderDate.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container max-w-3xl px-4">
          <div className="bg-white p-8 border rounded-lg shadow-sm">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">¡Gracias por tu pedido!</h1>
              <p className="text-muted-foreground">
                Tu pedido ha sido registrado correctamente. Hemos enviado un correo electrónico con los detalles de tu
                compra.
              </p>
              <p className="text-muted-foreground mt-2">
                Para finalizar el proceso, te recomendamos contactarnos por WhatsApp para coordinar el pago y la
                entrega.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-md mb-8">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <h2 className="font-medium">Número de pedido</h2>
                  <p className="text-lg font-mono">{orderInfo.id}</p>
                </div>
                <div className="mt-4 md:mt-0 md:text-right">
                  <h2 className="font-medium">Fecha</h2>
                  <p>{formattedDate}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h2 className="font-medium">Detalles del pedido</h2>

                <div className="space-y-3">
                  {orderInfo.items.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-16 h-20 flex-shrink-0 relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={64}
                          height={80}
                          className="rounded-md object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <p className="text-sm font-medium">${item.price.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.color} / {item.size} / Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${orderInfo.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="font-medium mb-2">Información de contacto</h2>
                <p className="text-sm">{orderInfo.shipping.name}</p>
                <p className="text-sm">{orderInfo.shipping.email}</p>
                <p className="text-sm">{orderInfo.shipping.phone}</p>
              </div>

              <div>
                <h2 className="font-medium mb-2">Método de pago</h2>
                <p className="text-sm capitalize">
                  {orderInfo.paymentMethod === "transferencia" ? "Transferencia bancaria" : "Efectivo"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleContactWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Contactar por WhatsApp
              </Button>

              <Button asChild className="w-full bg-black hover:bg-gray-800">
                <Link href="/" className="flex items-center justify-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Seguir comprando
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
