"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"

// Importar funciones de productos
import { getProductById, hasStock } from "@/lib/actions"
import { defaultColors, defaultSizes } from "@/lib/products"

export default function ProductPage({ params }: { params: { categoria: string; id: string } }) {
  const { toast } = useToast()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState("Blanco")
  const [selectedSize, setSelectedSize] = useState("M")
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [productHasStock, setProductHasStock] = useState(true)

  // Cargar producto
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const productId = Number.parseInt(params.id)
        const productData = await getProductById(productId)

        if (productData) {
          setProduct({
            ...productData,
            rating: 5,
            reviews: 12,
            colors: defaultColors,
            sizes: defaultSizes,
          })

          // Verificar stock
          const hasStockResult = await hasStock(productId)
          setProductHasStock(hasStockResult)
        } else {
          // Si no existe en la base de datos, usar datos predeterminados
          setProduct({
            id: Number.parseInt(params.id),
            category: params.categoria,
            name:
              params.categoria === "sweaters"
                ? params.id === "1"
                  ? "Sweater Milán"
                  : "Sweater París"
                : "Tapado Londres",
            description:
              params.categoria === "sweaters"
                ? "Sweater con felpudo en cuello, confeccionado con lana de primera calidad. Diseño exclusivo inspirado en el estilo europeo."
                : "Tapado con felpudo en muñecas, confeccionado con materiales premium. Diseño exclusivo inspirado en el estilo europeo.",
            price: params.categoria === "sweaters" ? (params.id === "1" ? 45000 : 42000) : 65000,
            discount: params.categoria === "tapados" ? 15 : 0,
            colors: defaultColors,
            sizes: defaultSizes,
            is_bestseller: params.id === "1" && params.categoria === "sweaters",
            rating: 5,
            reviews: 12,
            stock: 10, // Stock predeterminado
          })
          setProductHasStock(true)
        }
      } catch (error) {
        console.error("Error al cargar producto:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, params.categoria, toast])

  if (loading || !product) {
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

  const getProductImage = () => {
    if (product.image) return product.image

    if (params.categoria === "sweaters") {
      if (params.id === "1") return "/products/sweater-blanco.png"
      if (params.id === "2") return "/products/sweater-beige.png"
      return "/products/sweater-gris.png"
    } else {
      if (params.id === "1") return "/products/tapado-beige.png"
      if (params.id === "2") return "/products/tapado-blanco.png"
      return "/products/tapado-marron.png"
    }
  }

  const discountedPrice =
    product.discount > 0 ? product.price - (product.price * product.discount) / 100 : product.price

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const addToCart = () => {
    const finalPrice = product.discount > 0 ? discountedPrice : product.price

    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: product.discount > 0 ? product.price : undefined,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
      image: getProductImage(),
      category: params.categoria,
    })

    toast({
      title: "Producto agregado al carrito",
      description: `${quantity} ${product.name} - Color: ${selectedColor} - Talle: ${selectedSize}`,
    })
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
            <Link
              href={`/productos/${params.categoria}`}
              className="text-sm text-muted-foreground hover:text-black capitalize"
            >
              {params.categoria}
            </Link>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm">{product.name}</span>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative">
                {product.is_bestseller && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-black text-white">Bestseller</Badge>
                  </div>
                )}
                {product.discount > 0 && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-red-600 text-white">-{product.discount}%</Badge>
                  </div>
                )}
                <Image
                  src={getProductImage() || "/placeholder.svg"}
                  alt={product.name}
                  width={500}
                  height={600}
                  className="rounded-lg object-cover w-full aspect-[4/5]"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Image
                  src={getProductImage() || "/placeholder.svg"}
                  alt={`${product.name} vista 1`}
                  width={120}
                  height={150}
                  className="rounded-lg object-cover aspect-square cursor-pointer border hover:border-black"
                />
                <Image
                  src={
                    params.categoria === "sweaters" ? "/products/detalle-cuello.png" : "/products/detalle-cierre.png"
                  }
                  alt={`${product.name} vista 2`}
                  width={120}
                  height={150}
                  className="rounded-lg object-cover aspect-square cursor-pointer border hover:border-black"
                />
                <Image
                  src={params.categoria === "tapados" ? "/products/modelo-tapado.png" : "/products/sweater-gris.png"}
                  alt={`${product.name} vista 3`}
                  width={120}
                  height={150}
                  className="rounded-lg object-cover aspect-square cursor-pointer border hover:border-black"
                />
                <Image
                  src={params.categoria === "tapados" ? "/products/detalle-cierre.png" : "/products/detalle-cuello.png"}
                  alt={`${product.name} vista 4`}
                  width={120}
                  height={150}
                  className="rounded-lg object-cover aspect-square cursor-pointer border hover:border-black"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    <Star className="w-4 h-4 fill-black" />
                    <Star className="w-4 h-4 fill-black" />
                    <Star className="w-4 h-4 fill-black" />
                    <Star className="w-4 h-4 fill-black" />
                    <Star className="w-4 h-4 fill-black" />
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviews} reseñas)</span>
                </div>
                <div className="mt-4">
                  {product.discount > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">${discountedPrice.toLocaleString()}</span>
                      <span className="text-lg text-muted-foreground line-through">
                        ${product.price.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold">${product.price.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground">{product.description}</p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Color</h3>
                  <div className="flex gap-2">
                    {product.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-md ${
                          selectedColor === color ? "border-black bg-gray-100" : "border-gray-200"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Talle</h3>
                  <div className="flex gap-2">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 flex items-center justify-center border rounded-md ${
                          selectedSize === size ? "border-black bg-gray-100" : "border-gray-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <Link href="/guia-talles" className="text-sm text-black underline mt-2 inline-block">
                    Guía de talles
                  </Link>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Cantidad</h3>
                  <div className="flex items-center border rounded-md w-fit">
                    <button onClick={decrementQuantity} className="px-3 py-2 border-r" aria-label="Disminuir cantidad">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2">{quantity}</span>
                    <button onClick={incrementQuantity} className="px-3 py-2 border-l" aria-label="Aumentar cantidad">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <Button
                onClick={addToCart}
                className="w-full bg-black hover:bg-gray-800 text-white"
                disabled={!productHasStock}
              >
                {productHasStock ? "Agregar al carrito" : "Agotado"}
              </Button>
              {!productHasStock && (
                <p className="text-red-600 text-sm mt-2 text-center">
                  Este producto está agotado. Por favor, contáctanos para consultar disponibilidad.
                </p>
              )}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger>Detalles del producto</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Material: Lana premium con detalles de felpudo</li>
                      <li>Cuidado: Lavar en seco</li>
                      <li>Origen: Diseñado en Argentina, inspirado en el estilo europeo</li>
                      <li>Temporada: Otoño/Invierno</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping">
                  <AccordionTrigger>Envío y devoluciones</AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Envío a domicilio en Capital Federal.</p>
                      <p>También disponible para retirar en nuestra dirección.</p>
                      <p>No se aceptan devoluciones.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Reseñas de clientes</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex">
                    <Star className="w-4 h-4 fill-black" />
                    <Star className="w-4 h-4 fill-black" />
                    <Star className="w-4 h-4 fill-black" />
                    <Star className="w-4 h-4 fill-black" />
                    <Star className="w-4 h-4 fill-black" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "Me encantó este producto, la calidad es excelente y el detalle del felpudo le da un toque único. Muy
                  abrigado y cómo la calidad es excelente y el detalle del felpudo le da un toque único. Muy abrigado y
                  cómodo para el invierno porteño."
                </p>
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-sm">Valentina Gómez</div>
                  <div className="text-xs text-muted-foreground">Buenos Aires</div>
                </div>
              </div>
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex">
                    <Star className="w-4 h-4 fill-black" />
                    <Star className="w-4 h-4 fill-black" />
                    <Star className="w-4 h-4 fill-black" />
                    <Star className="w-4 h-4 fill-black" />
                    <Star className="w-4 h-4 fill-black" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "Superó mis expectativas. El felpudo es súper suave y la prenda es muy elegante. Recibí muchos
                  cumplidos cuando lo usé. Definitivamente compraré más productos de Galazzia."
                </p>
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-sm">Luciana Martínez</div>
                  <div className="text-xs text-muted-foreground">Capital Federal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
