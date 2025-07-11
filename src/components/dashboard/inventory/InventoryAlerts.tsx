/* 
✅ Este código es para el componente InventoryAlerts.
Sirve para:
- Mostrar una lista de alertas destacadas en la parte superior del panel de inventario.
- Notifica visualmente cuáles productos están en estado crítico (stock muy bajo).
- Ayuda al usuario a identificar rápidamente los productos que necesitan atención urgente.
*/

"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function InventoryAlerts({
  criticalItems,
}: {
  criticalItems: { id: string; productName: string }[];
}) {
  if (criticalItems.length === 0) return null;

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <strong>¡Atención!</strong> {criticalItems.length} producto(s) con stock crítico:{" "}
        {criticalItems.map((item) => item.productName).join(", ")}
      </AlertDescription>
    </Alert>
  );
}
