"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Order, OrderStatus } from "@/types/pdv";

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  onReject?: () => void;
  onApprove?: () => void;
  onChangeStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onMarkDeliveryAsDelivered?: (orderId: string) => void;
}

function useMinutesAgo(timeString?: string) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!timeString) return;

    const orderDate = new Date(timeString);
    const interval = setInterval(() => {
      const now = new Date();
      const diffMs = now.getTime() - orderDate.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      setText(`Hace ${diffMin} min`);
    }, 60_000);

    const now = new Date();
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    setText(`Hace ${diffMin} min`);

    return () => clearInterval(interval);
  }, [timeString]);

  return text;
}

export default function OrderCard({
  order,
  onClick,
  onReject,
  onApprove,
  onChangeStatus,
  onMarkDeliveryAsDelivered,
}: OrderCardProps) {
  const minutesAgo = useMinutesAgo(order.order_time);

  const getCardBg = (status: string) => {
    switch (status) {
      case "new": return "bg-red-50";
      case "preparing": return "bg-yellow-50";
      case "ready": return "bg-green-50";
      case "out_for_delivery": return "bg-blue-50";
      case "delivered": return "bg-gray-100";
      default: return "bg-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "new": return "NUEVO";
      case "preparing": return "Preparando";
      case "ready": return "Listo";
      case "out_for_delivery": return "En Camino";
      case "delivered": return "Entregado";
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
  const base = "text-xs pointer-events-none select-none border";

  switch (status) {
    case "new":
      return `${base} text-white bg-red-600 border-red-600`;
    case "preparing":
      return `${base} text-amber-600 border-amber-600 bg-transparent`;
    case "ready":
      return `${base} text-green-600 border-green-600 bg-transparent`;
    case "out_for_delivery":
      return `${base} text-blue-600 border-blue-600 bg-transparent`;
    case "delivered":
      return `${base} text-gray-600 border-gray-600 bg-transparent`;
    default:
      return `${base} text-gray-500 border-gray-500 bg-transparent`;
  }
};

const getDeliveryBadgeClass = () => {
  return "text-black border border-black bg-transparent text-xs pointer-events-none select-none";
};



  const getActionButtonText = () => {
    switch (order.status) {
      case "new": return "ACEPTAR";
      case "preparing": return "PEDIDO LISTO";
      case "ready":
        return order.delivery_type === "pickup"
          ? "Pedido Entregado"
          : "PEDIDO EN CAMINO";
      case "out_for_delivery": return "Pedido Entregado";
      default: return "";
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onChangeStatus) return;

    if (order.status === "new") {
      onChangeStatus(order.id, "preparing");
    } else if (order.status === "preparing") {
      onChangeStatus(order.id, "ready");
    } else if (order.status === "ready") {
      if (order.delivery_type === "pickup") {
        onMarkDeliveryAsDelivered?.(order.id);
      } else {
        onChangeStatus(order.id, "out_for_delivery");
      }
    } else if (order.status === "out_for_delivery") {
      onMarkDeliveryAsDelivered?.(order.id);
    }
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all ${getCardBg(order.status)}`}
      onClick={onClick}
    >
      <CardHeader className="pt-4 pb-4 px-5">
  <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1">
    <CardTitle className="text-lg">#{order.id}</CardTitle>

    <div className="flex flex-wrap items-center gap-2">
      <Badge className={getStatusBadgeClass(order.status)}>
        {getStatusText(order.status)}
      </Badge>
      <Badge className={`${getDeliveryBadgeClass()} flex items-center gap-1`}>
        {order.delivery_type === "pickup" ? (
          <>
            <Icon icon="material-symbols-light:shopping-bag-outline-sharp" className="w-4 h-4" />
            Pick Up
          </>
        ) : (
          <>
            <Icon icon="ic:round-delivery-dining" className="w-4 h-4" />
            Delivery
          </>
        )}
      </Badge>
    </div>
  </div>

  <CardDescription className="mt-1 text-[15px] text-gray-500">
    <span className="font-semibold">{order.customer?.name || "Cliente"}</span>
    {order.customer?.phone_number && (
      <>
        {" • "}
        <span>
          {order.customer.phone_number.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")}
        </span>
      </>
    )}
  </CardDescription>
</CardHeader>


      <CardContent className="pb-5 px-5 space-y-4">
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-black">
                  {item.quantity}x {item.product_name}
                </span>
                {item.notes && (
                  <span className="text-sm italic text-red-600">({item.notes})</span>
                )}
              </div>
              {item.extras && item.extras.length > 0 && (
                <div className="ml-4 space-y-0.5">
                  {[...item.extras]
                    .sort((a, b) => {
                      if (a.extra_group_sort_order !== b.extra_group_sort_order) {
                        return a.extra_group_sort_order - b.extra_group_sort_order;
                      }
                      return a.extra_sort_order - b.extra_sort_order;
                    })
                    .map((extra, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        • {extra.quantity}x {extra.extra_name} {extra.unit_price > 0 ? `+$${extra.unit_price}` : ""}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-semibold">Total: ${order.total_amount}</span>
          <span className="text-sm text-gray-600">
            {order.payment_method === "cash" ? "Efectivo" : "Tarjeta"}
          </span>
        </div>

        <div className="flex justify-between items-center mt-2">
          {order.status === "new" && (
            <span className="text-sm text-gray-500">{minutesAgo}</span>
          )}

          <div className="flex flex-1 justify-end space-x-2">
            {order.status === "new" && onReject && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject();
                }}
                variant="outline"
                size="sm"
                className="border border-red-300 text-red-600 hover:bg-black hover:text-white hover:border-transparent"
              >
                RECHAZAR
              </Button>
            )}

            {order.status === "new" && onApprove && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove();
                }}
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700"
              >
                ACEPTAR
              </Button>
            )}

            {order.status === "preparing" && onChangeStatus && (
              <Button
                onClick={handleActionClick}
                size="sm"
                className="w-full bg-amber-600 text-white hover:bg-amber-700"
              >
                {getActionButtonText()}
              </Button>
            )}

            {order.status === "ready" && onChangeStatus && (
              <Button
                onClick={handleActionClick}
                size="sm"
                className="w-full bg-green-600 text-white hover:bg-green-700"
              >
                {getActionButtonText()}
              </Button>
            )}

            {order.status === "out_for_delivery" && onChangeStatus && (
              <Button
                onClick={handleActionClick}
                size="sm"
                className="bg-gray-700 text-white hover:bg-gray-800"
              >
                {getActionButtonText()}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
