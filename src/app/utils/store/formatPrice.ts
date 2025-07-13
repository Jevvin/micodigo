/**
 * formatPrice.ts
 * 
 * Utilidad para formatear precios en formato MXN
 * (o cualquier otro formato que el negocio requiera)
 */

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0
  }).format(amount);
}
