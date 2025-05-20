"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ProductsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("featured")

  // Datos de ejemplo - en una implementación real, estos vendrían de una base de datos
  const allProducts = [
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
      id: 2,
      name: "Tapado Viena",
      description: "Tapado con felpudo en muñecas",
      price: 68000,
      discount: 0,
      image: "/products/tapado-blanco.png",
      category: "tapados",
      color: "Blanco",
    },
    {
      id: 3,
      name: "Tapado Praga",
      description: "Tapado con felpudo en cuello",
      price: 72000,
      discount: 0,
      image: "/products/tapado-marron.png",
      category: "tapados",
      color: "Marrón",
    },
  ]

  // Filtrar productos por categoría
  const filteredProducts =
    categoryFilter === "all" ? allProducts : allProducts.filter((product) => product.category === categoryFilter)

  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price
    const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price

    switch (sortOrder) {
      case "price-asc":
        return priceA - priceB
      case "price-desc":
        return priceB - priceA
      case "discount":
        return b.discount - a.discount
      default: // featured - bestsellers first
        if (a.isBestseller && !b.isBestseller) return -1
        if (!a.isBestseller && b.isBestseller) return 1
        return 0
    }
  })

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
            <span className="text-sm">Todos los Productos</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Todos los Productos</h1>
              <p className="text-muted-foreground">
                Descubre nuestra colección completa de prendas con detalles de felpudo, inspiradas en el estilo europeo.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filtros para pantallas grandes */}
            <div className="hidden lg:block w-64 space-y-6">
              <div>
                <h3 className="font-medium mb-3">Categorías</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className={`justify-start px-2 ${categoryFilter === "all" ? "font-medium" : "font-normal text-muted-foreground"}`}
                      onClick={() => setCategoryFilter("all")}
                    >
                      {categoryFilter === "all" && <Check className="h-4 w-4 mr-2" />}
                      Todos los productos
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className={`justify-start px-2 ${categoryFilter === "sweaters" ? "font-medium" : "font-normal text-muted-foreground"}`}
                      onClick={() => setCategoryFilter("sweaters")}
                    >
                      {categoryFilter === "sweaters" && <Check className="h-4 w-4 mr-2" />}
                      Sweaters
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className={`justify-start px-2 ${categoryFilter === "tapados" ? "font-medium" : "font-normal text-muted-foreground"}`}
                      onClick={() => setCategoryFilter("tapados")}
                    >
                      {categoryFilter === "tapados" && <Check className="h-4 w-4 mr-2" />}
                      Tapados
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1">
              {/* Filtros móviles y ordenamiento */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <Accordion type="single" collapsible className="w-full lg:hidden">
                  <AccordionItem value="filters">
                    <AccordionTrigger>Filtros</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Categorías</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                className={`justify-start px-2 ${categoryFilter === "all" ? "font-medium" : "font-normal text-muted-foreground"}`}
                                onClick={() => setCategoryFilter("all")}
                              >
                                {categoryFilter === "all" && <Check className="h-4 w-4 mr-2" />}
                                Todos los productos
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                className={`justify-start px-2 ${categoryFilter === "sweaters" ? "font-medium" : "font-normal text-muted-foreground"}`}
                                onClick={() => setCategoryFilter("sweaters")}
                              >
                                {categoryFilter === "sweaters" && <Check className="h-4 w-4 mr-2" />}
                                Sweaters
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                className={`justify-start px-2 ${categoryFilter === "tapados" ? "font-medium" : "font-normal text-muted-foreground"}`}
                                onClick={() => setCategoryFilter("tapados")}
                              >
                                {categoryFilter === "tapados" && <Check className="h-4 w-4 mr-2" />}
                                Tapados
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-[200px] justify-between">
                        {sortOrder === "featured" && "Destacados"}
                        {sortOrder === "price-asc" && "Precio: menor a mayor"}
                        {sortOrder === "price-desc" && "Precio: mayor a menor"}
                        {sortOrder === "discount" && "Mayores descuentos"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]">
                      <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                        <DropdownMenuRadioItem value="featured">Destacados</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="price-asc">Precio: menor a mayor</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="price-desc">Precio: mayor a menor</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="discount">Mayores descuentos</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Productos */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product, index) => (
                  <div
                    key={`${product.category}-${product.id}-${index}`}
                    className="group relative overflow-hidden rounded-lg border"
                  >
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
                      {product.isBestseller && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-black text-white">Bestseller</Badge>
                        </div>
                      )}
                      {product.discount > 0 && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-red-600 text-white">-{product.discount}%</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-white">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        {product.discount > 0 ? (
                          <div className="font-semibold">
                            <span className="line-through text-muted-foreground mr-2">
                              ${product.price.toLocaleString()}
                            </span>
                            ${((product.price * (100 - product.discount)) / 100).toLocaleString()}
                          </div>
                        ) : (
                          <div className="font-semibold">${product.price.toLocaleString()}</div>
                        )}
                        <div className="text-sm text-muted-foreground">{product.color}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mensaje si no hay productos */}
              {sortedProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No se encontraron productos que coincidan con los filtros seleccionados.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
