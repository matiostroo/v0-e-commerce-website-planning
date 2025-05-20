"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Bell,
  BellOff,
  Download,
  Eye,
  Filter,
  MessageSquare,
  RefreshCw,
  Search,
  Trash2,
  Save,
  Settings,
  ShoppingBag,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import AdminAuthCheck from "@/components/admin-auth-check"
import {
  getOrders,
  exportOrdersToCSV,
  updateOrderStatus,
  deleteOrder,
  updateOrderWhatsappStatus,
  getNewOrdersCount,
  markAllOrdersAsViewed,
  markOrderAsViewed,
  getUnviewedOrders,
  type Order,
} from "@/lib/orders"
import { useToast } from "@/hooks/use-toast"

export default function OrdersAdminPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [isLoading, setIsLoading] = useState(true)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [hasNewOrders, setHasNewOrders] = useState(false)

  // Cargar pedidos
  useEffect(() => {
    loadOrders()

    // Configurar un intervalo para verificar nuevos pedidos cada 30 segundos
    const interval = setInterval(() => {
      checkForNewOrders()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Filtrar pedidos cuando cambian los filtros
  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  // Modificar la función loadOrders para que refresque correctamente
  const loadOrders = () => {
    setIsLoading(true)
    try {
      const allOrders = getOrders()
      // Ordenar por fecha (más recientes primero)
      allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setOrders(allOrders)
      setFilteredOrders(allOrders) // Asegurarse de actualizar también los pedidos filtrados

      // Verificar pedidos no vistos
      const unviewedOrders = getUnviewedOrders()
      setHasNewOrders(unviewedOrders.length > 0)
      setNewOrdersCount(getNewOrdersCount())

      // Si hay pedidos no vistos, mostrar notificación
      if (unviewedOrders.length > 0) {
        // Reproducir sonido de notificación
        const audio = new Audio("/notification.mp3")
        audio.play().catch((e) => console.log("Error al reproducir sonido:", e))

        toast({
          title: "Nuevos pedidos",
          description: `Tienes ${unviewedOrders.length} pedidos nuevos sin revisar`,
        })
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkForNewOrders = () => {
    const count = getNewOrdersCount()
    if (count > newOrdersCount) {
      setNewOrdersCount(count)
      setHasNewOrders(true)

      // Reproducir sonido de notificación
      const audio = new Audio("/notification.mp3")
      audio.play().catch((e) => console.log("Error al reproducir sonido:", e))

      toast({
        title: "Nuevos pedidos",
        description: `Tienes ${count - newOrdersCount} pedidos nuevos`,
      })

      // Recargar pedidos
      loadOrders()
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // Filtrar por estado
    if (statusFilter !== "todos") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(term) ||
          order.shipping.name.toLowerCase().includes(term) ||
          order.shipping.email.toLowerCase().includes(term) ||
          order.shipping.phone.includes(term),
      )
    }

    setFilteredOrders(filtered)
  }

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      updateOrderStatus(orderId, newStatus)

      // Marcar como visto
      markOrderAsViewed(orderId)

      loadOrders()
      toast({
        title: "Estado actualizado",
        description: `El pedido ${orderId} ha sido actualizado a "${newStatus}"`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
        variant: "destructive",
      })
    }
  }

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el pedido ${orderId}?`)) {
      try {
        deleteOrder(orderId)
        loadOrders()
        toast({
          title: "Pedido eliminado",
          description: `El pedido ${orderId} ha sido eliminado`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el pedido",
          variant: "destructive",
        })
      }
    }
  }

  const handleExportCSV = () => {
    try {
      const csv = exportOrdersToCSV()
      if (!csv) {
        toast({
          title: "No hay datos para exportar",
          description: "No hay pedidos para exportar a CSV",
          variant: "destructive",
        })
        return
      }

      // Crear un blob y descargar
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `pedidos_galazzia_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Exportación exitosa",
        description: "Los pedidos han sido exportados a CSV",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron exportar los pedidos",
        variant: "destructive",
      })
    }
  }

  const handleContactWhatsApp = (order: Order) => {
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

    // Marcar como visto
    markOrderAsViewed(order.id)

    loadOrders()

    // Abrir WhatsApp
    const whatsappNumber = "+5491150535668" // Reemplazar con el número real
    const whatsappUrl = `https://wa.me/${order.shipping.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleViewOrder = (orderId: string) => {
    // Marcar como visto
    markOrderAsViewed(orderId)

    // Redirigir a la página de detalles
    window.location.href = `/admin/pedidos/${orderId}`
  }

  const handleMarkAllAsViewed = () => {
    markAllOrdersAsViewed()
    setHasNewOrders(false)
    setNewOrdersCount(0)
    loadOrders()

    toast({
      title: "Pedidos marcados como vistos",
      description: "Todos los pedidos han sido marcados como vistos",
    })
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AdminAuthCheck>
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Administración de Pedidos</h1>

              {hasNewOrders && <Badge className="bg-red-500 text-white animate-pulse">{newOrdersCount} nuevos</Badge>}
            </div>
            <div className="flex gap-2">
              {hasNewOrders ? (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsViewed} className="gap-2">
                  <BellOff className="h-4 w-4" />
                  Marcar todos como vistos
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled className="gap-2">
                  <Bell className="h-4 w-4" />
                  Sin pedidos nuevos
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={loadOrders}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/stock" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Stock
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/respaldo" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Respaldo
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/configuracion" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuración
                </Link>
              </Button>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por ID, nombre, email o teléfono..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm || statusFilter !== "todos" ? (
                  <p>No se encontraron pedidos con los filtros aplicados</p>
                ) : (
                  <p>No hay pedidos registrados</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Método de envío</TableHead>
                      <TableHead>Método de pago</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className={!order.viewed ? "bg-yellow-50" : ""}>
                        <TableCell className="font-mono">
                          {order.id}
                          {!order.viewed && <Badge className="ml-2 bg-red-500 text-white">Nuevo</Badge>}
                        </TableCell>
                        <TableCell>{formatDate(order.date)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.shipping.name}</div>
                            <div className="text-xs text-muted-foreground">{order.shipping.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.shippingMethod === "delivery" ? "Envío a domicilio" : "Retiro en tienda"}
                        </TableCell>
                        <TableCell>{order.paymentMethod === "transferencia" ? "Transferencia" : "Efectivo"}</TableCell>
                        <TableCell>${order.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                          >
                            <SelectTrigger className={`w-[130px] ${getStatusBadgeColor(order.status)}`}>
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
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.whatsappSent ? "default" : "outline"}>
                            {order.whatsappSent ? "Enviado" : "Pendiente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleContactWhatsApp(order)}
                              title="Contactar por WhatsApp"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewOrder(order.id)}
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Eliminar pedido"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>
        <SiteFooter />
      </div>
    </AdminAuthCheck>
  )
}
