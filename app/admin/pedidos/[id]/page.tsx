"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MessageSquare, Pencil, Save, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import AdminAuthCheck from "@/components/admin-auth-check"
import {
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  addOrderNotes,
  updateOrderWhatsappStatus,
  type Order,
} from "@/lib/orders"
import { useToast } from "@/hooks/use-toast"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [isEditingNotes, setIsEditingNotes] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [params.id])

  const loadOrder = () => {
    setLoading(true)
    try {
      const orderData = getOrderById(params.id)
      if (orderData) {
        setOrder(orderData)
        setNotes(orderData.notes || "")
      } else {
        toast({
          title: "Pedido no encontrado",
          description: `No se encontró el pedido con ID ${params.id}`,
          variant: "destructive",
        })
        router.push("/admin/pedidos")
      }
    } catch (error) {
      console.error("Error al cargar el pedido:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el pedido",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: Order["status"]) => {
    if (!order) return

    try {
      updateOrderStatus(order.id, newStatus)
      loadOrder()
      toast({
        title: "Estado actualizado",
        description: `El pedido ha sido actualizado a "${newStatus}"`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
        variant: "destructive",
      })
    }
  }

  const handleDeleteOrder = () => {
    if (!order) return

    if (window.confirm(`¿Estás seguro de que deseas eliminar el pedido ${order.id}?`)) {
      try {
        deleteOrder(order.id)
        toast({
          title: "Pedido eliminado",
          description: `El pedido ${order.id} ha sido eliminado`,
        })
        router.push("/admin/pedidos")
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el pedido",
          variant: "destructive",
        })
      }
    }
  }

  const handleSaveNotes = () => {
    if (!order) return

    try {
      addOrderNotes(order.id, notes)
      setIsEditingNotes(false)
      toast({
        title: "Notas guardadas",
        description: "Las notas del pedido han sido guardadas",
      })
      loadOrder()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar las notas",
        variant: "destructive",
      })
    }
  }

  const handleContactWhatsApp = () => {
    if (!order) return

    // Generar mensaje de WhatsApp
    let message = `Hola ${order.shipping.name}, soy de Galazzia. Estoy en contacto por tu pedido #${order.id}.\n\n`

    if (order.paymentMethod === "transferencia") {
      message += "Para completar tu compra por transferencia, te comparto los datos bancarios:\n\n"
      message += "Banco: [NOMBRE DEL BANCO]\n"
      message += "Titular: [NOMBRE DEL TITULAR]\n"
      message += "CBU: [NÚMERO DE CBU]\n"
      message += "Alias: [ALIAS]\n"
      message += "CUIT/CUIL: [NÚMERO]\n\n"
      message += `Monto a transferir: ${order.total.toLocaleString()}\n\n`
      message += "Por favor, cuando realices la transferencia envíanos el comprobante para confirmar tu pedido."
    } else {
      message += "Estamos procesando tu pedido para pago en efectivo.\n\n"

      if (order.shippingMethod === "delivery") {
        message += `Te contactamos para coordinar la entrega a tu domicilio en ${order.shipping.address}, ${order.shipping.city}.\n\n`
        message += `El total a pagar es: ${order.total.toLocaleString()}`
      } else {
        message += "Te contactamos para coordinar el retiro en nuestra tienda.\n\n"
        message += `El total a pagar es: ${order.total.toLocaleString()}`
      }
    }

    // Actualizar estado de WhatsApp
    updateOrderWhatsappStatus(order.id, true)
    loadOrder()

    // Abrir WhatsApp
    const whatsappNumber = order.shipping.phone.replace(/\D/g, "")
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  // Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (status: Order["status"]) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "confirmado":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "enviado":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "entregado":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "cancelado":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
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

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p>Pedido no encontrado</p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <AdminAuthCheck>
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/pedidos" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver a pedidos
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Detalles del Pedido #{order.id}</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleContactWhatsApp} className="gap-2">
                <MessageSquare className="h-4 w-4" />
                {order.whatsappSent ? "Volver a contactar" : "Contactar por WhatsApp"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteOrder}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar pedido
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Información general del pedido */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Información del pedido</h2>
                    <p className="text-sm text-muted-foreground">Creado el {formatDate(order.date)}</p>
                  </div>
                  <div>
                    <Select value={order.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className={`w-[150px] ${getStatusBadgeColor(order.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="enviado">Enviado</SelectItem>
                        <SelectItem value="entregado">Entregado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Método de pago</h3>
                    <p className="font-medium">
                      {order.paymentMethod === "transferencia" ? "Transferencia bancaria" : "Efectivo"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Método de envío</h3>
                    <p className="font-medium">
                      {order.shippingMethod === "delivery" ? "Envío a domicilio" : "Retiro en tienda"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">WhatsApp</h3>
                    <Badge variant={order.whatsappSent ? "default" : "outline"}>
                      {order.whatsappSent ? "Enviado" : "Pendiente"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Productos</h2>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="w-16 h-20 flex-shrink-0 relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="rounded-md object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="font-medium">${item.price.toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.color} / {item.size} / Cantidad: {item.quantity}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          Subtotal: ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span>{order.shippingCost > 0 ? `${order.shippingCost.toLocaleString()}` : "Gratis"}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2">
                    <span>Total</span>
                    <span>${order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Notas</h2>
                  {isEditingNotes ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleSaveNotes} className="gap-1">
                        <Save className="h-4 w-4" />
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNotes(order.notes || "")
                          setIsEditingNotes(false)
                        }}
                        className="gap-1"
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingNotes(true)} className="gap-1">
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  )}
                </div>

                {isEditingNotes ? (
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Agregar notas sobre este pedido..."
                    className="min-h-[150px]"
                  />
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
                    {order.notes ? (
                      <p className="whitespace-pre-wrap">{order.notes}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No hay notas para este pedido</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Información del cliente */}
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Información del cliente</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Nombre</h3>
                    <p className="font-medium">{order.shipping.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="font-medium">{order.shipping.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Teléfono</h3>
                    <p className="font-medium">{order.shipping.phone}</p>
                  </div>
                </div>
              </div>

              {/* Información de envío */}
              {order.shippingMethod === "delivery" && (
                <div className="bg-white border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Dirección de envío</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Dirección</h3>
                      <p className="font-medium">{order.shipping.address}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Ciudad</h3>
                      <p className="font-medium">{order.shipping.city}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Código Postal</h3>
                      <p className="font-medium">{order.shipping.postalCode}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Provincia</h3>
                      <p className="font-medium">{order.shipping.province}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </AdminAuthCheck>
  )
}
