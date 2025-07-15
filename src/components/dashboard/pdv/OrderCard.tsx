"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Order, OrderStatus } from "@/types/pdv";

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  onReject?: () => void;
  onChangeStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onMarkDeliveryAsDelivered?: (orderId: string) => void;
}

export default function OrderCard({
  order,
  onClick,
  onChangeStatus,
  onReject,
  onMarkDeliveryAsDelivered,
}: OrderCardProps) {
  // ✅ Colores del badge por status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-red-500 animate-pulse";
      case "preparing":
        return "bg-yellow-500";
      case "ready":
        return "bg-green-500";
      case "out_for_delivery":
        return "bg-blue-500";
      case "delivered":
        return "bg-gray-600";
      default:
        return "bg-gray-500";
    }
  };

  // ✅ Color de fondo de la Card según status
  const getCardBg = (status: string) => {
    switch (status) {
      case "new":
        return "bg-red-50";
      case "preparing":
        return "bg-yellow-50";
      case "ready":
        return "bg-green-50";
      case "out_for_delivery":
        return "bg-blue-50";
      case "delivered":
        return "bg-gray-100";
      default:
        return "bg-white";
    }
  };

  // ✅ Calcular minutos desde la creación del pedido
  const getMinutesAgo = (timeString?: string) => {
    if (!timeString) return "";
    const orderDate = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    return `Hace ${diffMin} min`;
  };

  // ✅ Texto del badge por status
  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return "NUEVO";
      case "preparing":
        return "Preparando";
      case "ready":
        return "Listo";
      case "out_for_delivery":
        return "En Camino";
      case "delivered":
        return "Entregado";
      default:
        return status;
    }
  };

  // ✅ Etiqueta del tipo de entrega
  const getDeliveryTypeLabel = (type: string) => {
    return type === "pickup" ? "Recoger" : "A domicilio";
  };

  // ✅ Texto del botón de acción según status
  const getActionButtonText = () => {
    switch (order.status) {
      case "new":
        return "Aceptar";
      case "preparing":
        return "Marcar Listo";
      case "ready":
        return order.delivery_type === "pickup" ? "Pedido Entregado" : "Pedido A Domicilio";
      case "out_for_delivery":
        return "Pedido Entregado";
      default:
        return "";
    }
  };

  // ✅ Handler de cambio de status
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChangeStatus) {
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
    }
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all ${getCardBg(order.status)}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">ORDEN-{order.id}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
            <Badge variant="outline" className="text-xs">
              {getDeliveryTypeLabel(order.delivery_type)}
            </Badge>
          </div>
        </div>

        {/* ✅ Datos del cliente */}
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

      <CardContent className="space-y-4">
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

        {(onChangeStatus || onReject) && (
          <div className="flex justify-between items-center mt-2">
            {order.status === "new" ? (
              <span className="text-sm text-gray-500">{getMinutesAgo(order.order_time)}</span>
            ) : (
              <span></span>
            )}

            <div className="flex space-x-2">
              {onReject && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject();
                  }}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Rechazar
                </Button>
              )}
              {onChangeStatus && (
                <Button
                  onClick={handleActionClick}
                  size="sm"
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {getActionButtonText()}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
