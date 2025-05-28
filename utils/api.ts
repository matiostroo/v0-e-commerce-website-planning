import { getSupabaseClient } from "@/lib/supabase"
import type { Order, ShippingInfo, OrderItem } from "@/lib/supabase"

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

  try {
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
  } catch (error) {
    console.error("Error in updateOrderStatus:", error)
    return false
  }
}

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

// Función para marcar un pedido como visto
export const markOrderAsViewed = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient()

  try {
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
  } catch (error) {
    console.error("Error in markOrderAsViewed:", error)
    return false
  }
}
