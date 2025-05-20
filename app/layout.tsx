import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/context/cart-context"
import { CartNotificationWrapper } from "@/components/cart-notification-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Galazzia - Sweaters y Tapados con Felpudo",
  description:
    "Descubre nuestra exclusiva colección de sweaters y tapados con detalles de felpudo, inspirados en el estilo europeo.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CartProvider>
            <CartNotificationWrapper />
            {children}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
