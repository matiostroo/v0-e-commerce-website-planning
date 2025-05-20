// Tipos para los productos
export type ProductCategory = "sweaters" | "tapados"

export type Product = {
  id: number
  name: string
  description: string
  price: number
  discount: number
  image: string
  category: ProductCategory
  color: string
  isBestseller?: boolean
  stock: number
}

// Función para obtener productos del localStorage
export const getProducts = (): Product[] => {
  if (typeof window === "undefined") return []

  try {
    const productsJson = localStorage.getItem("products")
    if (!productsJson) {
      // Si no hay productos en localStorage, usar datos predeterminados
      const defaultProducts: Product[] = [
        {
          id: 1,
          name: "Sweater Milán",
          description: "Sweater con felpudo en cuello",
          price: 45000,
          discount: 0,
          image: "/products/sweater-blanco.png",
          category: "sweaters",
          color: "Blanco",
          isBestseller: true,
          stock: 10,
        },
        {
          id: 2,
          name: "Sweater París",
          description: "Sweater con felpudo en cuello",
          price: 42000,
          discount: 0,
          image: "/products/sweater-beige.png",
          category: "sweaters",
          color: "Beige",
          stock: 8,
        },
        {
          id: 3,
          name: "Sweater Berlín",
          description: "Sweater con felpudo en cuello",
          price: 48000,
          discount: 10,
          image: "/products/sweater-gris.png",
          category: "sweaters",
          color: "Gris",
          stock: 5,
        },
        {
          id: 1,
          name: "Tapado Londres",
          description: "Tapado con felpudo en muñecas",
          price: 65000,
          discount: 15,
          image: "/products/tapado-beige.png",
          category: "tapados",
          color: "Beige",
          stock: 7,
        },
        {
          id: 2,
          name: "Tapado Viena",
          description: "Tapado con felpudo en muñecas",
          price: 68000,
          discount: 0,
          image: "/products/tapado-blanco.png",
          category: "tapados",
          color: "Blanco",
          stock: 6,
        },
        {
          id: 3,
          name: "Tapado Praga",
          description: "Tapado con felpudo en cuello",
          price: 72000,
          discount: 0,
          image: "/products/tapado-marron.png",
          category: "tapados",
          color: "Marrón",
          stock: 4,
        },
      ]

      // Guardar productos predeterminados en localStorage
      localStorage.setItem("products", JSON.stringify(defaultProducts))
      return defaultProducts
    }

    return JSON.parse(productsJson)
  } catch (error) {
    console.error("Error parsing products:", error)
    return []
  }
}

// Función para guardar productos en localStorage
export const saveProducts = (products: Product[]): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("products", JSON.stringify(products))
  } catch (error) {
    console.error("Error saving products:", error)
  }
}

// Función para obtener un producto por ID y categoría
export const getProductById = (id: number, category: ProductCategory): Product | null => {
  const products = getProducts()
  return products.find((p) => p.id === id && p.category === category) || null
}

// Función para actualizar el stock de un producto
export const updateProductStock = (productId: number, category: ProductCategory, newStock: number): void => {
  const products = getProducts()
  const productIndex = products.findIndex((p) => p.id === productId && p.category === category)

  if (productIndex !== -1) {
    products[productIndex].stock = newStock
    saveProducts(products)
  }
}

// Función para verificar si un producto tiene stock
export const hasStock = (productId: number, category: ProductCategory): boolean => {
  const product = getProductById(productId, category)
  return product ? product.stock > 0 : false
}

// Función para obtener el stock de un producto
export const getProductStock = (productId: number, category: ProductCategory): number => {
  const product = getProductById(productId, category)
  return product ? product.stock : 0
}
