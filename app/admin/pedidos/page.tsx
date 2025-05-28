"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { deleteOrder, getOrders, markAllOrdersAsViewed } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { MoreHorizontal } from "lucide-react"

interface Order {
  id: string
  customerName: string
  customerEmail: string
  orderDate: Date
  totalAmount: number
  isViewed: boolean
}

const PedidosPage = () => {
  const [orderList, setOrderList] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const orders = await getOrders()
      setOrderList(orders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este pedido?")) {
      try {
        const success = await deleteOrder(orderId)
        if (success) {
          toast({
            title: "Pedido eliminado",
            description: "El pedido ha sido eliminado correctamente",
          })
          fetchOrders()
        } else {
          toast({
            title: "Error",
            description: "No se pudo eliminar el pedido",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting order:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al eliminar el pedido",
          variant: "destructive",
        })
      }
    }
  }

  const markAllAsViewed = async () => {
    try {
      const success = await markAllOrdersAsViewed()
      if (success) {
        toast({
          title: "Pedidos marcados como vistos",
          description: "Todos los pedidos han sido marcados como vistos",
        })
        fetchOrders()
      } else {
        toast({
          title: "Error",
          description: "No se pudieron marcar los pedidos como vistos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error marking orders as viewed:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al marcar los pedidos como vistos",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orderList.filter(
    (order) =>
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <Input
          type="search"
          placeholder="Buscar pedido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <Table>
          <TableCaption>Lista de todos los pedidos realizados.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Nº Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No hay pedidos
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.customerEmail}</TableCell>
                  <TableCell>
                    {format(new Date(order.orderDate), "dd 'de' MMMM 'de' yyyy", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>${order.totalAmount}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={order.isViewed ? "secondary" : "default"}>
                      {order.isViewed ? "Visto" : "No visto"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => window.open(`/admin/pedidos/${order.id}`, "_blank")}>
                          Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-500 focus:text-red-500">Eliminar</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este pedido?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteOrder(order.id)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7}>Total: {orderList.length} pedidos</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <Button onClick={markAllAsViewed} disabled={orderList.every((order) => order.isViewed)}>
        Marcar todos como vistos
      </Button>
    </div>
  )
}

export default PedidosPage
