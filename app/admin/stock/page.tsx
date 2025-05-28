"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Plus, Minus, Save, Search, Edit, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import AdminAuthCheck from "@/components/admin-auth-check"
import { useToast } from "@/hooks/use-toast"
import { getProducts, updateProductStock, updateProduct } from "@/lib/actions"
import type { Product } from "@/lib/supabase"

export default function StockPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all")
  const [loading, setLoading] = useState(true)
  const [editedStock, setEditedStock] = useState<Record<string, number>>({})
  const [editedPrice, setEditedPrice] = useState<Record<string, number>>({})
  const [editingPrice, setEditingPrice] = useState<Record<string, boolean>>({})

  // Cargar productos
  useEffect(() => {
    loadProducts()
  }, [])

  // Filtrar productos cuando cambian los filtros
  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, categoryFilter])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const allProducts = await getProducts()
      setProducts(allProducts)

      // Inicializar el estado de stock y precio editado
      const initialEditedStock: Record<string, number> = {}
      const initialEditedPrice: Record<string, number> = {}
      const initialEditingPrice: Record<string, boolean> = {}

      allProducts.forEach((product) => {
        initialEditedStock[`${product.id}`] = product.stock
        initialEditedPrice[`${product.id}`] = product.price
        initialEditingPrice[`${product.id}`] = false
      })

      setEditedStock(initialEditedStock)
      setEditedPrice(initialEditedPrice)
      setEditingPrice(initialEditingPrice)
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

  const handleStockChange = (productId: number, action: "increase" | "decrease") => {
    const key = `${productId}`
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

  const handleStockInputChange = (productId: number, value: string) => {
    const key = `${productId}`
    const numValue = Number.parseInt(value)

    if (!isNaN(numValue) && numValue >= 0) {
      setEditedStock({
        ...editedStock,
        [key]: numValue,
      })
    }
  }

  const handlePriceInputChange = (productId: number, value: string) => {
    const key = `${productId}`
    const numValue = Number.parseInt(value)

    if (!isNaN(numValue) && numValue >= 0) {
      setEditedPrice({
        ...editedPrice,
        [key]: numValue,
      })
    }
  }

  const startEditingPrice = (productId: number) => {
    setEditingPrice({
      ...editingPrice,
      [`${productId}`]: true,
    })
  }

  const cancelEditingPrice = (productId: number) => {
    const key = `${productId}`
    const product = products.find((p) => p.id === productId)

    if (product) {
      setEditedPrice({
        ...editedPrice,
        [key]: product.price,
      })
    }

    setEditingPrice({
      ...editingPrice,
      [key]: false,
    })
  }

  const handleSaveStock = async (productId: number) => {
    const key = `${productId}`
    const newStock = editedStock[key]

    if (newStock === undefined) return

    try {
      const success = await updateProductStock(productId, newStock)

      if (success) {
        toast({
          title: "Stock actualizado",
          description: "El stock del producto ha sido actualizado correctamente",
        })

        // Actualizar el producto en la lista local
        setProducts((prevProducts) => prevProducts.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)))
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el stock",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al guardar stock:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock",
        variant: "destructive",
      })
    }
  }

  const handleSavePrice = async (productId: number) => {
    const key = `${productId}`
    const newPrice = editedPrice[key]

    if (newPrice === undefined) return

    try {
      const success = await updateProduct(productId, { price: newPrice })

      if (success) {
        toast({
          title: "Precio actualizado",
          description: "El precio del producto ha sido actualizado correctamente",
        })

        // Actualizar el producto en la lista local
        setProducts((prevProducts) => prevProducts.map((p) => (p.id === productId ? { ...p, price: newPrice } : p)))

        // Salir del modo edición
        setEditingPrice({
          ...editingPrice,
          [key]: false,
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el precio",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al guardar precio:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio",
        variant: "destructive",
      })
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
                <Link href="/admin" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver a administración
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Administración de Stock y Precios</h1>
            </div>
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
                  onChange={(e) => setCategoryFilter(e.target.value as "all" | string)}
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
                      const stockKey = `${product.id}`
                      const priceKey = `${product.id}`
                      const currentStock = editedStock[stockKey] !== undefined ? editedStock[stockKey] : product.stock
                      const currentPrice = editedPrice[priceKey] !== undefined ? editedPrice[priceKey] : product.price
                      const isEditingPrice = editingPrice[priceKey] || false
                      const isOutOfStock = currentStock <= 0

                      return (
                        <TableRow key={`${product.id}`} className={isOutOfStock ? "bg-red-50" : ""}>
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
                            {isEditingPrice ? (
                              <div className="flex items-center gap-2">
                                <span>$</span>
                                <Input
                                  type="number"
                                  min="0"
                                  value={currentPrice}
                                  onChange={(e) => handlePriceInputChange(product.id, e.target.value)}
                                  className="w-24 text-center"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleSavePrice(product.id)}
                                  className="h-8 w-8"
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => cancelEditingPrice(product.id)}
                                  className="h-8 w-8"
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
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
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditingPrice(product.id)}
                                  className="h-8 w-8 ml-2"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Input
                                type="number"
                                min="0"
                                value={currentStock}
                                onChange={(e) => handleStockInputChange(product.id, e.target.value)}
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
                                onClick={() => handleStockChange(product.id, "decrease")}
                                disabled={currentStock <= 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleStockChange(product.id, "increase")}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button variant="default" size="sm" onClick={() => handleSaveStock(product.id)}>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar
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
            <h2 className="text-lg font-semibold mb-2">Información sobre stock y precios</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Los productos sin stock (0) se mostrarán como "Agotado" en la tienda y no se podrán comprar.</li>
              <li>Cuando un cliente realiza una compra, el stock se reduce automáticamente.</li>
              <li>Los cambios en precios se reflejan inmediatamente en la tienda.</li>
              <li>Los cambios se guardan en la base de datos y están disponibles para todos los administradores.</li>
            </ul>
          </div>
        </main>
        <SiteFooter />
      </div>
    </AdminAuthCheck>
  )
}
