/* 
✅ Este código es para el componente InventoryStats del dashboard.
Se encarga de:
- Mostrar un resumen visual del inventario.
- Incluye el número total de productos, cuántos tienen stock crítico o bajo, y el valor total estimado del inventario.
- Sirve como indicador rápido del estado general del stock.

Es un resumen informativo que aparece arriba de la lista de productos en el panel de inventario.
*/


"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

export default function InventoryStats({
  totalProducts,
  criticalCount,
  lowStockCount,
  totalValue,
}: {
  totalProducts: number;
  criticalCount: number;
  lowStockCount: number;
  totalValue: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">En inventario</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Stock Crítico</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
          <p className="text-xs text-muted-foreground">Requieren atención urgente</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
          <TrendingDown className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
          <p className="text-xs text-muted-foreground">Para reabastecer pronto</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${totalValue}</div>
          <p className="text-xs text-muted-foreground">En inventario</p>
        </CardContent>
      </Card>
    </div>
  );
}
