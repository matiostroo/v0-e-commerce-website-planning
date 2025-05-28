import { redirect } from "next/navigation"

export default function AdminPage() {
  // Redirigir directamente a la página de stock
  redirect("/admin/stock")
}
