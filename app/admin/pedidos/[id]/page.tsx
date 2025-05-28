"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import type { Order, OrderItem, Shipping } from "@/types"
import {
  addOrderNotes,
  getOrderById,
  markOrderAsViewed,
  updateOrderWhatsappStatus,
  updateOrderStatus,
} from "@/utils/api"
import { formatCurrency } from "@/utils/format-currency"
import { Copy, PhoneIcon as WhatsappLogo } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"

type OrderDetailsProps = {}

const OrderDetails: React.FC<OrderDetailsProps> = () => {
  const params = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [orderData, setOrderData] = useState<Order | null>(null)
  const [shippingData, setShippingData] = useState<Shipping | undefined>(undefined)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [notes, setNotes] = useState("")
  const [editingNotes, setEditingNotes] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchOrderDetails = async () => {
    setLoading(true)
    try {
      const { order, shippingInfo, orderItems } = await getOrderById(params.id)

      if (order) {
        setOrderData(order)
        setShippingData(shippingInfo || undefined)
        setOrderItems(orderItems)

        // Marcar como visto si no lo está
        if (!order.viewed) {
          await markOrderAsViewed(params.id)
        }
      } else {
        toast({
          title: "Error",
          description: "No se encontró el pedido",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del pedido",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const success = await updateOrderStatus(params.id, newStatus as Order["status"])
      if (success) {
        toast({
          title: "Estado actualizado",
          description: "El estado del pedido ha sido actualizado correctamente",
        })
        fetchOrderDetails()
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado del pedido",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el estado del pedido",
        variant: "destructive",
      })
    }
  }

  const handleWhatsappStatusChange = async (sent: boolean) => {
    try {
      const success = await updateOrderWhatsappStatus(params.id, sent)
      if (success) {
        toast({
          title: "Estado de WhatsApp actualizado",
          description: "El estado de WhatsApp del pedido ha sido actualizado correctamente",
        })
        fetchOrderDetails()
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de WhatsApp del pedido",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order whatsapp status:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el estado de WhatsApp del pedido",
        variant: "destructive",
      })
    }
  }

  const handleNotesSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const success = await addOrderNotes(params.id, notes)
      if (success) {
        toast({
          title: "Notas agregadas",
          description: "Las notas del pedido han sido agregadas correctamente",
        })
        fetchOrderDetails()
        setEditingNotes(false)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron agregar las notas al pedido",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding order notes:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al agregar las notas al pedido",
        variant: "destructive",
      })
    }
  }

  const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
        <Separator className="mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-[200px]" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-[150px]" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100%]" />
                <Skeleton className="h-4 w-[100%]" />
                <Skeleton className="h-4 w-[100%]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-[200px]" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-[150px]" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100%]" />
                <Skeleton className="h-4 w-[100%]" />
                <Skeleton className="h-4 w-[100%]" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-[200px]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>
                      <Skeleton className="h-6 w-[150px]" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-[100%]" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Pedido no encontrado</h2>
          <p>No se pudo encontrar el pedido con el ID especificado.</p>
          <Button variant="secondary" onClick={() => router.back()}>
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Pedido #{orderData.orderId}</h1>
        <Badge variant="secondary">{orderData.status}</Badge>
      </div>
      <Separator className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
            <CardDescription>Detalles del cliente que realizó el pedido.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <Label>Nombre</Label>
                <Input type="text" value={orderData.customerName} readOnly />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={orderData.customerEmail} readOnly />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input type="tel" value={orderData.customerPhone} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Envío</CardTitle>
            <CardDescription>Dirección de envío del pedido.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <Label>Dirección</Label>
                <Input type="text" value={shippingData?.address || "No especificada"} readOnly />
              </div>
              <div>
                <Label>Ciudad</Label>
                <Input type="text" value={shippingData?.city || "No especificada"} readOnly />
              </div>
              <div>
                <Label>Código Postal</Label>
                <Input type="text" value={shippingData?.postalCode || "No especificada"} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  Cantidad: {item.quantity}
                  <br />
                  Precio: {formatCurrency(item.price)}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Select value={orderData.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="PROCESSING">Procesando</SelectItem>
              <SelectItem value="SHIPPED">Enviado</SelectItem>
              <SelectItem value="DELIVERED">Entregado</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Label htmlFor="whatsapp-sent">WhatsApp Enviado:</Label>
            <Button
              id="whatsapp-sent"
              variant="outline"
              size="sm"
              onClick={() => handleWhatsappStatusChange(!orderData.whatsappSent)}
            >
              {orderData.whatsappSent ? "Sí" : "No"}
              <WhatsappLogo className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Label>Número de seguimiento:</Label>
            <Input type="text" value={orderData.trackingNumber || ""} readOnly />
            <CopyToClipboard text={orderData.trackingNumber || ""}>
              <Button variant="ghost" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </CopyToClipboard>
          </div>

          <div>
            <Label>Total:</Label>
            <Input type="text" value={formatCurrency(orderData.total)} readOnly />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notas del Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          {editingNotes ? (
            <form onSubmit={handleNotesSubmit} className="flex flex-col gap-4">
              <Textarea value={notes} onChange={handleNotesChange} />
              <Button type="submit">Guardar Notas</Button>
              <Button type="button" variant="secondary" onClick={() => setEditingNotes(false)}>
                Cancelar
              </Button>
            </form>
          ) : (
            <div>
              <p>{orderData.notes || "No hay notas para este pedido."}</p>
              <Button variant="secondary" onClick={() => setEditingNotes(true)}>
                Editar Notas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default OrderDetails
