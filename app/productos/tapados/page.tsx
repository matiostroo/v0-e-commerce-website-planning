"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { getProductsByCategory } from "@/lib/actions"
import type { Product } from "@/lib/supabase"

export default function TapadosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const data = await getProductsByCategory("tapados")
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-gray-200 rounded-full border-t-black"></div>
        </main>
        <SiteFooter />
      </div>
    )
  }

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
            <Link href="/productos" className="text-sm text-muted-foreground hover:text-black">
              Productos
            </Link>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm">Tapados</span>
          </div>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Tapados</h1>
            <p className="text-muted-foreground">
              Descubre nuestra colección de tapados con felpudo, confeccionados con materiales premium. Diseños
              exclusivos inspirados en el estilo europeo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative">
                    {product.is_bestseller && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-black text-white">Bestseller</Badge>
                      </div>
                    )}
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-red-600 text-white">-{product.discount}%</Badge>
                      </div>
                    )}
                    <Link href={`/productos/tapados/${product.id}`}>
                      <Image
                        src={product.image || "/products/tapado-beige.png"}
                        alt={product.name}
                        width={500}
                        height={600}
                        className="object-cover w-full aspect-[4/5]"
                      />
                    </Link>
                  </div>
                  <CardContent className="p-4">
                    <Link href={`/productos/tapados/${product.id}`}>
                      <h2 className="font-semibold text-lg mb-2">{product.name}</h2>
                    </Link>
                    {product.discount > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          ${((product.price * (100 - product.discount)) / 100).toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold">${product.price.toLocaleString()}</span>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full bg-black hover:bg-gray-800 text-white">
                      <Link href={`/productos/tapados/${product.id}`}>Ver detalles</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
