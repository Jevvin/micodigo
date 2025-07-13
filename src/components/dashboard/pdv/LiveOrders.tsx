"use client"

import  OrdersGrid  from "./OrdersGrid"
import  OrderDetailsDialog  from "./OrderDetailsDialog"
import  RejectOrderDialog  from "./RejectOrderDialog"
import { Order, OrderStatus } from "@/types/pdv"

export interface LiveOrdersProps {
  newOrders: Order[];
  preparingOrders: Order[];
  readyOrders: Order[];
  deliveryOrders: Order[];
  deliveredOrders: Order[];
  selectedOrder: Order | null;
  isDetailsDialogOpen: boolean;
  isRejectDialogOpen: boolean;
  onOrderClick: (order: Order) => void;
  onCloseDetailsDialog: () => void;
  onRejectOrder: (order: Order) => void;
  onConfirmReject: () => void;
  onCancelReject: () => void;
  onChangeStatus: (orderId: string, newStatus: OrderStatus) => void;
  onMarkDeliveryAsDelivered: (orderId: string) => void;
}

export default function LiveOrders({
  newOrders,
  preparingOrders,
  readyOrders,
  deliveryOrders,
  deliveredOrders,
  selectedOrder,
  isDetailsDialogOpen,
  isRejectDialogOpen,
  onOrderClick,
  onCloseDetailsDialog,
  onRejectOrder,
  onConfirmReject,
  onCancelReject,
  onChangeStatus,
  onMarkDeliveryAsDelivered,
}: LiveOrdersProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedidos en Vivo (PDV)</h2>
          <p className="text-gray-600">
            Pantalla de cocina - Haz clic en cualquier pedido para ver detalles completos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Notificaciones automáticas activadas</span>
        </div>
      </div>

      <OrdersGrid
        newOrders={newOrders}
        preparingOrders={preparingOrders}
        readyOrders={readyOrders}
        deliveryOrders={deliveryOrders}
        deliveredOrders={deliveredOrders}
        onOrderClick={onOrderClick}
        onRejectOrder={onRejectOrder}
        onChangeStatus={onChangeStatus}
        onMarkDeliveryAsDelivered={onMarkDeliveryAsDelivered}
      />

      <RejectOrderDialog
        order={selectedOrder}
        open={isRejectDialogOpen}
        onConfirm={onConfirmReject}
        onCancel={onCancelReject}
      />

      <OrderDetailsDialog
        order={selectedOrder}
        open={isDetailsDialogOpen}
        onClose={onCloseDetailsDialog}
      />
    </div>
  )
}
