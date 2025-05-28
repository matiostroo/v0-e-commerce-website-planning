import { createServerSupabaseClient } from "./supabase"

export interface Product {
  id: number
  name: string
  description: string
  price: number
  discount: number
  image: string
  category: string
  color: string
  is_bestseller: boolean
  stock: number
  created_at: string
  updated_at: string
}

// Obtener todos los productos
export async function getAllProducts(): Promise<Product[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    throw new Error("Error fetching products")
  }

  return data || []
}

// Obtener un producto por ID
export async function getProductById(id: number): Promise<Product | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching product with ID ${id}:`, error)
    return null
  }

  return data
}

// Obtener productos por categoría
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching products in category ${category}:`, error)
    throw new Error(`Error fetching products in category ${category}`)
  }

  return data || []
}

// Crear un nuevo producto
export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("products").insert([product]).select().single()

  if (error) {
    console.error("Error creating product:", error)
    throw new Error("Error creating product")
  }

  return data
}

// Actualizar un producto existente
export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating product with ID ${id}:`, error)
    throw new Error(`Error updating product with ID ${id}`)
  }

  return data
}

// Eliminar un producto
export async function deleteProduct(id: number): Promise<void> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting product with ID ${id}:`, error)
    throw new Error(`Error deleting product with ID ${id}`)
  }
}

// Actualizar el stock de un producto
export async function updateProductStock(id: number, stock: number): Promise<void> {
  await updateProduct(id, { stock })
}
