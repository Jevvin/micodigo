
"use client"

import { Order, OrderStatus } from "@/types/pdv"
import OrderCard from "./OrderCard"

interface OrdersGridProps {
  newOrders: Order[]
  preparingOrders: Order[]
  readyOrders: Order[]
  deliveryOrders: Order[]
  deliveredOrders: Order[]
  onOrderClick: (order: Order) => void
  onRejectOrder: (order: Order) => void
  onChangeStatus: (orderId: string, newStatus: OrderStatus) => void
  onMarkDeliveryAsDelivered: (orderId: string) => void
}

export default function OrdersGrid({
  newOrders,
  preparingOrders,
  readyOrders,
  deliveryOrders,
  deliveredOrders,
  onOrderClick,
  onRejectOrder,
  onChangeStatus,
  onMarkDeliveryAsDelivered,
}: OrdersGridProps) {
  return (
    <div className="space-y-6">
      {/* New Orders */}
      <div>
        <h3 className="text-lg font-semibold text-red-600">Pedidos Nuevos ({newOrders.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newOrders.map((order: Order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => onOrderClick(order)}
              onReject={() => onRejectOrder(order)}
              onChangeStatus={onChangeStatus}
              onMarkDeliveryAsDelivered={onMarkDeliveryAsDelivered}
            />
          ))}
        </div>
      </div>

      {/* Preparing Orders */}
      <div>
        <h3 className="text-lg font-semibold text-yellow-600">En Preparación ({preparingOrders.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {preparingOrders.map((order: Order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => onOrderClick(order)}
              onChangeStatus={onChangeStatus}
              onMarkDeliveryAsDelivered={onMarkDeliveryAsDelivered}
            />
          ))}
        </div>
      </div>

      {/* Ready Orders */}
      <div>
        <h3 className="text-lg font-semibold text-green-600">Listos ({readyOrders.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {readyOrders.map((order: Order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => onOrderClick(order)}
              onChangeStatus={onChangeStatus}
              onMarkDeliveryAsDelivered={onMarkDeliveryAsDelivered}
            />
          ))}
        </div>
      </div>

      {/* Delivery Orders */}
      <div>
        <h3 className="text-lg font-semibold text-blue-600">En Camino ({deliveryOrders.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveryOrders.map((order: Order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => onOrderClick(order)}
              onMarkDeliveryAsDelivered={onMarkDeliveryAsDelivered}
            />
          ))}
        </div>
      </div>

      {/* Delivered Orders */}
      <div>
        <h3 className="text-lg font-semibold text-gray-600">Entregados ({deliveredOrders.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveredOrders.map((order: Order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => onOrderClick(order)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
