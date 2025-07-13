"use server"

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Order, OrderStatus } from "@/types/pdv";

type Supabase = any;

// Obtener todos los pedidos de un restaurante
export async function getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
  const supabase = createServerComponentClient<Supabase>({ cookies });

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener pedidos:", error);
    throw error;
  }

  return data as Order[];
}

// Actualizar estado de un pedido
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
  const supabase = createServerComponentClient<Supabase>({ cookies });

  const { data, error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar pedido:", error);
    throw error;
  }

  return data as Order;
}
