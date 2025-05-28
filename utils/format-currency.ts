// Función para formatear moneda en pesos argentinos
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Función alternativa más simple
export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString('es-AR')}`
}
