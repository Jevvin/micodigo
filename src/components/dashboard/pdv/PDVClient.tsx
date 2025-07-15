"use client"

import { useState } from "react"
import LiveOrders from "./LiveOrders"
import OrderDetailsDialog from "./OrderDetailsDialog"
import { Order, OrderStatus } from "@/types/pdv"
import { supabase } from "@/app/utils/supabaseClient"

interface PDVClientProps {
  orders: Order[]
}

export default function PDVClient({ orders }: PDVClientProps) {
  // ✅ Estado local con todos los pedidos cargados
  const [allOrders, setAllOrders] = useState<Order[]>(orders)

  // ✅ Estado del modal de detalles
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false)

  // ✅ Estado para modal de confirmación de rechazo
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState<boolean>(false)
  const [orderToReject, setOrderToReject] = useState<Order | null>(null)

  console.log("🟢 Pedidos recibidos en PDVClient:", orders)
  console.log("🟡 Todos los pedidos en estado local:", allOrders)

  // ✅ Filtrar por estatus
  const newOrders = allOrders.filter((o) => o.status === "new")
  const preparingOrders = allOrders.filter((o) => o.status === "preparing")
  const readyOrders = allOrders.filter((o) => o.status === "ready")
  const deliveryOrders = allOrders.filter((o) => o.status === "out_for_delivery")
  const deliveredOrders = allOrders.filter((o) => o.status === "delivered")

  // ✅ Abrir el modal de detalles
  function handleOrderClick(order: Order) {
    setSelectedOrder(order)
    setIsDetailsDialogOpen(true)
  }

  // ✅ Cerrar el modal de detalles
  function handleCloseDetailsDialog() {
    setIsDetailsDialogOpen(false)
    setSelectedOrder(null)
  }

  // ✅ Abrir el modal de confirmación de rechazo
  function handleOpenRejectDialog(order: Order) {
    setOrderToReject(order)
    setIsRejectDialogOpen(true)
  }

  // ✅ Confirmar rechazo del pedido
  async function handleConfirmReject() {
    if (orderToReject) {
      await updateOrderStatus(orderToReject.id, "rejected")
      setIsRejectDialogOpen(false)
      setOrderToReject(null)
    }
  }

  // ✅ Cancelar rechazo
  function handleCancelReject() {
    setIsRejectDialogOpen(false)
    setOrderToReject(null)
  }

  // ✅ Actualizar el estado del pedido en Supabase
  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId)
        .select()
        .single()

      if (error) {
        console.error("❌ Error al actualizar estado en Supabase:", error)
        return
      }

      // ✅ Actualizar el estado local
      setAllOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
    } catch (err) {
      console.error("❌ Error general al actualizar:", err)
    }
  }

  // ✅ Handlers específicos para cada acción
  async function handleChangeStatus(orderId: string, newStatus: string) {
    await updateOrderStatus(orderId, newStatus as OrderStatus)
  }

  async function handleRejectOrder(order: Order) {
    handleOpenRejectDialog(order)
  }

  async function handleMarkDeliveryAsDelivered(orderId: string) {
    await updateOrderStatus(orderId, "delivered")
  }

  return (
    <div className="space-y-6">
      {/* ✅ Renderizar la lista de órdenes en vivo */}
      <LiveOrders
        newOrders={newOrders}
        preparingOrders={preparingOrders}
        readyOrders={readyOrders}
        deliveryOrders={deliveryOrders}
        deliveredOrders={deliveredOrders}
        selectedOrder={selectedOrder}
        isDetailsDialogOpen={isDetailsDialogOpen}
        isRejectDialogOpen={isRejectDialogOpen}
        onOrderClick={handleOrderClick}
        onCloseDetailsDialog={handleCloseDetailsDialog}
        onRejectOrder={handleRejectOrder}
        onConfirmReject={handleConfirmReject}
        onCancelReject={handleCancelReject}
        onChangeStatus={handleChangeStatus}
        onMarkDeliveryAsDelivered={handleMarkDeliveryAsDelivered}
      />

      {/* ✅ Modal para ver los detalles de cualquier pedido */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={isDetailsDialogOpen}
        onClose={handleCloseDetailsDialog}
      />
    </div>
  )
}
