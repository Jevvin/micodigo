"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ExtraGroup } from "@/types/menu";

export default function ExtraGroupForm({
  group,
  onSave,
  onCancel,
}: {
  group?: ExtraGroup;
  onSave: (group: ExtraGroup) => void;
  onCancel: () => void;
}) {
  // ... resto del código igual


  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    ruleType: "single" | "multiple" | "quantity";
    isRequired: boolean;
    maxSelections: number;
    minSelections: number;
    isIncluded: boolean;
    isVisible: boolean;
  }>({
    name: group?.name || "",
    description: group?.description || "",
    ruleType: group?.ruleType || "single",
    isRequired: group?.isRequired ?? true,
    maxSelections: group?.maxSelections || 1,
    minSelections: group?.isRequired ? Math.max(1, group?.minSelections || 1) : 0,
    isIncluded: group?.isIncluded ?? false,
    isVisible: group?.isVisible ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.isRequired && formData.minSelections > 0) {
      alert("Si el grupo no es obligatorio, el mínimo de selecciones debe ser 0.");
      return;
    }

    if (formData.isRequired && formData.minSelections < 1) {
      alert("Si el grupo es obligatorio, debe tener al menos 1 selección mínima.");
      return;
    }

    const newGroup: ExtraGroup = {
  id: group?.id || `grp-${Date.now()}`,
  restaurantId: group?.restaurantId || "", // ← aquí
  ...formData,
  sortOrder: group?.sortOrder || 0,
  items: group?.items || [],
};


    onSave(newGroup);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nombre del grupo</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Tipo de regla de selección</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={formData.ruleType}
          onChange={(e) =>
            setFormData({
              ...formData,
              ruleType: e.target.value as "single" | "multiple" | "quantity",
            })
          }
        >
          <option value="single">Selección Única</option>
          <option value="multiple">Selección Múltiple</option>
          <option value="quantity">Con Cantidad</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isRequired"
          checked={formData.isRequired}
          onChange={(e) => {
            const isRequired = e.target.checked;
            setFormData((prev) => ({
              ...prev,
              isRequired,
              minSelections: isRequired ? Math.max(1, prev.minSelections) : 0,
            }));
          }}
        />
        <label htmlFor="isRequired">Obligatorio</label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Mínimo de selecciones</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={formData.minSelections}
            onChange={(e) =>
              setFormData({ ...formData, minSelections: Number(e.target.value) })
            }
            disabled={!formData.isRequired}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Máximo de selecciones</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={formData.maxSelections}
            onChange={(e) =>
              setFormData({ ...formData, maxSelections: Number(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isIncluded"
          checked={formData.isIncluded}
          onChange={(e) => setFormData({ ...formData, isIncluded: e.target.checked })}
        />
        <label htmlFor="isIncluded">Incluido sin costo</label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isVisible"
          checked={formData.isVisible}
          onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
        />
        <label htmlFor="isVisible" className="font-medium">
          {formData.isVisible ? "✅ Grupo visible" : "🚫 Grupo oculto"}
        </label>
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
