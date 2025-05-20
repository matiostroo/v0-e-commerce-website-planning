import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function SizeGuidePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container px-4 py-6 md:py-12">
          <h1 className="text-3xl font-bold mb-6">Guía de Talles</h1>
          <div className="max-w-3xl mx-auto space-y-8">
            <p className="text-muted-foreground">
              Para asegurarte de elegir el talle correcto, te recomendamos tomar tus medidas y compararlas con nuestra
              tabla de talles. Todas las medidas están en centímetros.
            </p>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Sweaters</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-4 py-2 text-left">Talle</th>
                      <th className="border px-4 py-2 text-left">Busto (cm)</th>
                      <th className="border px-4 py-2 text-left">Cintura (cm)</th>
                      <th className="border px-4 py-2 text-left">Largo (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">S</td>
                      <td className="border px-4 py-2">86-90</td>
                      <td className="border px-4 py-2">66-70</td>
                      <td className="border px-4 py-2">60</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">M</td>
                      <td className="border px-4 py-2">90-94</td>
                      <td className="border px-4 py-2">70-74</td>
                      <td className="border px-4 py-2">62</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">L</td>
                      <td className="border px-4 py-2">94-98</td>
                      <td className="border px-4 py-2">74-78</td>
                      <td className="border px-4 py-2">64</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">XL</td>
                      <td className="border px-4 py-2">98-102</td>
                      <td className="border px-4 py-2">78-82</td>
                      <td className="border px-4 py-2">66</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Tapados</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-4 py-2 text-left">Talle</th>
                      <th className="border px-4 py-2 text-left">Busto (cm)</th>
                      <th className="border px-4 py-2 text-left">Cintura (cm)</th>
                      <th className="border px-4 py-2 text-left">Largo (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">S</td>
                      <td className="border px-4 py-2">88-92</td>
                      <td className="border px-4 py-2">68-72</td>
                      <td className="border px-4 py-2">85</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">M</td>
                      <td className="border px-4 py-2">92-96</td>
                      <td className="border px-4 py-2">72-76</td>
                      <td className="border px-4 py-2">87</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">L</td>
                      <td className="border px-4 py-2">96-100</td>
                      <td className="border px-4 py-2">76-80</td>
                      <td className="border px-4 py-2">89</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">XL</td>
                      <td className="border px-4 py-2">100-104</td>
                      <td className="border px-4 py-2">80-84</td>
                      <td className="border px-4 py-2">91</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Cómo tomar tus medidas</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Busto</h3>
                  <p className="text-sm text-muted-foreground">
                    Mide alrededor de la parte más ancha de tu pecho, manteniendo la cinta métrica horizontal.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Cintura</h3>
                  <p className="text-sm text-muted-foreground">
                    Mide alrededor de la parte más estrecha de tu cintura, generalmente a la altura del ombligo.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Largo</h3>
                  <p className="text-sm text-muted-foreground">
                    Para sweaters: Mide desde el hombro hasta donde quieres que llegue el sweater.
                    <br />
                    Para tapados: Mide desde el hombro hasta donde quieres que llegue el tapado.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Nota importante</h3>
              <p className="text-sm text-muted-foreground">
                Estas medidas son aproximadas y pueden variar ligeramente entre diferentes estilos. Si estás entre dos
                talles, te recomendamos elegir el talle más grande para mayor comodidad.
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
