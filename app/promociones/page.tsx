import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function PromocionesPage() {
  // Datos de ejemplo - en una implementación real, estos vendrían de una base de datos
  const products = [
    {
      id: 1,
      name: "Tapado Londres",
      description: "Tapado con felpudo en muñecas",
      price: 65000,
      discount: 15,
      image: "/products/tapado-beige.png",
      category: "tapados",
      color: "Beige",
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
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container px-4 py-6 md:py-12">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-black">
              Inicio
            </Link>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm">Promociones</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Promociones</h1>
              <p className="text-muted-foreground">
                Descubre nuestras ofertas especiales en sweaters y tapados con detalles de felpudo.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group relative overflow-hidden rounded-lg border">
                <Link href={`/productos/${product.category}/${product.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">Ver producto</span>
                </Link>
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="object-cover transition-transform group-hover:scale-105 h-full w-full"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-600 text-white">-{product.discount}%</Badge>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="font-semibold">
                      <span className="line-through text-muted-foreground mr-2">${product.price.toLocaleString()}</span>
                      ${((product.price * (100 - product.discount)) / 100).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">{product.color}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
