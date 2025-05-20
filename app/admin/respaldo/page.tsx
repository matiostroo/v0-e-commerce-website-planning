"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import AdminAuthCheck from "@/components/admin-auth-check"
import { getOrders, type Order } from "@/lib/orders"
import { useToast } from "@/hooks/use-toast"

export default function BackupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [backupData, setBackupData] = useState("")
  const [restoreData, setRestoreData] = useState("")

  useEffect(() => {
    // Cargar datos actuales al iniciar
    const orders = getOrders()
    setBackupData(JSON.stringify(orders, null, 2))
  }, [])

  const handleBackup = () => {
    try {
      // Crear un blob y descargar
      const blob = new Blob([backupData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `galazzia_pedidos_${new Date().toISOString().split("T")[0]}.json`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Respaldo exitoso",
        description: "Se ha descargado el archivo de respaldo de pedidos",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el archivo de respaldo",
        variant: "destructive",
      })
    }
  }

  const handleRestore = () => {
    try {
      // Validar que sea un JSON válido
      const orders = JSON.parse(restoreData) as Order[]

      // Verificar que sea un array
      if (!Array.isArray(orders)) {
        throw new Error("El formato del archivo no es válido")
      }

      // Guardar en localStorage
      localStorage.setItem("orders", JSON.stringify(orders))

      toast({
        title: "Restauración exitosa",
        description: `Se han restaurado ${orders.length} pedidos`,
      })

      // Actualizar el área de texto de respaldo
      setBackupData(JSON.stringify(orders, null, 2))
    } catch (error) {
      toast({
        title: "Error",
        description: "El formato del archivo no es válido",
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
                <Link href="/admin/pedidos" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver a pedidos
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Respaldo y Restauración</h1>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Respaldo */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Respaldo de Pedidos</h2>
              <p className="text-muted-foreground mb-4">
                Descarga un archivo JSON con todos tus pedidos. Guarda este archivo en un lugar seguro para poder
                restaurar tus datos en caso de pérdida.
              </p>

              <Textarea value={backupData} readOnly className="font-mono text-xs h-64 mb-4" />

              <Button onClick={handleBackup} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Descargar Respaldo
              </Button>
            </div>

            {/* Restauración */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Restaurar Pedidos</h2>
              <p className="text-muted-foreground mb-4">
                Pega el contenido de un archivo de respaldo para restaurar tus pedidos. <strong>Advertencia:</strong>{" "}
                Esta acción reemplazará todos los pedidos actuales.
              </p>

              <Textarea
                value={restoreData}
                onChange={(e) => setRestoreData(e.target.value)}
                placeholder="Pega aquí el contenido del archivo JSON de respaldo..."
                className="font-mono text-xs h-64 mb-4"
              />

              <Button onClick={handleRestore} variant="outline" className="w-full gap-2">
                <Upload className="h-4 w-4" />
                Restaurar desde Respaldo
              </Button>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">Importante: Cómo mantener tus datos</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                Los pedidos se almacenan en el navegador (localStorage). Si limpias los datos del navegador o usas otro
                dispositivo, no verás los mismos pedidos.
              </li>
              <li>
                <strong>Antes de cada deploy o actualización del sitio</strong>, descarga un respaldo de tus pedidos.
              </li>
              <li>Después del deploy, vuelve a esta página y restaura tus pedidos usando el archivo de respaldo.</li>
              <li>Considera hacer respaldos regulares (semanales) para evitar pérdida de datos.</li>
            </ul>
          </div>
        </main>
        <SiteFooter />
      </div>
    </AdminAuthCheck>
  )
}
