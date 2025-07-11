/* 
✅ Este código es para el componente InventoryPanel del dashboard.
Se encarga de:
- Obtener el restaurantId del usuario logueado.
- Sincronizar la tabla inventory_items con menu_products (insertar faltantes).
- Cargar todos los items del inventario desde Supabase.
- Calcular estado de stock (good, low, critical).
- Crear, actualizar y recargar items tras cambios.
- Renderizar las alertas, estadísticas, lista de productos y el modal de agregar/editar.

Es el CONTENEDOR PRINCIPAL de toda la vista de Inventario en el dashboard.
*/


"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import InventoryAlerts from "./InventoryAlerts";
import InventoryStats from "./InventoryStats";
import InventoryList from "./InventoryList";
import InventoryDialog from "./InventoryDialog";
import { InventoryItem, StockStatus } from "@/types/inventory";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function InventoryPanel() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const supabase = createClientComponentClient();

  // Obtener restaurantId
  useEffect(() => {
    const loadRestaurantId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("restaurants")
        .select("id")
        .eq("user_id", user.id)
        .single();
      setRestaurantId(data?.id ?? null);
    };
    loadRestaurantId();
  }, [supabase]);

  // Cargar inventario sin JOIN
  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);

    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("restaurant_id", restaurantId);

      if (error) {
        console.error("Error loading inventory:", error);
        toast({ title: "Error", description: "No se pudo cargar el inventario." });
        setLoading(false);
        return;
      }

      setItems(data ?? []);
      setLoading(false);
    };

    fetchInventory();
  }, [restaurantId, supabase, toast]);

  // Calcular estado
  const getStockStatus = (item: InventoryItem): StockStatus => {
    if (item.quantity <= item.minimum_quantity * 0.5) return "critical";
    if (item.quantity <= item.minimum_quantity) return "low";
    return "good";
  };

  // Guardar (crear o actualizar)
  const handleSaveItem = async (item: InventoryItem) => {
    if (!restaurantId) return;

    const newStatus: StockStatus = getStockStatus(item);
    const finalItem: InventoryItem = {
      ...item,
      status: newStatus,
      restaurant_id: restaurantId,
    };

    console.log("Guardando item:", finalItem);

    if (!finalItem.id) {
      const { error } = await supabase.from("inventory_items").insert(finalItem);
      if (error) {
        console.error("Error al insertar:", error);
        toast({ title: "Error", description: error.message });
        return;
      }
      toast({ title: "Producto agregado", description: "Se ha guardado en el inventario." });
    } else {
      const { error } = await supabase
        .from("inventory_items")
        .update(finalItem)
        .eq("id", finalItem.id);
      if (error) {
        console.error("Error al actualizar:", error);
        toast({ title: "Error", description: error.message });
        return;
      }
      toast({ title: "Producto actualizado", description: "Cambios guardados correctamente." });
    }

    // Recargar inventario sin JOIN
    const { data } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("restaurant_id", restaurantId);

    setItems(data ?? []);
    setEditingItem(null);
    setIsAdding(false);
  };

  const criticalItems = items.filter((i) => i.status === "critical");
  const lowItems = items.filter((i) => i.status === "low");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Control de Inventario</h2>
          <p className="text-gray-600">Solo se notifican productos con stock bajo o crítico</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-600">
          <Loader2 className="animate-spin h-6 w-6 mr-2" />
          Cargando inventario...
        </div>
      ) : (
        <>
          <InventoryAlerts
            criticalItems={criticalItems.map((item) => ({
              id: String(item.id),
              productName: item.product_name,
            }))}
          />

          <InventoryStats
            totalProducts={items.length}
            criticalCount={criticalItems.length}
            lowStockCount={lowItems.length}
            totalValue={items.reduce((sum, i) => sum + i.quantity * i.cost_per_unit, 0)}
          />

          <InventoryList
            inventory={items}
            highlightedProductId={highlightedId !== null ? String(highlightedId) : null}
            onEdit={(item) => setEditingItem(item)}
          />

          <InventoryDialog
            open={isAdding || !!editingItem}
            onClose={() => {
              setIsAdding(false);
              setEditingItem(null);
            }}
            item={editingItem ?? undefined}
            onSave={handleSaveItem}
          />
        </>
      )}
    </div>
  );
}
