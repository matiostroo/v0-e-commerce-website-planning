"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, ShoppingBag } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { usePathname } from "next/navigation"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function SiteHeader() {
  const { itemCount } = useCart()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Verificar si estamos en una página relacionada con productos
  const isProductPage =
    pathname.includes("/productos") || pathname.includes("/sweaters") || pathname.includes("/tapados")

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Galazzia" width={40} height={40} />
            <span className="text-xl font-semibold tracking-tight">Galazzia</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={`text-sm font-medium hover:underline underline-offset-4 ${
                pathname === "/" ? "text-black underline" : "text-muted-foreground"
              }`}
            >
              Inicio
            </Link>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger
                className={`flex items-center gap-1 text-sm font-medium hover:underline underline-offset-4 ${
                  isProductPage ? "text-black underline" : "text-muted-foreground"
                }`}
              >
                Productos <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/productos" className="w-full cursor-pointer">
                    Todos los productos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/productos/sweaters" className="w-full cursor-pointer">
                    Sweaters
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/productos/tapados" className="w-full cursor-pointer">
                    Tapados
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href="/promociones"
              className={`text-sm font-medium hover:underline underline-offset-4 ${
                pathname === "/promociones" ? "text-black underline" : "text-muted-foreground"
              }`}
            >
              Promociones
            </Link>
            <Link
              href="/guia-talles"
              className={`text-sm font-medium hover:underline underline-offset-4 ${
                pathname === "/guia-talles" ? "text-black underline" : "text-muted-foreground"
              }`}
            >
              Guía de Talles
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/carrito" className="relative">
            <ShoppingBag className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
              {itemCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
