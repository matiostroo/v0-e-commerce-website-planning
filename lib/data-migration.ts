import { getSupabaseClient } from "./supabase"
import type { Order, ShippingInfo, OrderItem } from "./supabase"
import { createServerSupabaseClient } from "./supabase"

// Función para migrar productos desde localStorage a Supabase
export async function migrateProductsFromLocalStorage(products: any[]): Promise<number> {
  const supabase = createServerSupabaseClient()

  // Transformar los productos al formato de la base de datos
  const formattedProducts = products.map((product) => ({
    name: product.name,
    description: product.description || "",
    price: product.price,
    discount: product.discount || 0,
    image: product.image,
    category: product.category,
    color: product.color,
    is_bestseller: product.isBestseller || false,
    stock: product.stock || 0,
  }))

  // Insertar los productos en la base de datos
  const { data, error } = await supabase.from("products").insert(formattedProducts).select()

  if (error) {
    console.error("Error migrating products:", error)
    throw new Error("Error migrating products")
  }

  return data.length
}

// Función para migrar pedidos desde localStorage a Supabase
export async function migrateOrdersFromLocalStorage(orders: any[]): Promise<number> {
  const supabase = createServerSupabaseClient()
  let migratedCount = 0

  for (const order of orders) {
    try {
      // Insertar el pedido
      const { error: orderError } = await supabase.from("orders").insert([
        {
          id: order.id,
          user_id: null, // No tenemos usuario asociado en localStorage
          total: order.total,
          subtotal: order.subtotal,
          shipping_cost: order.shippingCost || 0,
          payment_method: order.paymentMethod,
          shipping_method: order.shippingMethod,
          status: order.status || "pendiente",
          whatsapp_sent: order.whatsappSent || false,
          viewed: order.viewed || false,
          notes: order.notes || null,
        },
      ])

      if (orderError) throw orderError

      // Insertar la información de envío
      if (order.shippingInfo) {
        const { error: shippingError } = await supabase.from("shipping_info").insert([
          {
            order_id: order.id,
            name: order.shippingInfo.name,
            email: order.shippingInfo.email,
            phone: order.shippingInfo.phone,
            address: order.shippingInfo.address,
            city: order.shippingInfo.city,
            postal_code: order.shippingInfo.postalCode,
            province: order.shippingInfo.province,
          },
        ])

        if (shippingError) throw shippingError
      }

      // Insertar los items del pedido
      if (order.items && order.items.length > 0) {
        const orderItems = order.items.map((item: any) => ({
          order_id: order.id,
          product_id: item.id || null,
          name: item.name,
          price: item.price,
          original_price: item.originalPrice || null,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
        }))

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

        if (itemsError) throw itemsError
      }

      migratedCount++
    } catch (error) {
      console.error(`Error migrating order ${order.id}:`, error)
    }
  }

  return migratedCount
}

// Función para migrar productos de localStorage a Supabase
export const migrateProducts = async (): Promise<{ success: boolean; count: number }> => {
  const supabase = getSupabaseClient()

  try {
    // Obtener productos de localStorage
    const productsJson = localStorage.getItem("products")
    if (!productsJson) {
      return { success: true, count: 0 }
    }

    const localProducts = JSON.parse(productsJson)

    // Transformar productos al formato de Supabase
    const supabaseProducts = localProducts.map((product: any) => ({
      name: product.name,
      description: product.description || "",
      price: product.price,
      discount: product.discount || 0,
      image: product.image || "",
      category: product.category,
      color: product.color,
      is_bestseller: product.isBestseller || false,
      stock: product.stock || 0,
    }))

    // Insertar productos en Supabase
    const { data, error } = await supabase.from("products").insert(supabaseProducts).select()

    if (error) {
      console.error("Error migrating products:", error)
      return { success: false, count: 0 }
    }

    return { success: true, count: data.length }
  } catch (error) {
    console.error("Error in migrateProducts:", error)
    return { success: false, count: 0 }
  }
}

