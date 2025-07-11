/* 
✅ Este código es para el componente InventoryForm.
Sirve para:
- Renderizar el formulario de agregar o editar un producto en el inventario.
- Permite ingresar o modificar campos como: nombre del producto, cantidad actual, unidad, stock mínimo/máximo, costo por unidad, precio de venta, URL de imagen y fecha de última reposición.
- Es usado dentro del modal InventoryDialog para gestionar la edición y creación de productos en el dashboard de inventario.
*/

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryItem, StockStatus } from "@/types/inventory";
import { Switch } from "@/components/ui/switch";  // Usa tu switch UI

export default function InventoryForm({
  item,
  onSave,
  onCancel,
}: {
  item?: InventoryItem;
  onSave: (item: InventoryItem) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    id: item?.id ?? 0,
    restaurant_id: item?.restaurant_id || "",
    product_id: item?.product_id ?? null,
    product_name: item?.product_name || "",
    quantity: item?.quantity || 0,
    minimum_quantity: item?.minimum_quantity || 0,
    maximum_quantity: item?.maximum_quantity || 0,
    unit: item?.unit || "",
    cost_per_unit: item?.cost_per_unit || 0,
    price: item?.price || 0,
    last_restocked: item?.last_restocked || new Date().toISOString().split("T")[0],
    status: item?.status || "good" as StockStatus,
    image: item?.image ?? "",
    is_available: item?.is_available ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as InventoryItem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="product_name">Nombre del Producto</Label>
        <Input
          id="product_name"
          value={formData.product_name}
          onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
          placeholder="Nombre del producto"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Cantidad Actual</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="unit">Unidad</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="ej: porciones, vasos, kg"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minimum_quantity">Stock Mínimo</Label>
          <Input
            id="minimum_quantity"
            type="number"
            value={formData.minimum_quantity}
            onChange={(e) => setFormData({ ...formData, minimum_quantity: Number(e.target.value) })}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Se notificará cuando esté por debajo</p>
        </div>
        <div>
          <Label htmlFor="maximum_quantity">Stock Máximo</Label>
          <Input
            id="maximum_quantity"
            type="number"
            value={formData.maximum_quantity}
            onChange={(e) => setFormData({ ...formData, maximum_quantity: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cost_per_unit">Costo por Unidad (interno)</Label>
          <Input
            id="cost_per_unit"
            type="number"
            step="0.01"
            value={formData.cost_per_unit}
            onChange={(e) => setFormData({ ...formData, cost_per_unit: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Precio de Venta (público)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image">URL de Imagen</Label>
        <Input
          id="image"
          type="url"
          value={formData.image ?? ""}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://... o ruta en Supabase Storage"
        />
      </div>

      <div>
        <Label htmlFor="last_restocked">Última Reposición</Label>
        <Input
          id="last_restocked"
          type="date"
          value={formData.last_restocked}
          onChange={(e) => setFormData({ ...formData, last_restocked: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_available}
          onCheckedChange={(v) => setFormData({ ...formData, is_available: v })}
          id="is_available"
        />
        <Label htmlFor="is_available">Disponible para Venta</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
