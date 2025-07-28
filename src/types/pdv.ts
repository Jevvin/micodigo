export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "rejected";

export interface OrderItemExtra {
  extra_id: string;
  extra_name: string;
  quantity: number;
  unit_price: number;
  price: number;
  extra_group_sort_order: number;
  extra_sort_order: number;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  extras?: OrderItemExtra[];

  // Añadidos para integración con los RPC
  id: number; // ID del producto o extra
  is_extra: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
}

export interface CustomerAddress {
  id: string;
  street: string;
  label?: string;
  city: string;
  state: string;
  postal_code?: string;
  notes?: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  status: OrderStatus;
  delivery_type: "pickup" | "delivery";
  payment_method: "cash" | "card";
  total_amount: number;
  special_instructions?: string;
  order_time?: string;

  customer?: Customer;
  customer_address?: CustomerAddress;

  items: OrderItem[];
}
