import Link from "next/link"
import Image from "next/image"
import { Instagram } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="w-full border-t py-6 md:py-0">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-24">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Galazzia" width={30} height={30} />
          <p className="text-sm text-muted-foreground">© 2025 Galazzia. Todos los derechos reservados.</p>
        </div>
        <Link
          href="https://instagram.com/galazzia.ba"
          target="_blank"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-black transition-colors"
        >
          <Instagram className="h-4 w-4" />
          <span>@galazzia.ba</span>
        </Link>
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
          <Link href="/admin" className="text-sm text-muted-foreground hover:underline underline-offset-4">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
