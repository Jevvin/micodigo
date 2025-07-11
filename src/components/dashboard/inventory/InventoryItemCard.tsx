/* 
✅ Este código es para el componente InventoryItemCard.
Sirve para:
- Mostrar la tarjeta (card) individual de cada producto en el panel de inventario.
- Incluye imagen, nombre del producto, precio de venta, costo por unidad, stock actual, estado de stock (bueno/bajo/crítico), última reposición y estado de disponibilidad (is_available).
- Incluye un botón para editar el producto.

Es la vista principal y detallada de cada ítem en el inventario del dashboard.
*/


"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, ImageIcon } from "lucide-react";
import { InventoryItem } from "@/types/inventory";
import { format } from "date-fns";

export default function InventoryItemCard({
  item,
  highlighted,
  onEdit,
}: {
  item: InventoryItem;
  highlighted?: boolean;
  onEdit: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800";
      case "low":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "good":
        return "Stock Bueno";
      case "low":
        return "Stock Bajo";
      case "critical":
        return "Stock Crítico";
      default:
        return "Desconocido";
    }
  };

  const formattedDate = item.last_restocked
    ? format(new Date(item.last_restocked), "yyyy-MM-dd")
    : "-";

  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
        highlighted ? "ring-4 ring-blue-300 shadow-lg bg-blue-50" : ""
      }`}
    >
      {/* IZQUIERDA: Imagen + Detalles */}
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
          {item.image ? (
            <img
              src={item.image}
              alt={item.product_name}
              className="object-cover w-full h-full"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-gray-900">{item.product_name}</h3>
          <p className="text-sm text-gray-500">
            💲 <span className="font-semibold">${item.price}</span> precio venta
          </p>
          <p className="text-sm text-gray-500">
            ⚙️ ${item.cost_per_unit} costo / {item.unit}
          </p>
          {item.is_available === false && (
            <p className="text-xs text-red-500">⛔️ No disponible</p>
          )}
          <p className="text-xs text-gray-400">
            📅 Última reposición: {formattedDate}
          </p>
        </div>
      </div>

      {/* DERECHA: Stock + Estado + Botón */}
      <div className="flex items-center space-x-4">
        <div className="text-right space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">
              {item.quantity} {item.unit}
            </span>
            <Badge className={getStatusColor(item.status)}>
              {getStatusText(item.status)}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Min: {item.minimum_quantity} • Max: {item.maximum_quantity}
          </p>
          {(item.status === "critical" || item.status === "low") && (
            <p className="text-xs text-blue-600 mt-1">
              📢 Genera notificaciones automáticas
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
