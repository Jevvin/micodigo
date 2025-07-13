"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Clock, MapPin, Phone, User } from "lucide-react"
import { Order } from "@/types/pdv"

interface OrderDetailsDialogProps {
  order: Order | null
  open: boolean
  onClose: () => void
}

export default function OrderDetailsDialog({ order, open, onClose }: OrderDetailsDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-red-500"
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {order && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Detalles del Pedido {order.id}</span>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Información del Cliente
                  </h3>
                  <div className="text-sm space-y-2">
                    <p><strong>Nombre:</strong> {order.customer}</p>
                    {order.phone && (
                      <p className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        <strong>Teléfono:</strong> {order.phone}
                      </p>
                    )}
                    {order.email && <p><strong>Email:</strong> {order.email}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Información de Entrega
                  </h3>
                  <div className="text-sm space-y-2">
                    <p><strong>Tipo:</strong> {getDeliveryTypeLabel(order.deliveryType)}</p>
                    {order.address && <p><strong>Dirección:</strong> {order.address}</p>}
                    {order.specialInstructions && (
                      <p><strong>Instrucciones:</strong> {order.specialInstructions}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h3 className="font-semibold">Productos del Pedido</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">Producto</th>
                        <th className="px-4 py-2 text-center text-sm font-medium">Cant.</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Precio</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.notes && <p className="text-sm text-gray-500 italic">Nota: {item.notes}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">${item.price}</td>
                          <td className="px-4 py-2 text-right font-medium">
                            ${item.price * item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Información de Pago
                  </h3>
                  <div className="text-sm">
                    <p>
                      <strong>Método:</strong> {order.paymentMethod === "cash" ? "Efectivo" : "Tarjeta"}
                    </p>
                    <p>
                      <strong>Total:</strong>{" "}
                      <span className="text-lg font-bold text-green-600">${order.total}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Tiempos
                  </h3>
                  <div className="text-sm">
                    {order.orderTime && (
                      <p><strong>Hora del pedido:</strong> {order.orderTime}</p>
                    )}
                    {order.departureTime && (
                      <p><strong>Salió en camino:</strong> {order.departureTime}</p>
                    )}
                    {order.deliveredAt && (
                      <p><strong>Hora de entrega:</strong> {order.deliveredAt}</p>
                    )}
                    {order.estimatedDelivery && order.status === "out_for_delivery" && (
                      <p><strong>Tiempo estimado:</strong> {order.estimatedDelivery}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
