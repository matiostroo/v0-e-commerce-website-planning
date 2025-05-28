import { getSupabaseClient } from "./supabase"
import type { Order, ShippingInfo, OrderItem } from "./types"

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