// Función para migrar pedidos de localStorage a Supabase
export const migrateOrders = async (): Promise<{ success: boolean; count: number }> => {
  const supabase = getSupabaseClient()

  try {
    // Obtener pedidos de localStorage
    const ordersJson = localStorage.getItem("orders")
    if (!ordersJson) {
      return { success: true, count: 0 }
    }

    const localOrders = JSON.parse(ordersJson)
    let successCount = 0

    // Procesar cada pedido
    for (const localOrder of localOrders) {
      // 1. Crear el pedido
      const order: Omit<Order, "created_at" | "updated_at"> = {
        id: localOrder.id,
        total: localOrder.total,
        subtotal: localOrder.subtotal,
        shipping_cost: localOrder.shippingCost || 0,
        payment_method: localOrder.paymentMethod,
        shipping_method: localOrder.shippingMethod,
        status: localOrder.status || "pendiente",
        whatsapp_sent: localOrder.whatsappSent || false,
        viewed: localOrder.viewed || false,
        notes: localOrder.notes || "",
      }

      const { error: orderError } = await supabase.from("orders").insert([order])

      if (orderError) {
        console.error(`Error migrating order ${localOrder.id}:`, orderError)
        continue
      }

      // 2. Crear la información de envío
      const shippingInfo: Omit<ShippingInfo, "id" | "created_at"> = {
        order_id: localOrder.id,
        name: localOrder.shipping.name,
        email: localOrder.shipping.email,
        phone: localOrder.shipping.phone,
        address: localOrder.shipping.address || "",
        city: localOrder.shipping.city || "",
        postal_code: localOrder.shipping.postalCode || "",
        province: localOrder.shipping.province || "",
      }

      const { error: shippingError } = await supabase.from("shipping_info").insert([shippingInfo])

      if (shippingError) {
        console.error(`Error migrating shipping info for order ${localOrder.id}:`, shippingError)
        // Eliminar el pedido si falla la información de envío
        await supabase.from("orders").delete().eq("id", localOrder.id)
        continue
      }

      // 3. Crear los items del pedido
      const orderItems: Omit<OrderItem, "id" | "created_at">[] = localOrder.items.map((item: any) => ({
        order_id: localOrder.id,
        product_id: item.id,
        name: item.name,
        price: item.price,
        original_price: item.originalPrice,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        image: item.image || "",
        category: item.category,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error(`Error migrating order items for order ${localOrder.id}:`, itemsError)
        // Eliminar el pedido y la información de envío si fallan los items
        await supabase.from("shipping_info").delete().eq("order_id", localOrder.id)
        await supabase.from("orders").delete().eq("id", localOrder.id)
        continue
      }

      successCount++
    }

    return { success: true, count: successCount }
  } catch (error) {
    console.error("Error in migrateOrders:", error)
    return { success: false, count: 0 }
  }
}

// Función para migrar usuarios de localStorage a Supabase
export const migrateUsers = async (): Promise<{ success: boolean; count: number }> => {
  const supabase = getSupabaseClient()

  try {
    // Obtener usuarios de localStorage
    const usersJson = localStorage.getItem("users")
    if (!usersJson) {
      return { success: true, count: 0 }
    }

    const localUsers = JSON.parse(usersJson)

    // Transformar usuarios al formato de Supabase
    const supabaseUsers = localUsers.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      provider: user.provider || null,
    }))

    // Insertar usuarios en Supabase
    const { data, error } = await supabase.from("users").insert(supabaseUsers).select()

    if (error) {
      console.error("Error migrating users:", error)
      return { success: false, count: 0 }
    }

    return { success: true, count: data.length }
  } catch (error) {
    console.error("Error in migrateUsers:", error)
    return { success: false, count: 0 }
  }
}

// Función para migrar todos los datos
export const migrateAllData = async (): Promise<{
  products: { success: boolean; count: number }
  orders: { success: boolean; count: number }
  users: { success: boolean; count: number }
}> => {
  const productsResult = await migrateProducts()
  const ordersResult = await migrateOrders()
  const usersResult = await migrateUsers()

  return {
    products: productsResult,
    orders: ordersResult,
    users: usersResult,
  }
}
