/**
 * store.ts
 * 
 * Tipos globales del negocio/restaurante público.
 * Usados para la página del restaurante y sus componentes.
 */

export interface Restaurant {
  id: number
  name: string
  description?: string
  slug: string
  address?: string
  phone?: string
  cover_image_url?: string
  logo_image_url?: string
  is_active: boolean

  restaurant_hours?: RestaurantHour[]
}

export interface RestaurantHour {
  id: number
  restaurant_id: number
  day_of_week: string
  is_open: boolean
  open_time?: string
  close_time?: string
}

export interface CheckoutData {
  customerName: string;
  phone: string;
  address?: string;
  deliveryType: "delivery" | "pickup";
}
