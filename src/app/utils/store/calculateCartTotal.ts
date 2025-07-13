/**
 * calculateCartTotal.ts
 * 
 * Función que calcula el total del carrito sumando:
 * - Precio base de cada producto
 * - Extras (si existen)
 * - Cantidad
 * 
 * Retorna:
 * - subtotal
 * - total (con delivery si se le pasa)
 */

import { CartItem } from "@/types/store/cart";

export function calculateCartTotal(
  cartItems: CartItem[],
  deliveryFee: number = 0
) {
  const subtotal = cartItems.reduce((sum, item) => {
    const extrasTotal = item.extras?.reduce((eSum, extra) => eSum + extra.price, 0) ?? 0;
    const itemTotal = (item.price + extrasTotal) * item.quantity;
    return sum + itemTotal;
  }, 0);

  const total = subtotal + deliveryFee;

  return {
    subtotal,
    total,
  };
}
