import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Elegancia Europea en Buenos Aires
                </h1>
                <p className="max-w-[600px] text-muted-foreground text-gray-300 md:text-xl">
                  Descubrí nuestra exclusiva colección de tapados y sweaters con detalles de felpudo, inspirados en el
                  estilo europeo.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/productos">
                    <Button className="bg-white text-black hover:bg-gray-200">
                      Ver Colección
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/products/modelo-tapado.png"
                  alt="Modelo con tapado Galazzia"
                  width={450}
                  height={550}
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nuestros Productos</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Prendas únicas con detalles de felpudo que te harán destacar
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="group relative overflow-hidden rounded-lg border">
                <Link href="/productos/sweaters/1" className="absolute inset-0 z-10">
                  <span className="sr-only">Ver producto</span>
                </Link>
                <Image
                  src="/products/sweater-blanco.png"
                  alt="Sweater con felpudo"
                  width={300}
                  height={400}
                  className="object-cover transition-transform group-hover:scale-105 aspect-[3/4] w-full"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-black text-white">Bestseller</Badge>
                </div>
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-lg">Sweater Milán</h3>
                  <p className="text-sm text-muted-foreground">Sweater con felpudo en cuello</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="font-semibold">$45.000</div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border">
                <Link href="/productos/sweaters/2" className="absolute inset-0 z-10">
                  <span className="sr-only">Ver producto</span>
                </Link>
                <Image
                  src="/products/sweater-beige.png"
                  alt="Sweater con felpudo"
                  width={300}
                  height={400}
                  className="object-cover transition-transform group-hover:scale-105 aspect-[3/4] w-full"
                />
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-lg">Sweater París</h3>
                  <p className="text-sm text-muted-foreground">Sweater con felpudo en cuello</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="font-semibold">$42.000</div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border">
                <Link href="/productos/tapados/1" className="absolute inset-0 z-10">
                  <span className="sr-only">Ver producto</span>
                </Link>
                <Image
                  src="/products/tapado-beige.png"
                  alt="Tapado con felpudo"
                  width={300}
                  height={400}
                  className="object-cover transition-transform group-hover:scale-105 aspect-[3/4] w-full"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-red-600 text-white">-15%</Badge>
                </div>
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-lg">Tapado Londres</h3>
                  <p className="text-sm text-muted-foreground">Tapado con felpudo en muñecas</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="font-semibold">
                      <span className="line-through text-muted-foreground mr-2">$65.000</span>
                      $55.250
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Link href="/productos">
                <Button variant="outline" className="border-black text-black hover:bg-gray-100">
                  Ver todos los productos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Lo que dicen nuestras clientas</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Experiencias reales con nuestros productos
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src="/testimonials/user1.jpg"
                      alt="Valentina Gómez"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Valentina Gómez</p>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "El sweater Milán es increíble, la calidad del felpudo en el cuello es excelente y me mantiene súper
                  abrigada. Además, recibí muchos cumplidos cuando lo usé."
                </p>
                <div className="text-xs text-muted-foreground">Buenos Aires</div>
              </div>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src="/testimonials/user2.jpg"
                      alt="Luciana Martínez"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Luciana Martínez</p>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "Me encantó el tapado Londres, es súper cómodo y el detalle del felpudo en las muñecas le da un toque
                  único. La calidad es excelente y el envío fue rápido."
                </p>
                <div className="text-xs text-muted-foreground">Capital Federal</div>
              </div>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src="/testimonials/user3.jpg"
                      alt="Camila Rodríguez"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Camila Rodríguez</p>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                      <Star className="w-4 h-4 fill-black" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "El sweater París es hermoso y muy abrigado. El felpudo es súper suave y la calidad de la tela es muy
                  buena. Lo recomiendo totalmente para el invierno porteño."
                </p>
                <div className="text-xs text-muted-foreground">Buenos Aires</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
