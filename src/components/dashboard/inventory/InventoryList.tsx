/* 
✅ Este código es para mostrar los campos en las cards de productos en el panel de INVENTORY. 
Muestra imagen, nombre, precio de venta, costo por unidad, stock actual, mínima y máxima cantidad, última reposición y estado (bajo, crítico, bueno).
Usa el objeto InventoryItem que se trae directamente de la tabla de inventory_items en Supabase.
Es la vista previa que se ve en la lista del inventario en el dashboard, SIN abrir el modal de edición.
*/

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, ImageIcon } from "lucide-react";
import { InventoryItem } from "@/types/inventory";

export default function InventoryList({
  inventory,
  highlightedProductId,
  onEdit,
}: {
  inventory: InventoryItem[];
  highlightedProductId?: string | null;
  onEdit: (item: InventoryItem) => void;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventario de Productos</CardTitle>
        <CardDescription>
          Estado actual del stock - Los productos críticos y bajos generan notificaciones automáticas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inventory.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                highlightedProductId === String(item.id) ? "ring-4 ring-blue-300 shadow-lg bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.product_name} className="object-cover w-full h-full" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                  <p className="text-sm text-gray-500">
                    💲 <span className="font-semibold">${item.price}</span> precio venta
                  </p>
                  <p className="text-sm text-gray-500">
                    ⚙️ ${item.cost_per_unit} costo / {item.unit}
                  </p>
                  <p className="text-xs text-gray-400">
                    📅 Última reposición: {item.last_restocked}
                  </p>
                  {item.is_available === false && (
                    <p className="text-xs text-red-500 mt-1">⛔️ No disponible</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end justify-between h-full space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">
                    {item.quantity} {item.unit}
                  </span>
                  <Badge className={`${getStatusColor(item.status)} min-w-[6rem] text-center justify-center`}>
                    {getStatusText(item.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Min: {item.minimum_quantity} • Max: {item.maximum_quantity}
                </p>
                {(item.status === "critical" || item.status === "low") && (
                  <p className="text-xs text-blue-600">
                    📢 Genera notificaciones automáticas
                  </p>
                )}
                <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
