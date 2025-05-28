// Tipos para productos
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
  created_at?: string
  updated_at?: string
}

// Tipos para pedidos
export type Order = {
  id: string
  user_id?: string
  total: number
  subtotal: number
  shipping_cost: number
  payment_method: string
  shipping_method: string
  status: "pending" | "processing" | "completed" | "cancelled"
  whatsapp_sent: boolean
  viewed: boolean
  notes?: string
  created_at?: string
  updated_at?: string
  orderId?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  orderDate?: Date
  totalAmount?: number
  isViewed?: boolean
  trackingNumber?: string
}

export type Shipping = {
  id?: number
  order_id: string
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  postal_code?: string
  province?: string
  created_at?: string
}

export type OrderItem = {
  id?: number
  order_id: string
  product_id?: number
  name: string
  price: number
  original_price?: number
  color: string
  size: string
  quantity: number
  image: string
  category: string
  created_at?: string
}

// Tipo para el nuevo producto (sin id, created_at, updated_at)
export type NewProduct = Omit<Product, "id" | "created_at" | "updated_at">
