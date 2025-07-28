"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/menu";

export default function CategoryForm({
  category,
  onSave,
  onCancel,
}: {
  category?: Category;
  onSave: (category: Category) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    isActive: category?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCategory: Category = {
      id: category?.id ?? `cat-${crypto.randomUUID()}`, // ✅ generar ID si es nuevo
      name: formData.name,
      description: formData.description,
      isActive: formData.isActive,
      sortOrder: category?.sortOrder || 0,
      products: category?.products || [],
    };
    onSave(newCategory);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre de la categoría</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
        />
        <Label htmlFor="isActive">Categoría activa</Label>
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
