import { getSupabaseClient } from "./supabase"
import type { Order, ShippingInfo, OrderItem } from "./supabase"
import { updateProductStock } from "./products"

// Función para generar un ID de pedido único
export const generateOrderId = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// Función para guardar un pedido completo (con información de envío e items)
export const saveOrder = async (
  order: Omit<Order, "created_at" | "updated_at">,
  shippingInfo: Omit<ShippingInfo, "id" | "created_at">,
  orderItems: Omit<OrderItem, "id" | "created_at">[],
): Promise<string | null> => {
  const supabase = getSupabaseClient()

  try {
    // 1. Insertar el pedido
    const { data: orderData, error: orderError } = await supabase.from("orders").insert([order]).select()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return null
    }

    const orderId = orderData?.[0]?.id

    if (!orderId) {
      console.error("No order ID returned")
      return null
    }

    // 2. Insertar la información de envío
    const { error: shippingError } = await supabase.from("shipping_info").insert([
      {
        ...shippingInfo,
        order_id: orderId,
      },
    ])

    if (shippingError) {
      console.error("Error creating shipping info:", shippingError)
      // Intentar eliminar el pedido para revertir
      await supabase.from("orders").delete().eq("id", orderId)
      return null
    }

    // 3. Insertar los items del pedido
    const orderItemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: orderId,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsWithOrderId)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      // Intentar eliminar el pedido y la info de envío para revertir
      await supabase.from("shipping_info").delete().eq("order_id", orderId)
      await supabase.from("orders").delete().eq("id", orderId)
      return null
    }

    // 4. Actualizar el stock de los productos
    for (const item of orderItems) {
      if (item.product_id) {
        // Obtener el stock actual
        const { data: productData } = await supabase.from("products").select("stock").eq("id", item.product_id).single()

        if (productData) {
          const currentStock = productData.stock
          const newStock = Math.max(0, currentStock - item.quantity)

          // Actualizar el stock
          await updateProductStock(item.product_id, newStock)
        }
      }
    }

    return orderId
  } catch (error) {
    console.error("Error in saveOrder:", error)
    return null
  }
}

// Función para obtener todos los pedidos
export const getOrders = async (): Promise<Order[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return data || []
}

// Función para obtener un pedido por ID con toda su información relacionada
export const getOrderById = async (
  id: string,
): Promise<{
  order: Order | null
  shippingInfo: ShippingInfo | null
  orderItems: OrderItem[]
}> => {
  const supabase = getSupabaseClient()

  try {
    // Obtener el pedido
    const { data: orderData, error: orderError } = await supabase.from("orders").select("*").eq("id", id).single()

    if (orderError) {
      console.error("Error fetching order:", orderError)
      return { order: null, shippingInfo: null, orderItems: [] }
    }

    // Obtener la información de envío
    const { data: shippingData, error: shippingError } = await supabase
      .from("shipping_info")
      .select("*")
      .eq("order_id", id)
      .single()

    if (shippingError && shippingError.code !== "PGRST116") {
      // No error if not found
      console.error("Error fetching shipping info:", shippingError)
    }

    // Obtener los items del pedido
    const { data: itemsData, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", id)

    if (itemsError) {
      console.error("Error fetching order items:", itemsError)
    }

    return {
      order: orderData,
      shippingInfo: shippingData,
      orderItems: itemsData || [],
    }
  } catch (error) {
    console.error("Error in getOrderById:", error)
    return { order: null, shippingInfo: null, orderItems: [] }
  }
}

// Función para actualizar el estado de un pedido
export const updateOrderStatus = async (id: string, status: Order["status"]): Promise<boolean> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating order status:", error)
    return false
  }

  return true
}

// Función para actualizar el estado de WhatsApp de un pedido
export const updateOrderWhatsappStatus = async (id: string, sent: boolean): Promise<boolean> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("orders")
    .update({
      whatsapp_sent: sent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating order whatsapp status:", error)
    return false
  }

  return true
}

// Función para agregar notas a un pedido
export const addOrderNotes = async (id: string, notes: string): Promise<boolean> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("orders")
    .update({
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error adding order notes:", error)
    return false
  }

  return true
}

// Función para eliminar un pedido
export const deleteOrder = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient()
  // Eliminar el pedido (las tablas relacionadas se eliminarán por la restricción ON DELETE CASCADE)
  const { error } = await supabase.from("orders").delete().eq("id", id)

  if (error) {
    console.error("Error deleting order:", error)
    return false
  }

  return true
}

// Función para marcar un pedido como visto
export const markOrderAsViewed = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("orders")
    .update({
      viewed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error marking order as viewed:", error)
    return false
  }

  return true
}

// Función para marcar todos los pedidos como vistos
export const markAllOrdersAsViewed = async (): Promise<boolean> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("orders")
    .update({
      viewed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("viewed", false)

  if (error) {
    console.error("Error marking all orders as viewed:", error)
    return false
  }

  return true
}

// Función para obtener el número de pedidos no vistos
export const getUnviewedOrdersCount = async (): Promise<number> => {
  const supabase = getSupabaseClient()
  const { data, error, count } = await supabase.from("orders").select("id", { count: "exact" }).eq("viewed", false)

  if (error) {
    console.error("Error counting unviewed orders:", error)
    return 0
  }

  return count || 0
}
