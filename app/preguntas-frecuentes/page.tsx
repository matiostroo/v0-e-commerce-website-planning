import Link from "next/link"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
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
          <h1 className="text-3xl font-bold mb-6">Preguntas Frecuentes</h1>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Cuáles son los métodos de pago disponibles?</AccordionTrigger>
                <AccordionContent>
                  Aceptamos tarjetas de crédito, tarjetas de débito, transferencia bancaria y Mercado Pago. Todas las
                  transacciones son seguras y procesadas a través de plataformas confiables.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>¿Cuánto tiempo tarda en llegar mi pedido?</AccordionTrigger>
                <AccordionContent>
                  Para envíos en Capital Federal, el tiempo de entrega es de 2 a 3 días hábiles. También ofrecemos la
                  opción de retirar tu pedido en nuestra dirección, disponible 24 horas después de realizada la compra.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>¿Puedo cambiar el talle de mi prenda?</AccordionTrigger>
                <AccordionContent>
                  Sí, ofrecemos cambios de talle dentro de los 7 días posteriores a la recepción del producto, siempre y
                  cuando la prenda esté en perfectas condiciones, con todas sus etiquetas originales y sin haber sido
                  usada. Para solicitar un cambio, por favor contáctanos a través de nuestro WhatsApp de consultas.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>¿Aceptan devoluciones?</AccordionTrigger>
                <AccordionContent>
                  No aceptamos devoluciones. Solo realizamos cambios de talle o color, sujeto a disponibilidad de stock.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>¿Cómo debo cuidar mis prendas Galazzia?</AccordionTrigger>
                <AccordionContent>
                  Recomendamos lavar en seco nuestros tapados y sweaters para mantener la calidad del felpudo y la forma
                  de la prenda. Evita el uso de secadora y plancha directamente sobre el felpudo. Guarda tus prendas
                  colgadas en un lugar fresco y seco.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger>¿Tienen tienda física?</AccordionTrigger>
                <AccordionContent>
                  Sí, contamos con un punto de venta en Capital Federal donde puedes ver y probarte nuestras prendas.
                  También puedes retirar tus compras online en esta dirección. Puedes encontrar nuestra ubicación exacta
                  en la sección de Contacto.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7">
                <AccordionTrigger>¿Realizan envíos internacionales?</AccordionTrigger>
                <AccordionContent>
                  Actualmente solo realizamos envíos dentro de Argentina, con foco principal en Capital Federal. Estamos
                  trabajando para expandir nuestros servicios de envío a nivel internacional en el futuro.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8">
                <AccordionTrigger>¿Cómo puedo saber cuál es mi talle?</AccordionTrigger>
                <AccordionContent>
                  Puedes consultar nuestra guía de talles en la sección correspondiente del sitio web. Allí encontrarás
                  tablas detalladas con medidas para cada prenda y consejos sobre cómo tomar tus medidas correctamente.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-12 p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">¿No encontraste lo que buscabas?</h2>
              <p className="text-muted-foreground mb-4">
                Si tienes alguna otra pregunta o necesitas asistencia, no dudes en contactarnos. Estamos aquí para
                ayudarte.
              </p>
              <Link href="/contacto" className="text-black font-medium hover:underline">
                Contactar con Atención al Cliente
              </Link>
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
