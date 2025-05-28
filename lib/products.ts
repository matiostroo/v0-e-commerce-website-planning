import { getSupabaseClient } from "./supabase"
import type { Product } from "./supabase"

// Colores y tallas predeterminados
export const defaultColors = ["Blanco", "Beige", "Gris", "Marrón", "Negro"]
export const defaultSizes = ["XS", "S", "M", "L", "XL"]

// Función para obtener todos los productos
export const getProducts = async (): Promise<Product[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

// Función para obtener un producto por ID
export const getProductById = async (id: number): Promise<Product | null> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching product:", error)
    return null
  }

  return data
}

// Función para obtener productos por categoría
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("id", { ascending: true })

  if (error) {
    console.error("Error fetching products by category:", error)
    return []
  }

  return data || []
}

// Función para obtener productos destacados
export const getBestsellerProducts = async (): Promise<Product[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("products").select("*").eq("is_bestseller", true)

  if (error) {
    console.error("Error fetching bestseller products:", error)
    return []
  }

  return data || []
}

// Función para actualizar el stock de un producto
export const updateProductStock = async (productId: number, newStock: number): Promise<boolean> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("products")
    .update({
      stock: newStock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)

  if (error) {
    console.error("Error updating product stock:", error)
    return false
  }

  return true
}

// Función para verificar si un producto tiene stock
export const hasStock = async (productId: number): Promise<boolean> => {
  const product = await getProductById(productId)
  return product ? product.stock > 0 : false
}

// Función para obtener el stock de un producto
export const getProductStock = async (productId: number): Promise<number> => {
  const product = await getProductById(productId)
  return product ? product.stock : 0
}

// Función para crear un nuevo producto
export const createProduct = async (
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product | null> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("products").insert([product]).select()

  if (error) {
    console.error("Error creating product:", error)
    return null
  }

  return data?.[0] || null
}

// Función para actualizar un producto
export const updateProduct = async (id: number, product: Partial<Product>): Promise<boolean> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from("products")
    .update({
      ...product,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating product:", error)
    return false
  }

  return true
}

// Función para eliminar un producto
export const deleteProduct = async (id: number): Promise<boolean> => {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return false
  }

  return true
}
