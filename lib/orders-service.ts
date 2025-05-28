import { getSupabaseClient } from "./supabase"
import type { Order, ShippingInfo, OrderItem } from "./supabase"
import { createServerSupabaseClient } from "./supabase"

export interface OrderWithDetails extends Order {
  shipping_info: ShippingInfo
  items: OrderItem[]
}

// Función para guardar un pedido completo (con información de envío e items)
export const saveOrder = async (
  order: Omit<Order, "created_at" | "updated_at">,
  shippingInfo: Omit<ShippingInfo, "id" | "created_at">,
  orderItems: Omit<OrderItem, "id" | "created_at">[],
): Promise<string | null> => {
  const supabase = getSupabaseClient()

  // Iniciar una transacción manual
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
          await supabase
            .from("products")
            .update({ stock: newStock, updated_at: new Date().toISOString() })
            .eq("id", item.product_id)
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

  try {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getOrders:", error)
    return []
  }
}

// Función para obtener un pedido por ID con toda su información relacionada
// export const getOrderById = async (
//   id: string,
// ): Promise<{
//   order: Order | null
//   shippingInfo: ShippingInfo | null
//   orderItems: OrderItem[]
// }> => {
//   const supabase = getSupabaseClient()

//   try {
//     // Obtener el pedido
//     const { data: orderData, error: orderError } = await supabase.from("orders").select("*").eq("id", id).single()

//     if (orderError) {
//       console.error("Error fetching order:", orderError)
//       return { order: null, shippingInfo: null, orderItems: [] }
//     }

//     // Obtener la información de envío
//     const { data: shippingData, error: shippingError } = await supabase
//       .from("shipping_info")
//       .select("*")
//       .eq("order_id", id)
//       .single()

//     if (shippingError && shippingError.code !== "PGRST116") {
//       // No error if not found
//       console.error("Error fetching shipping info:", shippingError)
//     }

//     // Obtener los items del pedido
//     const { data: itemsData, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", id)

//     if (itemsError) {
//       console.error("Error fetching order items:", itemsError)
//     }

//     return {
//       order: orderData,
//       shippingInfo: shippingData,
//       orderItems: itemsData || [],
//     }
//   } catch (error) {
//     console.error("Error in getOrderById:", error)
//     return { order: null, shippingInfo: null, orderItems: [] }
//   }
// }

// Función para actualizar el estado de un pedido
// export const updateOrderStatus = async (id: string, status: Order["status"]): Promise<boolean> => {
//   const supabase = getSupabaseClient()

//   try {
//     const { error } = await supabase
//       .from("orders")
//       .update({
//         status,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", id)

//     if (error) {
//       console.error("Error updating order status:", error)
//       return false
//     }

//     return true
//   } catch (error) {
//     console.error("Error in updateOrderStatus:", error)
//     return false
//   }
// }

// Función para actualizar el estado de WhatsApp de un pedido
export const updateOrderWhatsappStatus = async (id: string, sent: boolean): Promise<boolean> => {
  const supabase = getSupabaseClient()

  try {
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
  } catch (error) {
    console.error("Error in updateOrderWhatsappStatus:", error)
    return false
  }
}

// Función para agregar notas a un pedido
export const addOrderNotes = async (id: string, notes: string): Promise<boolean> => {
  const supabase = getSupabaseClient()

  try {
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
  } catch (error) {
    console.error("Error in addOrderNotes:", error)
    return false
  }
}

// Función para eliminar un pedido
export const deleteOrder = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient()

  try {
    // Eliminar el pedido (las tablas relacionadas se eliminarán por la restricción ON DELETE CASCADE)
    const { error } = await supabase.from("orders").delete().eq("id", id)

    if (error) {
      console.error("Error deleting order:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteOrder:", error)
    return false
  }
}

// Función para marcar un pedido como visto
// export const markOrderAsViewed = async (id: string): Promise<boolean> => {
//   const supabase = getSupabaseClient()

//   try {
//     const { error } = await supabase
//       .from("orders")
//       .update({
//         viewed: true,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", id)

//     if (error) {
//       console.error("Error marking order as viewed:", error)
//       return false
//     }

//     return true
//   } catch (error) {
//     console.error("Error in markOrderAsViewed:", error)
//     return false
//   }
// }

