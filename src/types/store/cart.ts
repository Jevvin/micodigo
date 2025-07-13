/**
 * cart.ts
 * 
 * Tipos relacionados al carrito de compras del cliente en la tienda pública.
 */

export interface CartItemExtra {
  id: number
  name: string
  price: number
  quantity: number
  groupId?: number
}


export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  notes?: string
  extras: CartItemExtra[]
  image?: string
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod?: "cash" | "card"
  addressId?: number
}
