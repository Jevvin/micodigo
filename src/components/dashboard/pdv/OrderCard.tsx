"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Order, OrderStatus } from "@/types/pdv"

interface OrderCardProps {
  order: Order
  onClick?: () => void
  onReject?: () => void
  onChangeStatus?: (orderId: string, newStatus: OrderStatus) => void
  onMarkDeliveryAsDelivered?: (orderId: string) => void
}

export default function OrderCard({
  order,
  onClick,
  onChangeStatus,
  onReject,
  onMarkDeliveryAsDelivered,
}: OrderCardProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-red-500 animate-pulse"
      case "preparing":
        return "bg-yellow-500"
      case "ready":
        return "bg-green-500"
      case "out_for_delivery":
        return "bg-blue-500"
      case "delivered":
        return "bg-gray-600"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return "NUEVO"
      case "preparing":
        return "Preparando"
      case "ready":
        return "Listo"
      case "out_for_delivery":
        return "En Camino"
      case "delivered":
        return "Entregado"
      default:
        return status
    }
  }

  const getDeliveryTypeLabel = (type: string) => {
    return type === "pickup" ? "Recoger" : "A domicilio"
  }

  const getActionButtonText = () => {
    switch (order.status) {
      case "new":
        return "Aceptar"
      case "preparing":
        return "Marcar Listo"
      case "ready":
        return order.deliveryType === "pickup" ? "Pedido Entregado" : "Pedido A Domicilio"
      case "out_for_delivery":
        return "Pedido Entregado"
      default:
        return ""
    }
  }

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onChangeStatus) {
      if (order.status === "new") {
        onChangeStatus(order.id, "preparing")
      } else if (order.status === "preparing") {
        onChangeStatus(order.id, "ready")
      } else if (order.status === "ready") {
        if (order.deliveryType === "pickup") {
          onMarkDeliveryAsDelivered?.(order.id)
        } else {
          onChangeStatus(order.id, "out_for_delivery")
        }
      } else if (order.status === "out_for_delivery") {
        onMarkDeliveryAsDelivered?.(order.id)
      }
    }
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{order.id}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
            <Badge variant="outline" className="text-xs">
              {getDeliveryTypeLabel(order.deliveryType)}
            </Badge>
          </div>
        </div>
        <CardDescription>
          <strong>{order.customer}</strong> {order.phone && `• ${order.phone}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>
                {item.quantity}x {item.name}
              </span>
              {item.notes && <span className="text-sm italic text-gray-500">({item.notes})</span>}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-semibold">Total: ${order.total}</span>
          <span className="text-sm text-gray-600">
            {order.paymentMethod === "cash" ? "Efectivo" : "Tarjeta"}
          </span>
        </div>

        {(onChangeStatus || onReject) && (
          <div className="flex space-x-2 mt-2">
            {onReject && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onReject()
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
        )}
      </CardContent>
    </Card>
  )
}
