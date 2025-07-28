"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Clock, MapPin, User, X } from "lucide-react";
import { Icon } from "@iconify/react";
import { Order } from "@/types/pdv";

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export default function OrderDetailsDialog({ order, open, onClose }: OrderDetailsDialogProps) {
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

  const getDeliveryTypeLabel = (type: string) => {
    return type === "pickup" ? "Recoger" : "A domicilio";
  };

  const formatOrderTime = (isoTime?: string) => {
    if (!isoTime) return "";
    const date = new Date(isoTime);
    const timePart = date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    const datePart = date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    return `${timePart} ${datePart}`;
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <DialogTitle className="text-lg sm:text-xl font-bold">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span>Detalles de la Orden {order.id}</span>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusBadgeClass(order.status)} px-2 py-1`}>
                    {getStatusText(order.status)}
                  </Badge>
                  <Badge className={`${getDeliveryBadgeClass()} flex items-center gap-1 px-2 py-1`}>
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
            </DialogTitle>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-6 px-2 sm:px-0">
          {/* Cliente y Entrega */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center sm:text-left">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center justify-center sm:justify-start">
                <User className="h-5 w-5 mr-2" />
                Información del Cliente
              </h3>
              <div className="text-sm space-y-2">
                <p><strong>Nombre:</strong> {order.customer?.name || "Cliente"}</p>
                {order.customer?.phone_number && <p><strong>Teléfono:</strong> {order.customer.phone_number}</p>}
                {order.customer?.email && <p><strong>Email:</strong> {order.customer.email}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center justify-center sm:justify-start">
                <MapPin className="h-5 w-5 mr-2" />
                Información de Entrega
              </h3>
              <div className="text-sm space-y-2">
                <p><strong>Tipo:</strong> {getDeliveryTypeLabel(order.delivery_type)}</p>
                {order.customer_address && (
                  <>
                    <p><strong>Dirección:</strong> {order.customer_address.street}, {order.customer_address.city}</p>
                    {order.customer_address.state && <p><strong>Estado:</strong> {order.customer_address.state}</p>}
                    {order.customer_address.postal_code && <p><strong>Código Postal:</strong> {order.customer_address.postal_code}</p>}
                    {order.customer_address.notes && <p><strong>Notas:</strong> {order.customer_address.notes}</p>}
                  </>
                )}
                {order.special_instructions && (
                  <p><strong>Instrucciones:</strong> {order.special_instructions}</p>
                )}
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-center sm:text-left">Productos de la Orden</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Producto</th>
                    <th className="px-4 py-2 text-center">Cant.</th>
                    <th className="px-4 py-2 text-right">Precio</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item, index) => (
                    <React.Fragment key={index}>
                      <tr className="align-top">
                        <td className="px-4 py-2">
                          <p className="font-medium">{item.product_name}</p>
                          {item.notes && (
                            <p className="text-sm text-gray-500 italic">Nota: {item.notes}</p>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">${item.unit_price}</td>
                        <td className="px-4 py-2 text-right">${item.unit_price * item.quantity}</td>
                      </tr>
                      {Array.isArray(item.extras) && item.extras.length > 0 &&
                        item.extras
                          .slice()
                          .sort((a, b) =>
                            a.extra_group_sort_order !== b.extra_group_sort_order
                              ? a.extra_group_sort_order - b.extra_group_sort_order
                              : a.extra_sort_order - b.extra_sort_order
                          )
                          .map((extra, idx) => (
                            <tr key={`${index}-extra-${idx}`} className="bg-gray-50">
                              <td className="px-4 py-2">
                                <span className="ml-4">↳ {extra.extra_name}</span>
                              </td>
                              <td className="px-4 py-2 text-center">{extra.quantity}</td>
                              <td className="px-4 py-2 text-right">
                                {extra.unit_price > 0 ? `$${extra.unit_price}` : "$0"}
                              </td>
                              <td className="px-4 py-2 text-right">
                                ${extra.unit_price * extra.quantity}
                              </td>
                            </tr>
                          ))}
                    </React.Fragment>
                  ))}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-4 py-2 text-left">Costo de los productos</td>
                    <td />
                    <td />
                    <td className="px-4 py-2 text-right">${order.total_amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pago y Tiempos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t text-center sm:text-left">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center justify-center sm:justify-start">
                <CreditCard className="h-5 w-5 mr-2" />
                Información de Pago
              </h3>
              <div className="text-sm space-y-2">
                <p><strong>Método:</strong> {order.payment_method === "cash" ? "Efectivo" : "Tarjeta"}</p>
                <p>
                  <strong>Total:</strong>{" "}
                  <span className="text-lg font-bold text-green-600">${order.total_amount}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center justify-center sm:justify-start">
                <Clock className="h-5 w-5 mr-2" />
                Tiempos
              </h3>
              <div className="text-sm space-y-2">
                {order.order_time && (
                  <p>
                    <strong>Hora de la orden:</strong> {formatOrderTime(order.order_time)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
