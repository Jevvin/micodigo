"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadProductImageToStorage } from "@/app/utils/storageUpload";

// 📌 Define el tipo ExtraItem si no lo tienes ya importado
interface ExtraItem {
  id: string;
  extraGroupId: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  isActive: boolean;
}

// ✅ Formulario reutilizable para CREAR o EDITAR un ExtraItem
export default function ExtraItemForm({
  extraGroupId,
  item,
  onSave,
  onCancel,
}: {
  extraGroupId: string;
  item?: ExtraItem | null;
  onSave: (item: ExtraItem) => void;
  onCancel: () => void;
}) {
  // 📌 Estado local para el formulario
  const [formData, setFormData] = useState({
    name: item?.name || "",
    price: item?.price || 0,
    stock: item?.stock || 0,
    isActive: item?.isActive ?? true,
    image: item?.image || "",
  });

  const [uploading, setUploading] = useState(false);

  // 📌 Manejar subida de imagen a Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const result = await uploadProductImageToStorage(extraGroupId, file);

    if (result.success && result.url) {
      setFormData({ ...formData, image: result.url });
    } else {
      alert(`Error al subir imagen: ${result.error}`);
    }

    setUploading(false);
  };

  // 📌 Manejar submit del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: ExtraItem = {
      id: item?.id || `item-${Date.now()}`,
      extraGroupId,
      name: formData.name,
      price: formData.price,
      stock: formData.stock,
      isActive: formData.isActive,
      image: formData.image || "",
    };

    onSave(newItem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre del extra</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="stock">Stock inicial</Label>
        <Input
          id="stock"
          type="number"
          value={formData.stock}
          onChange={(e) =>
            setFormData({ ...formData, stock: Number(e.target.value) })
          }
          required
        />
      </div>

      <div>
        <Label>Imagen del extra</Label>
        {formData.image && (
          <img
            src={formData.image}
            alt="Imagen del extra"
            className="w-32 h-32 object-cover rounded mb-2"
          />
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
        />
        {uploading && (
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Subiendo imagen...
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
        />
        <Label htmlFor="isActive">Extra disponible</Label>
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
