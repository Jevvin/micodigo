export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "rejected"

export interface OrderItem {
  name: string
  quantity: number
  price: number
  notes?: string
}

export interface Order {
  id: string
  customer: string
  phone?: string
  email?: string
  address?: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  deliveryType: "pickup" | "delivery"
  paymentMethod: "cash" | "card"
  time?: string
  estimatedTime?: number
  departureTime?: string
  deliveredAt?: string
  orderTime?: string
  specialInstructions?: string
  estimatedDelivery?: string
}
