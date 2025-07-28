/**
 * cart.ts
 * 
 * Tipos relacionados al carrito de compras del cliente en la tienda pública.
 */

export interface CartItemExtra {
  id: number;                     // ID del extra
  name: string;                  // Nombre del extra
  price: number;                 // Precio unitario del extra
  quantity: number;             // Cantidad seleccionada de ese extra
  groupId: number;              // ID del grupo al que pertenece
  extra_group_name: string;     // Nombre del grupo de extras
  extra_group_sort_order: number; // Orden del grupo
  extra_sort_order: number;     // Orden dentro del grupo
}

export interface CartItem {
  productId: number;            // ID del producto
  name: string;                 // Nombre del producto
  price: number;                // Precio base del producto
  quantity: number;            // Cantidad del producto
  notes?: string;              // Notas opcionales del cliente
  extras: CartItemExtra[];     // Lista de extras seleccionados
  image?: string;              // Imagen del producto
}

export interface Cart {
  items: CartItem[];            // Todos los productos en el carrito
  subtotal: number;             // Total sin incluir envío
  deliveryFee: number;          // Costo de envío
  total: number;                // Total final (subtotal + envío)
  paymentMethod?: "cash" | "card"; // Método de pago seleccionado
  addressId?: number;           // ID de la dirección seleccionada
}
