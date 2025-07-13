/**
 * validateCheckout.ts
 * 
 * Validación sencilla para el flujo de checkout.
 * Puedes expandirla para reglas más complejas (campos requeridos, etc.).
 */

import { CheckoutData } from "@/types/store/store";

export function validateCheckout(data: CheckoutData): string[] {
  const errors: string[] = [];

  if (!data.customerName || data.customerName.trim() === "") {
    errors.push("El nombre del cliente es obligatorio.");
  }

  if (!data.phone || data.phone.trim() === "") {
    errors.push("El teléfono es obligatorio.");
  }

  if (data.deliveryType === "delivery" && (!data.address || data.address.trim() === "")) {
    errors.push("La dirección de entrega es obligatoria para pedidos a domicilio.");
  }

  return errors;
}
