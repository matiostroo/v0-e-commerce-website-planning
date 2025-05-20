export type OrderItem = {
  id: number
  name: string
  price: number
  originalPrice?: number
  color: string
  size: string
  quantity: number
  image: string
  category: string
}

export type OrderShipping = {
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  postalCode?: string
  province?: string
}

export type Order = {
  id: string
  items: OrderItem[]
  shipping: OrderShipping
  total: number
  subtotal: number
  shippingCost: number
  paymentMethod: string
  shippingMethod: string
  status: "pendiente" | "confirmado" | "enviado" | "entregado" | "cancelado"
  date: string
  whatsappSent: boolean
  notes?: string
  viewed: boolean // Nuevo campo para saber si el administrador ya vio el pedido
}

// Función para guardar un pedido
export const saveOrder = async (order: Order): Promise<void> => {
  try {
    // Asegurarse de que el campo viewed esté inicializado
    const orderWithViewed = {
      ...order,
      viewed: false, // Por defecto, un nuevo pedido no ha sido visto
    }

    // Obtener pedidos existentes
    const orders = getOrders()

    // Agregar el nuevo pedido
    orders.push(orderWithViewed)

    // Guardar en localStorage
    localStorage.setItem("orders", JSON.stringify(orders))

    // Actualizar contador de pedidos nuevos
    updateNewOrdersCount(1)

    // Actualizar stock de productos
    try {
      // Obtener productos
      const productsJson = localStorage.getItem("products")
      if (productsJson) {
        const products = JSON.parse(productsJson)

        // Actualizar stock para cada item del pedido
        order.items.forEach((item) => {
          const product = products.find((p) => p.id === item.id && p.category === item.category)
          if (product) {
            // Calcular nuevo stock
            const newStock = Math.max(0, product.stock - item.quantity)

            // Actualizar stock
            product.stock = newStock
          }
        })

        // Guardar productos actualizados
        localStorage.setItem("products", JSON.stringify(products))
      }
    } catch (error) {
      console.error("Error al actualizar stock:", error)
    }

    // Enviar notificación a Telegram
    try {
      await fetch("/api/telegram-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: order.id,
          customerName: order.shipping.name,
          email: order.shipping.email,
          total: order.total,
          paymentMethod: order.paymentMethod,
          shippingMethod: order.shippingMethod,
        }),
      })
    } catch (error) {
      console.error("Error al enviar notificación a Telegram:", error)
      // No lanzamos el error para que no interrumpa el flujo principal
    }
  } catch (error) {
    console.error("Error al guardar el pedido:", error)
  }
}

// Función para obtener todos los pedidos
export const getOrders = (): Order[] => {
  if (typeof window === "undefined") return []

  try {
    const ordersJson = localStorage.getItem("orders")
    if (!ordersJson) return []

    const orders = JSON.parse(ordersJson)

    // Asegurarse de que todos los pedidos tengan el campo viewed
    return orders.map((order: any) => ({
      ...order,
      viewed: order.viewed !== undefined ? order.viewed : true, // Si no existe, asumir que ya fue visto
    }))
  } catch (error) {
    console.error("Error parsing orders:", error)
    return []
  }
}

// Función para obtener un pedido por ID
export const getOrderById = (id: string): Order | null => {
  const orders = getOrders()
  return orders.find((order) => order.id === id) || null
}

// Función para actualizar el estado de un pedido
export const updateOrderStatus = (id: string, status: Order["status"]): void => {
  const orders = getOrders()
  const orderIndex = orders.findIndex((order) => order.id === id)

  if (orderIndex !== -1) {
    orders[orderIndex].status = status
    localStorage.setItem("orders", JSON.stringify(orders))
  }
}

// Función para actualizar el estado de WhatsApp de un pedido
export const updateOrderWhatsappStatus = (id: string, sent: boolean): void => {
  const orders = getOrders()
  const orderIndex = orders.findIndex((order) => order.id === id)

  if (orderIndex !== -1) {
    orders[orderIndex].whatsappSent = sent
    localStorage.setItem("orders", JSON.stringify(orders))
  }
}

