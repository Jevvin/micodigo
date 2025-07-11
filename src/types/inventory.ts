export type StockStatus = "good" | "low" | "critical";

export interface InventoryItem {
  id: number;
  restaurant_id: string;
  product_id?: number | null;
  product_name: string;
  quantity: number;
  minimum_quantity: number;
  maximum_quantity: number;
  unit: string;
  cost_per_unit: number;
  price: number;
  last_restocked: string;
  status: StockStatus;
  image?: string | null;
  is_available: boolean;  // ✅ obligatorio y boolean puro
}
