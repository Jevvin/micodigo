"use server"

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Order, OrderStatus, OrderItem, OrderItemExtra } from "@/types/pdv";

type Supabase = any;

export async function getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
  const supabase = createServerComponentClient<Supabase>({ cookies });

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers (*),
      customer_address:customer_addresses (*),
      order_items_order_id_fkey (
        *,
        order_item_extras (*)
      )
    `)
    .eq("restaurant_id", restaurantId)
    .order("order_time", { ascending: false });

  if (error) {
    console.error("❌ Error al obtener pedidos:", error);
    throw error;
  }

  const mapped: Order[] = (data || []).map((order: any): Order => ({
    id: String(order.id),
    restaurant_id: String(order.restaurant_id),
    customer: order.customer
      ? {
          id: String(order.customer.id),
          name: order.customer.name ?? "",
          email: order.customer.email ?? "",
          phone_number: order.customer.phone_number ?? "",
        }
      : undefined,
    customer_address: order.customer_address
      ? {
          id: String(order.customer_address.id),
          street: order.customer_address.street ?? "",
          label: order.customer_address.label ?? "",
          city: order.customer_address.city ?? "",
          state: order.customer_address.state ?? "",
          postal_code: order.customer_address.postal_code ?? "",
          notes: order.customer_address.notes ?? "",
        }
      : undefined,
    status: (order.status as string)?.toLowerCase() as OrderStatus,
    delivery_type: order.delivery_type ?? "delivery",
    payment_method: order.payment_method ?? "cash",
    total_amount: order.total_amount ?? 0,
    special_instructions: order.special_instructions ?? "",
    order_time: order.order_time ?? "",
    items: (order.order_items_order_id_fkey ?? []).map((item: any): OrderItem => ({
      product_id: String(item.product_id ?? ""),
      product_name: item.product_name ?? "",
      quantity: item.quantity ?? 1,
      unit_price: item.unit_price ?? 0,
      notes: item.notes ?? "",
      extras: (item.order_item_extras ?? []).map((ex: any): OrderItemExtra => ({
        extra_id: String(ex.extra_id ?? ""),
        extra_name: ex.extra_name ?? "",
        quantity: ex.quantity ?? 1,
        unit_price: ex.unit_price ?? 0,
        price: ex.price ?? 0,
      })),
    })),
  }));

  return mapped;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
  const supabase = createServerComponentClient<Supabase>({ cookies });

  const { data, error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId)
    .select(`
      *,
      customer:customers (*),
      customer_address:customer_addresses (*),
      order_items_order_id_fkey (
        *,
        order_item_extras (*)
      )
    `)
    .single();

  if (error) {
    console.error("❌ Error al actualizar pedido:", error);
    throw error;
  }

  const mapped: Order = {
    id: String(data.id),
    restaurant_id: String(data.restaurant_id),
    customer: data.customer
      ? {
          id: String(data.customer.id),
          name: data.customer.name ?? "",
          email: data.customer.email ?? "",
          phone_number: data.customer.phone_number ?? "",
        }
      : undefined,
    customer_address: data.customer_address
      ? {
          id: String(data.customer_address.id),
          street: data.customer_address.street ?? "",
          label: data.customer_address.label ?? "",
          city: data.customer_address.city ?? "",
          state: data.customer_address.state ?? "",
          postal_code: data.customer_address.postal_code ?? "",
          notes: data.customer_address.notes ?? "",
        }
      : undefined,
    status: (data.status as string)?.toLowerCase() as OrderStatus,
    delivery_type: data.delivery_type ?? "delivery",
    payment_method: data.payment_method ?? "cash",
    total_amount: data.total_amount ?? 0,
    special_instructions: data.special_instructions ?? "",
    order_time: data.order_time ?? "",
    items: (data.order_items_order_id_fkey ?? []).map((item: any): OrderItem => ({
      product_id: String(item.product_id ?? ""),
      product_name: item.product_name ?? "",
      quantity: item.quantity ?? 1,
      unit_price: item.unit_price ?? 0,
      notes: item.notes ?? "",
      extras: (item.order_item_extras ?? []).map((ex: any): OrderItemExtra => ({
        extra_id: String(ex.extra_id ?? ""),
        extra_name: ex.extra_name ?? "",
        quantity: ex.quantity ?? 1,
        unit_price: ex.unit_price ?? 0,
        price: ex.price ?? 0,
      })),
    })),
  };

  return mapped;
}
