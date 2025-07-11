import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { InventoryItem } from "@/types/inventory";

type Supabase = any;
const supabase = createClientComponentClient<Supabase>();

// Obtener inventario de un restaurante
export async function getInventoryByRestaurant(restaurantId: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select(`
      id,
      restaurant_id,
      product_id,
      product_name,
      quantity,
      minimum_quantity,
      maximum_quantity,
      unit,
      cost_per_unit,
      price,
      last_restocked,
      status,
      image,
      is_available
    `)
    .eq("restaurant_id", restaurantId)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error al obtener inventario:", error);
    throw error;
  }

  return data as InventoryItem[];
}

// Insertar nuevo item
export async function insertInventoryItem(
  item: Omit<InventoryItem, "id">
): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from("inventory_items")
    .insert([{
      ...item,
      is_available: item.is_available ?? true
    }])
    .select()
    .single();

  if (error) {
    console.error("Error al insertar item:", error);
    throw error;
  }

  return data as InventoryItem;
}

// Actualizar item existente
export async function updateInventoryItem(
  id: number,
  updates: Partial<InventoryItem>
): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from("inventory_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar item:", error);
    throw error;
  }

  return data as InventoryItem;
}

// Borrar item
export async function deleteInventoryItem(id: number): Promise<boolean> {
  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al borrar item:", error);
    throw error;
  }

  return true;
}
