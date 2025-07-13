/**
 * deliveryEstimates.ts
 * 
 * Función utilitaria para calcular el rango estimado de entrega
 * basado en reglas simples (distancia, tipo de servicio, etc.)
 * 
 * Por ahora es estático o mock, pero se puede hacer dinámico en el futuro.
 */

export function getDeliveryEstimate(): string {
  // En producción, podrías calcular en base a distancia, tráfico, etc.
  // Aquí es un mock fijo
  return "25-35 min";
}

