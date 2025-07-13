"use client"

import { useState } from "react"
import LiveOrders from "./LiveOrders"
import { Order, OrderStatus } from "@/types/pdv"
import { supabase } from "@/app/utils/supabaseClient"

interface PDVClientProps {
  orders: Order[]
}

export default function PDVClient({ orders }: PDVClientProps) {
  const [allOrders, setAllOrders] = useState<Order[]>(orders)

  // ✅ Filtrar por estado
  const newOrders = allOrders.filter((o) => o.status === "new")
  const preparingOrders = allOrders.filter((o) => o.status === "preparing")
  const readyOrders = allOrders.filter((o) => o.status === "ready")
  const deliveryOrders = allOrders.filter((o) => o.status === "out_for_delivery")
  const deliveredOrders = allOrders.filter((o) => o.status === "delivered")

  // ✅ Actualizar estado del pedido en Supabase
  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId)
        .select()
        .single()

      if (error) {
        console.error("Error al actualizar estado:", error)
        return
      }

      // ✅ Actualizar state local
      setAllOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
    } catch (err) {
      console.error("Error general al actualizar:", err)
    }
  }

  // ✅ Handlers
  async function handleChangeStatus(orderId: string, newStatus: string) {
    await updateOrderStatus(orderId, newStatus as OrderStatus)
  }

  async function handleRejectOrder(order: Order) {
    await updateOrderStatus(order.id, "rejected")
  }

  async function handleMarkDeliveryAsDelivered(orderId: string) {
    await updateOrderStatus(orderId, "delivered")
  }

  return (
    <div className="space-y-6">
      <LiveOrders
        newOrders={newOrders}
        preparingOrders={preparingOrders}
        readyOrders={readyOrders}
        deliveryOrders={deliveryOrders}
        deliveredOrders={deliveredOrders}
        selectedOrder={null}
        isDetailsDialogOpen={false}
        isRejectDialogOpen={false}
        onOrderClick={() => {}}
        onCloseDetailsDialog={() => {}}
        onRejectOrder={handleRejectOrder}
        onConfirmReject={() => {}}
        onCancelReject={() => {}}
        onChangeStatus={handleChangeStatus}
        onMarkDeliveryAsDelivered={handleMarkDeliveryAsDelivered}
      />
    </div>
  )
}
