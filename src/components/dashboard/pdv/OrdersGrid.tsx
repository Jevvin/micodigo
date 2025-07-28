"use client";

import { useState, useEffect, useRef } from "react";
import { Order, OrderStatus } from "@/types/pdv";
import OrderCard from "./OrderCard";

interface OrdersGridProps {
  newOrders: Order[];
  preparingOrders: Order[];
  readyOrders: Order[];
  deliveryOrders: Order[];
  deliveredOrders: Order[];
  onOrderClick: (order: Order) => void;
  onRejectOrder: (order: Order) => void;
  onApproveOrder: (order: Order) => void | Promise<void>;
  onChangeStatus: (orderId: string, newStatus: OrderStatus) => void;
  onMarkDeliveryAsDelivered: (orderId: string) => void;
  isColumnLayout: boolean;
}

export default function OrdersGrid({
  newOrders,
  preparingOrders,
  readyOrders,
  deliveryOrders,
  deliveredOrders,
  onOrderClick,
  onRejectOrder,
  onApproveOrder,
  onChangeStatus,
  onMarkDeliveryAsDelivered,
  isColumnLayout,
}: OrdersGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [columnClass, setColumnClass] = useState("columns-1");

  useEffect(() => {
    const updateColumnClass = (width: number) => {
      setIsLargeScreen(width >= 1024);
      if (width >= 970) setColumnClass("columns-3");
      else if (width >= 625) setColumnClass("columns-2");
      else setColumnClass("columns-1");
    };

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        updateColumnClass(width);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-12" ref={containerRef}>
      {isLargeScreen && isColumnLayout ? (
        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          {/* NUEVOS */}
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              Pedidos Nuevos ({newOrders.length})
            </h3>
            <div className="space-y-4">
              {newOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => onOrderClick(order)}
                  onReject={() => onRejectOrder(order)}
                  onApprove={() => onApproveOrder(order)}
                  onChangeStatus={onChangeStatus}
                  onMarkDeliveryAsDelivered={onMarkDeliveryAsDelivered}
                />
              ))}
            </div>
          </div>

          {/* EN PREPARACIÓN */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-600 mb-4">
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

          {/* LISTOS */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-4">
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
        <div className="space-y-12">
          {/* NUEVOS */}
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              Pedidos Nuevos ({newOrders.length})
            </h3>
            <div className={`${columnClass} gap-4 space-y-4 transition-all duration-300 ease-in-out`}>
              {newOrders.map((order) => (
                <div key={order.id} className="break-inside-avoid">
                  <OrderCard
                    order={order}
                    onClick={() => onOrderClick(order)}
                    onReject={() => onRejectOrder(order)}
                    onApprove={() => onApproveOrder(order)}
                    onChangeStatus={onChangeStatus}
                    onMarkDeliveryAsDelivered={onMarkDeliveryAsDelivered}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* EN PREPARACIÓN */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-600 mb-4">
              En Preparación ({preparingOrders.length})
            </h3>
            <div className={`${columnClass} gap-4 space-y-4 transition-all duration-300 ease-in-out`}>
              {preparingOrders.map((order) => (
                <div key={order.id} className="break-inside-avoid">
                  <OrderCard
                    order={order}
                    onClick={() => onOrderClick(order)}
                    onChangeStatus={onChangeStatus}
                    onMarkDeliveryAsDelivered={onMarkDeliveryAsDelivered}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* LISTOS */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-4">
              Listos ({readyOrders.length})
            </h3>
            <div className={`${columnClass} gap-4 space-y-4 transition-all duration-300 ease-in-out`}>
              {readyOrders.map((order) => (
                <div key={order.id} className="break-inside-avoid">
                  <OrderCard
                    order={order}
                    onClick={() => onOrderClick(order)}
                    onChangeStatus={onChangeStatus}
                    onMarkDeliveryAsDelivered={onMarkDeliveryAsDelivered}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EN CAMINO */}
      <div>
        <h3 className="text-lg font-semibold text-blue-600 mb-4">
          En Camino ({deliveryOrders.length})
        </h3>
        <div className={`${columnClass} gap-4 space-y-4 transition-all duration-300 ease-in-out`}>
          {deliveryOrders.map((order) => (
            <div key={order.id} className="break-inside-avoid">
              <OrderCard
                order={order}
                onClick={() => onOrderClick(order)}
                onMarkDeliveryAsDelivered={onMarkDeliveryAsDelivered}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ENTREGADOS */}
      <div>
        <h3 className="text-lg font-semibold text-gray-600 mb-4">
          Entregados ({deliveredOrders.length})
        </h3>
        <div className={`${columnClass} gap-4 space-y-4 transition-all duration-300 ease-in-out`}>
          {deliveredOrders.map((order) => (
            <div key={order.id} className="break-inside-avoid">
              <OrderCard order={order} onClick={() => onOrderClick(order)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
