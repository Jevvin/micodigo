"use client"

import { useState } from "react"
import { Order, OrderStatus } from "@/types/pdv"
import OrderCard from "./OrderCard"
import { Button } from "@/components/ui/button"

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
  const [isColumnLayout, setIsColumnLayout] = useState(true)

  const toggleLayout = () => setIsColumnLayout(!isColumnLayout)

  return (
    <div className="space-y-8">
      {/* Toggle button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={toggleLayout}>
          Cambiar a vista {isColumnLayout ? "de filas" : "de columnas"}
        </Button>
      </div>

      {/* ✅ Section for NUEVOS + PREPARACIÓN + LISTOS */}
      {isColumnLayout ? (
        // 🌟 COLUMNAS (horizontal) estilo Vercel
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* New Orders */}
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Pedidos Nuevos ({newOrders.length})
            </h3>
            <div className="space-y-4">
              {newOrders.map((order) => (
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
            <h3 className="text-lg font-semibold text-yellow-600 mb-2">
              En Preparación ({preparingOrders.length})
            </h3>
            <div className="space-y-4">
              {preparingOrders.map((order) => (
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
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Listos ({readyOrders.length})
            </h3>
            <div className="space-y-4">
              {readyOrders.map((order) => (
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
        </div>
      ) : (
        // 🌟 FILAS (vertical)
        <div className="space-y-8">
          {/* New Orders */}
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Pedidos Nuevos ({newOrders.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {newOrders.map((order) => (
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
            <h3 className="text-lg font-semibold text-yellow-600 mb-2">
              En Preparación ({preparingOrders.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {preparingOrders.map((order) => (
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
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Listos ({readyOrders.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {readyOrders.map((order) => (
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
        </div>
      )}

      {/* ✅ En Camino y Entregados (SIN CAMBIOS) */}
      <div>
        <h3 className="text-lg font-semibold text-blue-600 mb-2">
          En Camino ({deliveryOrders.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveryOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => onOrderClick(order)}
              onMarkDeliveryAsDelivered={onMarkDeliveryAsDelivered}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Entregados ({deliveredOrders.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveredOrders.map((order) => (
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
