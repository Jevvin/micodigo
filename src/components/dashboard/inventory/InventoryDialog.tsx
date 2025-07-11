/* 
✅ Este código es para el componente InventoryDialog.
Sirve para:
- Mostrar un modal (diálogo) para agregar o editar un producto del inventario.
- Contiene el formulario InventoryForm para capturar o actualizar los datos del producto.
- Se abre al hacer clic en “Agregar Producto” o en el botón de editar de cada tarjeta de producto en el dashboard de inventario.
*/


"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import InventoryForm from "./InventoryForm";
import { InventoryItem } from "@/types/inventory";

export default function InventoryDialog({
  open,
  onClose,
  onSave,
  item,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  item?: InventoryItem;
}) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
          <DialogDescription>
            {item ? "Modifica los detalles del producto en inventario" : "Agrega un nuevo producto al inventario"}
          </DialogDescription>
        </DialogHeader>
        <InventoryForm
          item={item}
          onSave={(item) => {
            onSave(item);
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
