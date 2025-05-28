"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProducts, getProductsByCategory } from "@/lib/actions"
import type { Product } from "@/lib/supabase"

export default function ProductosPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [sweaters, setSweaters] = useState<Product[]>([])
  const [tapados, setTapados] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const [allData, sweatersData, tapadosData] = await Promise.all([
          getProducts(),
          getProductsByCategory("sweaters"),
          getProductsByCategory("tapados"),
        ])

        setAllProducts(allData)
        setSweaters(sweatersData)
        setTapados(tapadosData)
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
            <span className="text-sm">Productos</span>
          </div>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Productos</h1>
            <p className="text-muted-foreground">
              Descubre nuestra colección de prendas con felpudo, confeccionadas con materiales premium. Diseños
              exclusivos inspirados en el estilo europeo.
            </p>
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="sweaters">Sweaters</TabsTrigger>
                <TabsTrigger value="tapados">Tapados</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allProducts.map((product) => (
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
                        <Link href={`/productos/${product.category}/${product.id}`}>
                          <Image
                            src={
                              product.image ||
                              (product.category === "sweaters"
                                ? "/products/sweater-blanco.png"
                                : "/products/tapado-beige.png")
                            }
                            alt={product.name}
                            width={500}
                            height={600}
                            className="object-cover w-full aspect-[4/5]"
                          />
                        </Link>
                      </div>
                      <CardContent className="p-4">
                        <Link href={`/productos/${product.category}/${product.id}`}>
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
                          <Link href={`/productos/${product.category}/${product.id}`}>Ver detalles</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="sweaters">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sweaters.map((product) => (
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
                        <Link href={`/productos/sweaters/${product.id}`}>
                          <Image
                            src={product.image || "/products/sweater-blanco.png"}
                            alt={product.name}
                            width={500}
                            height={600}
                            className="object-cover w-full aspect-[4/5]"
                          />
                        </Link>
                      </div>
                      <CardContent className="p-4">
                        <Link href={`/productos/sweaters/${product.id}`}>
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
                          <Link href={`/productos/sweaters/${product.id}`}>Ver detalles</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="tapados">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tapados.map((product) => (
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
