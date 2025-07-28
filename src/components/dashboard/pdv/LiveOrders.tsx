"use client"

import { useState } from "react"
import OrdersGrid from "./OrdersGrid"
import OrderDetailsDialog from "./OrderDetailsDialog"
import RejectOrderDialog from "./RejectOrderDialog"
import { Order, OrderStatus } from "@/types/pdv"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  onApproveOrder: (order: Order) => void;
  loading: boolean;
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
  onApproveOrder,
  loading,
}: LiveOrdersProps) {
  const [isColumnLayout, setIsColumnLayout] = useState(true);

  const handleToggleLayout = () => setIsColumnLayout(!isColumnLayout);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedidos en Vivo (PDV)</h2>
          <p className="text-gray-600">
            Pantalla de cocina - Haz clic en cualquier pedido para ver detalles completos
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {loading && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Cargando...</span>
            </div>
          )}

          {/* Botón de cambio de vista */}
          <Button variant="outline" size="sm" onClick={handleToggleLayout}>
            Cambiar a vista {isColumnLayout ? "de filas" : "de columnas"}
          </Button>
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
        onApproveOrder={onApproveOrder}
        onChangeStatus={onChangeStatus}
        onMarkDeliveryAsDelivered={onMarkDeliveryAsDelivered}
        isColumnLayout={isColumnLayout}
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
