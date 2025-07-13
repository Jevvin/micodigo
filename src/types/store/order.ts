/**
 * order.ts
 * 
 * Tipos para pedidos, items y extras del carrito.
 */

export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"

export interface Order {
  id: number
  restaurant_id: number
  customer_id?: number
  delivery_type: "pickup" | "delivery"
  address?: string
  special_instructions?: string
  status: OrderStatus
  payment_method: "cash" | "card"
  total: number
  created_at: string
  order_time?: string
  departure_time?: string
  delivered_at?: string
  estimated_delivery?: string

  items: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  notes?: string
  extras: OrderItemExtra[]
}

export interface OrderItemExtra {
  id: number
  order_item_id: number
  extra_id: number
  extra_name: string
  price: number
}

/**
 * CustomerInfo
 * 
 * Datos del cliente que se requieren en el pedido
 */
export interface CustomerInfo {
  name: string
  phone: string
  email?: string
  addressId?: number
  notes?: string
}

/**
 * OrderPayload
 * 
 * Forma completa del objeto para crear un pedido
 */
export interface OrderPayloadItem {
  productId: number
  productName: string
  quantity: number
  price: number
  notes?: string
  extras: {
    id: number
    quantity: number
    price: number
  }[]
}

export interface OrderPayload {
  restaurantId: number
  items: OrderPayloadItem[]
  customer: CustomerInfo
  paymentMethod: "cash" | "card"
  deliveryFee: number
  subtotal: number
  total: number
}
