"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Plus, Minus, Save, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import AdminAuthCheck from "@/components/admin-auth-check"
import { useToast } from "@/hooks/use-toast"

// Tipos para los productos
type ProductCategory = "sweaters" | "tapados"

type Product = {
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
const getProducts = (): Product[] => {
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
          id: 4,
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
          id: 5,
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
          id: 6,
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
const saveProducts = (products: Product[]): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("products", JSON.stringify(products))
  } catch (error) {
    console.error("Error saving products:", error)
  }
}

// Función para actualizar el stock de un producto
const updateProductStock = (productId: number, category: ProductCategory, newStock: number): void => {
  const products = getProducts()
  const productIndex = products.findIndex((p) => p.id === productId && p.category === category)

  if (productIndex !== -1) {
    products[productIndex].stock = newStock
    saveProducts(products)
  }
}

export default function StockPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | ProductCategory>("all")
  const [loading, setLoading] = useState(true)
  const [editedStock, setEditedStock] = useState<Record<string, number>>({})

  // Cargar productos
  useEffect(() => {
    loadProducts()
  }, [])

  // Filtrar productos cuando cambian los filtros
  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, categoryFilter])

  const loadProducts = () => {
    setLoading(true)
    try {
      const allProducts = getProducts()
      setProducts(allProducts)

      // Inicializar el estado de stock editado
      const initialEditedStock: Record<string, number> = {}
      allProducts.forEach((product) => {
        initialEditedStock[`${product.category}-${product.id}`] = product.stock
      })
      setEditedStock(initialEditedStock)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Filtrar por categoría
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category === categoryFilter)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) => product.name.toLowerCase().includes(term) || product.color.toLowerCase().includes(term),
      )
    }

    setFilteredProducts(filtered)
  }

  const handleStockChange = (productId: number, category: ProductCategory, action: "increase" | "decrease") => {
    const key = `${category}-${productId}`
    const currentStock = editedStock[key] || 0

    if (action === "increase") {
      setEditedStock({
        ...editedStock,
        [key]: currentStock + 1,
      })
    } else if (action === "decrease" && currentStock > 0) {
      setEditedStock({
        ...editedStock,
        [key]: currentStock - 1,
      })
    }
  }

  const handleStockInputChange = (productId: number, category: ProductCategory, value: string) => {
    const key = `${category}-${productId}`
    const numValue = Number.parseInt(value)

    if (!isNaN(numValue) && numValue >= 0) {
      setEditedStock({
        ...editedStock,
        [key]: numValue,
      })
    }
  }

  const handleSaveStock = () => {
    setLoading(true)

    try {
      // Actualizar productos con el nuevo stock
      const updatedProducts = products.map((product) => {
        const key = `${product.category}-${product.id}`
        return {
          ...product,
          stock: editedStock[key] !== undefined ? editedStock[key] : product.stock,
        }
      })

      // Guardar en localStorage
      saveProducts(updatedProducts)

      // Actualizar estado
      setProducts(updatedProducts)

      toast({
        title: "Stock actualizado",
        description: "El stock de los productos ha sido actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al guardar stock:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminAuthCheck>
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/pedidos" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver a pedidos
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Administración de Stock</h1>
            </div>
            <Button onClick={handleSaveStock} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              Guardar cambios
            </Button>
          </div>

          <div className="bg-white border rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por nombre o color..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="border rounded-md px-3 py-2"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as "all" | ProductCategory)}
                >
                  <option value="all">Todas las categorías</option>
                  <option value="sweaters">Sweaters</option>
                  <option value="tapados">Tapados</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 rounded-full border-t-black"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm || categoryFilter !== "all" ? (
                  <p>No se encontraron productos con los filtros aplicados</p>
                ) : (
                  <p>No hay productos registrados</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imagen</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const stockKey = `${product.category}-${product.id}`
                      const currentStock = editedStock[stockKey] !== undefined ? editedStock[stockKey] : product.stock
                      const isOutOfStock = currentStock <= 0

                      return (
                        <TableRow key={`${product.category}-${product.id}`} className={isOutOfStock ? "bg-red-50" : ""}>
                          <TableCell>
                            <div className="w-16 h-16 relative">
                              <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="capitalize">{product.category}</TableCell>
                          <TableCell>{product.color}</TableCell>
                          <TableCell>
                            {product.discount > 0 ? (
                              <div>
                                <span className="line-through text-muted-foreground mr-2">
                                  ${product.price.toLocaleString()}
                                </span>
                                <span>${((product.price * (100 - product.discount)) / 100).toLocaleString()}</span>
                              </div>
                            ) : (
                              <span>${product.price.toLocaleString()}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Input
                                type="number"
                                min="0"
                                value={currentStock}
                                onChange={(e) => handleStockInputChange(product.id, product.category, e.target.value)}
                                className="w-20 text-center"
                              />
                              {isOutOfStock && <span className="ml-2 text-xs text-red-600 font-medium">Sin stock</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleStockChange(product.id, product.category, "decrease")}
                                disabled={currentStock <= 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleStockChange(product.id, product.category, "increase")}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">Información sobre el stock</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Los productos sin stock (0) se mostrarán como "Agotado" en la tienda y no se podrán comprar.</li>
              <li>Cuando un cliente realiza una compra, el stock se reduce automáticamente.</li>
              <li>Recuerda guardar los cambios después de modificar el stock.</li>
              <li>El stock se guarda en el navegador (localStorage). Asegúrate de hacer un respaldo regularmente.</li>
            </ul>
          </div>
        </main>
        <SiteFooter />
      </div>
    </AdminAuthCheck>
  )
}
