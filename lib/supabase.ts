import { createClient } from "@supabase/supabase-js"

// Definición de tipos para la base de datos
export type Product = {
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

export type Order = {
  id: string
  user_id: string | null
  status: "pending" | "processing" | "completed" | "cancelled"
  payment_method: "transferencia" | "efectivo"
  shipping_method: "envio" | "retiro"
  subtotal: number
  shipping_cost: number
  total: number
  notes: string | null
  viewed: boolean
  whatsapp_sent: boolean
  created_at: string
  updated_at: string
}

export type ShippingInfo = {
  id: number
  order_id: string
  name: string
  email: string
  phone: string
  address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  created_at: string
}

export type OrderItem = {
  id: number
  order_id: string
  product_id: number | null
  name: string
  price: number
  original_price: number | null
  quantity: number
  color: string
  size: string
  category: string
  image: string | null
  created_at: string
}

// Singleton para el cliente de Supabase
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and key must be defined")
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey)
  return supabaseClient
}

// Add this function at the end of the file
export function createServerSupabaseClient() {
  return getSupabaseClient()
}
