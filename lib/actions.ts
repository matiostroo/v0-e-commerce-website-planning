"use server"

import { getSupabaseClient } from "./supabase"
import type { Product } from "./supabase"

// Función para obtener todos los productos
export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("products").select("*").order("name")

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

// Función para obtener un producto por ID
export async function getProductById(id: number): Promise<Product | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching product:", error)
    return null
  }

  return data
}

// Función para actualizar el stock de un producto
export async function updateProductStock(productId: number, newStock: number): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("products")
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq("id", productId)

  if (error) {
    console.error("Error updating product stock:", error)
    return false
  }

  return true
}

// Función para actualizar un producto
export async function updateProduct(productId: number, updates: Partial<Product>): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", productId)

  if (error) {
    console.error("Error updating product:", error)
    return false
  }

  return true
}

// Función para verificar si hay suficiente stock para un producto
export async function checkProductStock(productId: number, quantity: number): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("products").select("stock").eq("id", productId).single()

  if (error || !data) {
    console.error("Error checking product stock:", error)
    return false
  }

  return data.stock >= quantity
}

// Función para crear un nuevo producto
export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .insert([{ ...product, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()

  if (error) {
    console.error("Error creating product:", error)
    return null
  }

  return data?.[0] || null
}

// Función para eliminar un producto
export async function deleteProduct(productId: number): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("products").delete().eq("id", productId)

  if (error) {
    console.error("Error deleting product:", error)
    return false
  }

  return true
}

// Función para obtener productos por categoría
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("products").select("*").eq("category", category).order("name")

  if (error) {
    console.error("Error fetching products by category:", error)
    return []
  }

  return data || []
}

// Función para obtener productos destacados
export async function getBestsellerProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("products").select("*").eq("is_bestseller", true)

  if (error) {
    console.error("Error fetching bestseller products:", error)
    return []
  }

  return data || []
}

// Función para verificar si un producto tiene stock
export async function hasStock(productId: number): Promise<boolean> {
  const product = await getProductById(productId)
  return product ? product.stock > 0 : false
}

// Función para obtener el stock de un producto
export async function getProductStock(productId: number): Promise<number> {
  const product = await getProductById(productId)
  return product ? product.stock : 0
}

// Add these functions at the end of the file

// Función para obtener todos los pedidos
export async function getOrders() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return data || []
}

// Función para eliminar un pedido
export async function deleteOrder(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("orders").delete().eq("id", id)

  if (error) {
    console.error("Error deleting order:", error)
    return false
  }

  return true
}

// Función para marcar todos los pedidos como vistos
export async function markAllOrdersAsViewed(): Promise<boolean> {
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
