"use client";

import { useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { Order, OrderStatus } from "@/types/pdv";

export default function useManageOrders(restaurantId: number | null | undefined) {
  const [loading, setLoading] = useState(false);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
    } catch (err) {
      console.error("❌ Error al actualizar estado:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const transformItemsToReserveFormat = (order: Order) => {
    const result: {
      id: number;
      quantity: number;
      is_extra: boolean;
    }[] = [];

    for (const item of order.items) {
      result.push({
        id: parseInt(item.product_id),
        quantity: item.quantity,
        is_extra: false,
      });

      if (item.extras && item.extras.length > 0) {
        for (const extra of item.extras) {
          result.push({
            id: parseInt(extra.extra_id),
            quantity: extra.quantity,
            is_extra: true,
          });
        }
      }
    }

    return result;
  };

  const approveOrderStock = async (order: Order) => {
    if (!restaurantId || typeof restaurantId !== "number") {
      console.error("❌ Restaurant ID inválido:", restaurantId);
      throw new Error("Restaurant ID es obligatorio y debe ser un número");
    }

    const items = transformItemsToReserveFormat(order);

    setLoading(true);
    try {
      const { error } = await supabase.rpc("approve_order_stock", {
        p_restaurant_id: restaurantId,
        items,
      });

      if (error) {
        console.error("❌ Error RPC approve_order_stock:", error);
        throw error;
      }

      console.log("✅ Stock descontado con éxito");
    } catch (err) {
      console.error("❌ Error al aprobar stock:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrderStock = async (order: Order) => {
    if (!restaurantId || typeof restaurantId !== "number") {
      console.error("❌ Restaurant ID inválido:", restaurantId);
      throw new Error("Restaurant ID es obligatorio y debe ser un número");
    }

    const items = transformItemsToReserveFormat(order);

    setLoading(true);
    try {
      const { error } = await supabase.rpc("cancel_order_stock", {
        p_restaurant_id: restaurantId,
        items,
      });

      if (error) {
        console.error("❌ Error RPC cancel_order_stock:", error);
        throw error;
      }

      console.log("✅ Reserva cancelada con éxito");
    } catch (err) {
      console.error("❌ Error al cancelar stock:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateOrderStatus,
    approveOrderStock,
    cancelOrderStock,
  };
}
