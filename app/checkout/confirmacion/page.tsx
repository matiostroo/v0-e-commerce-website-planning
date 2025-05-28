"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, ArrowLeft, Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getOrderById } from "@/lib/orders"
import type { Order, ShippingInfo, OrderItem } from "@/lib/supabase"

export default function ConfirmacionPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return

      try {
        const { order, shippingInfo, orderItems } = await getOrderById(orderId)
        setOrder(order)
        setShippingInfo(shippingInfo)
        setOrderItems(orderItems)
      } catch (error) {
        console.error("Error fetching order details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const handleCopyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!orderId) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-10">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Pedido no encontrado</h1>
            <p className="text-muted-foreground mb-6">No se encontró información del pedido.</p>
            <Button asChild>
              <Link href="/">Volver al inicio</Link>
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
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white border rounded-lg p-8 mb-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">¡Gracias por tu compra!</h1>
              <p className="text-muted-foreground">Tu pedido ha sido recibido y está siendo procesado.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <div className="bg-gray-50 px-4 py-2 rounded-md flex items-center">
                <span className="text-muted-foreground mr-2">Pedido #:</span>
                <span className="font-medium">{orderId}</span>
                <button
                  onClick={handleCopyOrderId}
                  className="ml-2 p-1 hover:bg-gray-200 rounded-md"
                  aria-label="Copiar número de pedido"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 rounded-full border-t-black"></div>
              </div>
            ) : (
              <>
                {order && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Detalles del pedido</h2>
                      <div className="bg-gray-50 rounded-md p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Fecha</p>
                            <p className="font-medium">
                              {new Date(order.created_at).toLocaleDateString("es-AR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Estado</p>
                            <p className="font-medium capitalize">
                              {order.status === "pending"
                                ? "Pendiente"
                                : order.status === "processing"
                                  ? "En proceso"
                                  : order.status === "completed"
                                    ? "Completado"
                                    : "Cancelado"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Método de pago</p>
                            <p className="font-medium capitalize">
                              {order.payment_method === "transferencia" ? "Transferencia bancaria" : "Efectivo"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Método de envío</p>
                            <p className="font-medium capitalize">
                              {order.shipping_method === "envio" ? "Envío a domicilio" : "Retiro en tienda"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {shippingInfo && (
                      <div>
                        <h2 className="text-lg font-semibold mb-3">Información de contacto</h2>
                        <div className="bg-gray-50 rounded-md p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Nombre</p>
                              <p className="font-medium">{shippingInfo.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-medium">{shippingInfo.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Teléfono</p>
                              <p className="font-medium">{shippingInfo.phone}</p>
                            </div>
                          </div>

                          {order.shipping_method === "envio" && (
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground mb-1">Dirección de envío</p>
                              <p className="font-medium">
                                {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.province},{" "}
                                {shippingInfo.postal_code}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h2 className="text-lg font-semibold mb-3">Productos</h2>
                      <div className="border rounded-md overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Producto</th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Cantidad</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Precio</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {orderItems.map((item) => (
                                <tr key={item.id}>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center">
                                      {item.image && (
                                        <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                                          <Image
                                            src={item.image || "/placeholder.svg"}
                                            alt={item.name}
                                            fill
                                            className="object-cover rounded-md"
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {item.color}, Talle {item.size}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                                  <td className="px-4 py-3 text-right">
                                    ${(item.price * item.quantity).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="bg-gray-50 rounded-md p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>${order.subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Envío</span>
                            <span>
                              {order.shipping_cost > 0 ? `$${order.shipping_cost.toLocaleString()}` : "Gratis"}
                            </span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>${order.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {order.payment_method === "transferencia" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <h3 className="font-semibold mb-2">Instrucciones de pago</h3>
                        <p className="text-sm mb-3">
                          Para completar tu compra, realiza una transferencia bancaria con los siguientes datos:
                        </p>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Banco:</span> Banco Nación
                          </p>
                          <p>
                            <span className="font-medium">Titular:</span> Galazzia S.R.L.
                          </p>
                          <p>
                            <span className="font-medium">CUIT:</span> 30-71234567-8
                          </p>
                          <p>
                            <span className="font-medium">CBU:</span> 0110000000000000000000
                          </p>
                          <p>
                            <span className="font-medium">Alias:</span> GALAZZIA.TIENDA
                          </p>
                          <p>
                            <span className="font-medium">Monto:</span> ${order.total.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm mt-3">
                          Una vez realizada la transferencia, envía el comprobante por WhatsApp al +54 9 11 5053 5668
                          indicando tu número de pedido.
                        </p>
                      </div>
                    )}

                    <div className="bg-gray-50 border rounded-md p-4">
                      <h3 className="font-semibold mb-2">¿Qué sigue?</h3>
                      <p className="text-sm">
                        Te contactaremos por WhatsApp para coordinar la entrega o el retiro de tu pedido. Si tienes
                        alguna pregunta, no dudes en escribirnos al +54 9 11 5053 5668.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="text-center">
            <Button asChild>
              <Link href="/productos">Seguir comprando</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
