export interface RestaurantHours {
  id: string;
  day_of_week: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cover_image_url: string;
  logo_image_url: string;
  delivery_fee: number;
  min_order_amount: number;
  delivery_radius: number;
  accepts_delivery: boolean;
  accepts_pickup: boolean;
  accepting_orders: boolean;
  restaurant_hours: RestaurantHours[];
}