// Función para agregar notas a un pedido
export const addOrderNotes = (id: string, notes: string): void => {
  const orders = getOrders()
  const orderIndex = orders.findIndex((order) => order.id === id)

  if (orderIndex !== -1) {
    orders[orderIndex].notes = notes
    localStorage.setItem("orders", JSON.stringify(orders))
  }
}

// Función para eliminar un pedido
export const deleteOrder = (id: string): void => {
  const orders = getOrders()
  const filteredOrders = orders.filter((order) => order.id !== id)
  localStorage.setItem("orders", JSON.stringify(filteredOrders))
}

// Función para exportar pedidos a CSV
export const exportOrdersToCSV = (): string => {
  const orders = getOrders()

  if (orders.length === 0) {
    return ""
  }

  // Cabeceras
  const headers = [
    "ID",
    "Fecha",
    "Cliente",
    "Email",
    "Teléfono",
    "Método de envío",
    "Dirección",
    "Método de pago",
    "Total",
    "Estado",
    "WhatsApp enviado",
    "Notas",
  ].join(",")

  // Filas
  const rows = orders.map((order) => {
    const date = new Date(order.date).toLocaleDateString()
    const address =
      order.shippingMethod === "delivery"
        ? `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.postalCode}, ${order.shipping.province}`
        : "Retiro en tienda"

    return [
      order.id,
      date,
      order.shipping.name,
      order.shipping.email,
      order.shipping.phone,
      order.shippingMethod === "delivery" ? "Envío a domicilio" : "Retiro en tienda",
      address,
      order.paymentMethod === "transferencia" ? "Transferencia bancaria" : "Efectivo",
      order.total,
      order.status,
      order.whatsappSent ? "Sí" : "No",
      order.notes || "",
    ].join(",")
  })

  return [headers, ...rows].join("\n")
}

// Funciones para manejar notificaciones de nuevos pedidos

// Actualizar contador de pedidos nuevos
export const updateNewOrdersCount = (increment = 0): void => {
  if (typeof window === "undefined") return

  try {
    // Obtener el contador actual
    const currentCount = getNewOrdersCount()

    // Actualizar el contador
    const newCount = increment > 0 ? currentCount + increment : 0

    // Guardar en localStorage
    localStorage.setItem("newOrdersCount", newCount.toString())
  } catch (error) {
    console.error("Error al actualizar el contador de pedidos nuevos:", error)
  }
}

// Obtener contador de pedidos nuevos
export const getNewOrdersCount = (): number => {
  if (typeof window === "undefined") return 0

  try {
    const count = localStorage.getItem("newOrdersCount")
    return count ? Number.parseInt(count, 10) : 0
  } catch (error) {
    console.error("Error al obtener el contador de pedidos nuevos:", error)
    return 0
  }
}

// Marcar un pedido como visto
export const markOrderAsViewed = (id: string): void => {
  try {
    const orders = getOrders()
    const orderIndex = orders.findIndex((order) => order.id === id)

    if (orderIndex !== -1 && !orders[orderIndex].viewed) {
      orders[orderIndex].viewed = true
      localStorage.setItem("orders", JSON.stringify(orders))

      // Decrementar el contador de pedidos nuevos
      const currentCount = getNewOrdersCount()
      if (currentCount > 0) {
        updateNewOrdersCount(currentCount - 1)
      }
    }
  } catch (error) {
    console.error("Error al marcar el pedido como visto:", error)
  }
}

// Marcar todos los pedidos como vistos
export const markAllOrdersAsViewed = (): void => {
  try {
    const orders = getOrders()

    // Marcar todos como vistos
    const updatedOrders = orders.map((order) => ({
      ...order,
      viewed: true,
    }))

    localStorage.setItem("orders", JSON.stringify(updatedOrders))

    // Resetear contador
    updateNewOrdersCount(0)
  } catch (error) {
    console.error("Error al marcar todos los pedidos como vistos:", error)
  }
}

// Obtener pedidos no vistos
export const getUnviewedOrders = (): Order[] => {
  try {
    const orders = getOrders()
    return orders.filter((order) => !order.viewed)
  } catch (error) {
    console.error("Error al obtener los pedidos no vistos:", error)
    return []
  }
}