// Función para marcar todos los pedidos como vistos
export const markAllOrdersAsViewed = async (): Promise<boolean> => {
  const supabase = getSupabaseClient()

  try {
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
  } catch (error) {
    console.error("Error in markAllOrdersAsViewed:", error)
    return false
  }
}

// Función para obtener el número de pedidos no vistos
export const getUnviewedOrdersCount = async (): Promise<number> => {
  const supabase = getSupabaseClient()

  try {
    const { data, error, count } = await supabase.from("orders").select("id", { count: "exact" }).eq("viewed", false)

    if (error) {
      console.error("Error counting unviewed orders:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("Error in getUnviewedOrdersCount:", error)
    return 0
  }
}

// Obtener todos los pedidos
export async function getAllOrders(): Promise<Order[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    throw new Error("Error fetching orders")
  }

  return data || []
}

// Obtener un pedido por ID con todos sus detalles
export async function getOrderById(id: string): Promise<OrderWithDetails | null> {
  const supabase = createServerSupabaseClient()

  // Obtener el pedido
  const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", id).single()

  if (orderError) {
    console.error(`Error fetching order with ID ${id}:`, orderError)
    return null
  }

  if (!order) return null

  // Obtener la información de envío
  const { data: shippingInfo, error: shippingError } = await supabase
    .from("shipping_info")
    .select("*")
    .eq("order_id", id)
    .single()

  if (shippingError && shippingError.code !== "PGRST116") {
    // PGRST116 es "no se encontraron resultados"
    console.error(`Error fetching shipping info for order ${id}:`, shippingError)
  }

  // Obtener los items del pedido
  const { data: items, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", id)

  if (itemsError) {
    console.error(`Error fetching items for order ${id}:`, itemsError)
  }

  return {
    ...order,
    shipping_info: shippingInfo || null,
    items: items || [],
  }
}

// Crear un nuevo pedido con todos sus detalles
export async function createOrder(
  order: Omit<Order, "id" | "created_at" | "updated_at">,
  shippingInfo: Omit<ShippingInfo, "id" | "order_id" | "created_at">,
  items: Omit<OrderItem, "id" | "order_id" | "created_at">[],
): Promise<string> {
  const supabase = createServerSupabaseClient()

  // Generar un ID único para el pedido (formato: 3 letras + 2 números)
  const orderId = generateOrderId()

  // Iniciar una transacción
  const { error: orderError } = await supabase.from("orders").insert([{ ...order, id: orderId }])

  if (orderError) {
    console.error("Error creating order:", orderError)
    throw new Error("Error creating order")
  }

  // Insertar la información de envío
  const { error: shippingError } = await supabase.from("shipping_info").insert([{ ...shippingInfo, order_id: orderId }])

  if (shippingError) {
    console.error("Error creating shipping info:", shippingError)
    throw new Error("Error creating shipping info")
  }

  // Insertar los items del pedido
  const itemsWithOrderId = items.map((item) => ({ ...item, order_id: orderId }))
  const { error: itemsError } = await supabase.from("order_items").insert(itemsWithOrderId)

  if (itemsError) {
    console.error("Error creating order items:", itemsError)
    throw new Error("Error creating order items")
  }

  return orderId
}

// Actualizar el estado de un pedido
export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id)

  if (error) {
    console.error(`Error updating status for order ${id}:`, error)
    throw new Error(`Error updating status for order ${id}`)
  }
}

// Marcar un pedido como visto
export async function markOrderAsViewed(id: string): Promise<void> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from("orders")
    .update({ viewed: true, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error(`Error marking order ${id} as viewed:`, error)
    throw new Error(`Error marking order ${id} as viewed`)
  }
}

// Obtener el número de pedidos no vistos
// export async function getUnviewedOrdersCount(): Promise<number> {
//   const supabase = createServerSupabaseClient()
//   const { count, error } = await supabase
//     .from('orders')
//     .select('*', { count: 'exact', head: true })
//     .eq('viewed', false)

//   if (error) {
//     console.error('Error counting unviewed orders:', error)
//     throw new Error('Error counting unviewed orders')
//   }

//   return count || 0
// }

// Función auxiliar para generar un ID de pedido único
function generateOrderId(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lettersLength = letters.length
  let id = ""

  // Generar 3 letras aleatorias
  for (let i = 0; i < 3; i++) {
    id += letters.charAt(Math.floor(Math.random() * lettersLength))
  }

  // Agregar 2 números aleatorios
  id += Math.floor(Math.random() * 90 + 10)

  return id
}
