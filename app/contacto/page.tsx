"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, MessageSquare, Phone, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que todos los campos estén completos
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Formulario incompleto",
        description: "Por favor completa todos los campos del formulario",
        variant: "destructive",
      })
      return
    }

    // Crear mensaje para WhatsApp
    const message = `
*Nuevo mensaje de contacto desde la web*

*Nombre:* ${formData.name}
*Email:* ${formData.email}
*Asunto:* ${formData.subject}

*Mensaje:*
${formData.message}
    `

    // Obtener número de WhatsApp (usar el configurado o el predeterminado)
    const whatsappNumber = localStorage.getItem("whatsappNumber") || "+5491150535668"

    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`

    // Abrir WhatsApp
    window.open(whatsappUrl, "_blank")

    // Mostrar mensaje de éxito
    toast({
      title: "Mensaje enviado",
      description: "Gracias por contactarnos. Te responderemos a la brevedad.",
    })

    // Limpiar formulario
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Galazzia" width={40} height={40} />
              <span className="text-xl font-semibold tracking-tight">Galazzia</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
                Inicio
              </Link>
              <Link href="/productos/sweaters" className="text-sm font-medium hover:underline underline-offset-4">
                Sweaters
              </Link>
              <Link href="/productos/tapados" className="text-sm font-medium hover:underline underline-offset-4">
                Tapados
              </Link>
              <Link href="/promociones" className="text-sm font-medium hover:underline underline-offset-4">
                Promociones
              </Link>
              <Link href="/guia-talles" className="text-sm font-medium hover:underline underline-offset-4">
                Guía de Talles
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/carrito" className="relative">
              <ShoppingBag className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
                0
              </span>
            </Link>
            <Link href="/cuenta" className="hidden md:block text-sm font-medium hover:underline underline-offset-4">
              Mi Cuenta
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-6 md:py-12">
          <h1 className="text-3xl font-bold mb-6">Contacto</h1>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-xl font-semibold mb-6">Envíanos un mensaje</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white">
                  Enviar mensaje
                </Button>
              </form>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-6">Información de contacto</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 mt-1" />
                  <div>
                    <h3 className="font-medium">Dirección</h3>
                    <p className="text-muted-foreground">Av. Corrientes 1234, CABA</p>
                    <p className="text-muted-foreground">Buenos Aires, Argentina</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="h-5 w-5 mt-1" />
                  <div>
                    <h3 className="font-medium">Teléfono</h3>
                    <p className="text-muted-foreground">+54 11 1234-5678</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MessageSquare className="h-5 w-5 mt-1" />
                  <div>
                    <h3 className="font-medium">WhatsApp de consultas</h3>
                    <p className="text-muted-foreground">+54 9 11 1234-5678</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MessageSquare className="h-5 w-5 mt-1" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">info@galazzia.com.ar</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Horario de atención</h3>
                  <p className="text-muted-foreground">Lunes a Viernes: 10:00 - 19:00</p>
                  <p className="text-muted-foreground">Sábados: 10:00 - 14:00</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Redes sociales</h3>
                  <Link href="https://instagram.com/galazzia.ba" target="_blank" className="text-black hover:underline">
                    Instagram: @galazzia.ba
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-24">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Galazzia" width={30} height={30} />
            <p className="text-sm text-muted-foreground">© 2024 Galazzia. Todos los derechos reservados.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/preguntas-frecuentes"
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
            >
              Preguntas Frecuentes
            </Link>
            <Link href="/contacto" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Contacto
            </Link>
            <Link
              href="https://instagram.com/galazzia.ba"
              target="_blank"
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
            >
              Instagram
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
