"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import AdminAuthCheck from "@/components/admin-auth-check"
import { useToast } from "@/hooks/use-toast"

export default function ConfigPage() {
  const { toast } = useToast()
  const [telegramToken, setTelegramToken] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [loading, setLoading] = useState(false)

  // Cargar configuración al iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem("telegramToken") || ""
    const savedChatId = localStorage.getItem("telegramChatId") || ""
    const savedWhatsapp = localStorage.getItem("whatsappNumber") || "+5491150535668"

    setTelegramToken(savedToken)
    setTelegramChatId(savedChatId)
    setWhatsappNumber(savedWhatsapp)
  }, [])

  const handleSaveConfig = () => {
    setLoading(true)

    try {
      // Guardar configuración en localStorage
      localStorage.setItem("telegramToken", telegramToken)
      localStorage.setItem("telegramChatId", telegramChatId)
      localStorage.setItem("whatsappNumber", whatsappNumber)

      toast({
        title: "Configuración guardada",
        description: "La configuración ha sido guardada correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
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
              <h1 className="text-2xl font-bold">Configuración</h1>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Configuración de Telegram */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Configuración de Telegram</h2>
              <p className="text-muted-foreground mb-6">
                Configura las credenciales de tu bot de Telegram para recibir notificaciones de nuevos pedidos.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="telegram-token">Token del Bot</Label>
                  <Input
                    id="telegram-token"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    placeholder="Ej: 1234567890:ABCDefGhIJklMNoPQRsTUVwxyZ"
                  />
                  <p className="text-xs text-muted-foreground">
                    Puedes obtener un token creando un bot con @BotFather en Telegram.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram-chat-id">Chat ID</Label>
                  <Input
                    id="telegram-chat-id"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="Ej: 123456789"
                  />
                  <p className="text-xs text-muted-foreground">
                    Puedes obtener tu Chat ID enviando un mensaje a @userinfobot en Telegram.
                  </p>
                </div>
              </div>
            </div>

            {/* Configuración de WhatsApp */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Configuración de WhatsApp</h2>
              <p className="text-muted-foreground mb-6">
                Configura el número de WhatsApp que se utilizará para contactar a los clientes.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-number">Número de WhatsApp</Label>
                  <Input
                    id="whatsapp-number"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Ej: +5491112345678"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresa el número completo con código de país, sin espacios ni guiones.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveConfig} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Guardando..." : "Guardar configuración"}
            </Button>
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">Instrucciones para configurar el bot de Telegram</h2>
            <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
              <li>Abre Telegram y busca a @BotFather.</li>
              <li>Envía el comando /newbot y sigue las instrucciones para crear un nuevo bot.</li>
              <li>Una vez creado, @BotFather te dará un token. Cópialo y pégalo en el campo "Token del Bot".</li>
              <li>Ahora busca a @userinfobot y envíale cualquier mensaje.</li>
              <li>
                El bot te responderá con tu información, incluyendo tu Chat ID. Cópialo y pégalo en el campo "Chat ID".
              </li>
              <li>Inicia una conversación con tu nuevo bot enviándole cualquier mensaje.</li>
              <li>Guarda la configuración y prueba enviando un pedido de prueba.</li>
            </ol>
          </div>
        </main>
        <SiteFooter />
      </div>
    </AdminAuthCheck>
  )
}
