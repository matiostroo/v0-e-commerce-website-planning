"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { migrateProductsFromLocalStorage, migrateOrdersFromLocalStorage } from "@/lib/data-migration"

export default function MigracionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    products?: number
    orders?: number
  } | null>(null)

  const handleMigration = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Obtener productos del localStorage
      const productsJson = localStorage.getItem("products")
      const products = productsJson ? JSON.parse(productsJson) : []

      // Obtener pedidos del localStorage
      const ordersJson = localStorage.getItem("orders")
      const orders = ordersJson ? JSON.parse(ordersJson) : []

      // Migrar productos
      const migratedProducts = await migrateProductsFromLocalStorage(products)

      // Migrar pedidos
      const migratedOrders = await migrateOrdersFromLocalStorage(orders)

      setResult({
        success: true,
        message: "Migración completada con éxito",
        products: migratedProducts,
        orders: migratedOrders,
      })
    } catch (error) {
      console.error("Error during migration:", error)
      setResult({
        success: false,
        message: `Error durante la migración: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Migración de Datos</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Migrar datos de localStorage a Supabase</CardTitle>
          <CardDescription>
            Esta herramienta migrará todos los productos y pedidos almacenados en localStorage a la base de datos
            Supabase. Asegúrate de realizar esta operación solo una vez para evitar duplicados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">La migración incluirá:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Todos los productos con sus detalles</li>
            <li>Todos los pedidos con información de envío e items</li>
          </ul>
          <p className="text-amber-600 font-medium">
            Nota: Esta operación no eliminará los datos de localStorage. Puedes seguir usando la aplicación normalmente
            después de la migración.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleMigration} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrando datos...
              </>
            ) : (
              "Iniciar Migración"
            )}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{result.success ? "Migración Exitosa" : "Error en la Migración"}</AlertTitle>
          <AlertDescription>
            {result.message}
            {result.success && (
              <ul className="mt-2">
                <li>Productos migrados: {result.products}</li>
                <li>Pedidos migrados: {result.orders}</li>
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
