"use client";

import { useEffect, useState } from "react";
import LiveOrders from "./LiveOrders";
import OrderDetailsDialog from "./OrderDetailsDialog";
import { Order, OrderStatus } from "@/types/pdv";
import useManageOrders from "@/hooks/dashboard/useManageOrder";
import { supabase } from "@/app/utils/supabaseClient";
import RejectOrderDialog from "./RejectOrderDialog"; // ✅ Asegúrate de importar el componente


interface PDVClientProps {
  orders: Order[];
}

export default function PDVClient({ orders }: PDVClientProps) {
  // ✅ Todos los hooks van al inicio
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState(true);

  const [allOrders, setAllOrders] = useState<Order[]>(orders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState<boolean>(false);
  const [orderToReject, setOrderToReject] = useState<Order | null>(null);

  const {
    updateOrderStatus,
    approveOrderStock,
    cancelOrderStock,
    loading,
  } = useManageOrders(restaurantId ?? -1); // 🛡️ Fallback para evitar errores en el hook

  // ✅ Obtener el restaurantId al montar
  useEffect(() => {
    const fetchRestaurantId = async () => {
      setLoadingId(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("❌ No se pudo obtener el usuario:", userError);
        setRestaurantId(null);
        setLoadingId(false);
        return;
      }

      const { data, error } = await supabase
        .from("restaurants")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        console.error("❌ No se pudo obtener el restaurantId:", error);
        setRestaurantId(null);
      } else {
        setRestaurantId(data.id);
      }

      setLoadingId(false);
    };

    fetchRestaurantId();
  }, []);

  // 🕐 Estado de carga de restaurantId
  if (loadingId) return <div className="text-center py-8">Cargando restaurante...</div>;

  // 🚫 Si no se pudo obtener restaurantId
  if (!restaurantId) {
    return <div className="text-center py-8 text-red-600">Error: No se pudo obtener el restaurante</div>;
  }

  // 🗂️ Clasificación de pedidos
  const newOrders = allOrders.filter((o) => o.status === "new");
  const preparingOrders = allOrders.filter((o) => o.status === "preparing");
  const readyOrders = allOrders.filter((o) => o.status === "ready");
  const deliveryOrders = allOrders.filter((o) => o.status === "out_for_delivery");
  const deliveredOrders = allOrders.filter((o) => o.status === "delivered");

  // 👉 Abrir detalles
  function handleOrderClick(order: Order) {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  }

  function handleCloseDetailsDialog() {
    setIsDetailsDialogOpen(false);
    setSelectedOrder(null);
  }

  function handleOpenRejectDialog(order: Order) {
    setOrderToReject(order);
    setIsRejectDialogOpen(true);
  }

  function handleCancelReject() {
    setIsRejectDialogOpen(false);
    setOrderToReject(null);
  }

  // ❌ Rechazar pedido
  async function handleConfirmReject() {
    if (orderToReject) {
      try {
        await updateOrderStatus(orderToReject.id, "rejected");
        await cancelOrderStock(orderToReject);
        setAllOrders((prev) =>
          prev.map((o) =>
            o.id === orderToReject.id ? { ...o, status: "rejected" } : o
          )
        );
      } catch (err) {
        console.error("❌ Error al rechazar pedido:", err);
      } finally {
        setIsRejectDialogOpen(false);
        setOrderToReject(null);
      }
    }
  }

  // ✅ Aprobar pedido y descontar stock
  async function handleApproveOrder(order: Order) {
    try {
      await approveOrderStock(order);
      await updateOrderStatus(order.id, "preparing");
      setAllOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: "preparing" } : o
        )
      );
    } catch (err) {
      console.error("❌ Error al aprobar pedido:", err);
    }
  }

  // 🔄 Cambiar estado manualmente
  async function handleChangeStatus(orderId: string, newStatus: string) {
    try {
      await updateOrderStatus(orderId, newStatus as OrderStatus);
      setAllOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus as OrderStatus } : o
        )
      );
    } catch (err) {
      console.error("❌ Error al cambiar estado:", err);
    }
  }

  async function handleMarkDeliveryAsDelivered(orderId: string) {
    await handleChangeStatus(orderId, "delivered");
  }

  return (
    <div className="space-y-6">
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
        onRejectOrder={handleOpenRejectDialog}
        onConfirmReject={handleConfirmReject}
        onCancelReject={handleCancelReject}
        onChangeStatus={handleChangeStatus}
        onMarkDeliveryAsDelivered={handleMarkDeliveryAsDelivered}
        onApproveOrder={handleApproveOrder}
        loading={loading}
      />

      <OrderDetailsDialog
        order={selectedOrder}
        open={isDetailsDialogOpen}
        onClose={handleCloseDetailsDialog}
      />

      <RejectOrderDialog
  order={orderToReject}
  open={isRejectDialogOpen}
  onConfirm={handleConfirmReject}
  onCancel={handleCancelReject}
/>
    </div>
  );
}
