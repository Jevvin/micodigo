"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { uploadProductImageToStorage } from "@/app/utils/storageUpload";

import AssignedExtraGroups from "../products/AssignedExtraGroups";
import { Product, ExtraGroup } from "@/types/menu";

type Supabase = any;
const supabase = createClientComponentClient<Supabase>();

export default function ProductForm({
  categoryId,
  product,
  onSave,
  onCancel,
}: {
  categoryId: string;
  product?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}) {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [availableGroups, setAvailableGroups] = useState<ExtraGroup[]>([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<Omit<Product, "id" | "categoryId" | "restaurantId">>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    stock: product?.stock || 0,
    isAvailable: product?.isAvailable ?? true,
    image: product?.image || "",
    assignedExtraGroups: product?.assignedExtraGroups ?? [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const id = restaurant?.id ?? null;
      setRestaurantId(id);

      if (id) {
        const { data: groupsData } = await supabase
          .from("extra_groups")
          .select("*")
          .eq("restaurant_id", id)
          .order("sort_order", { ascending: true });

        setAvailableGroups(groupsData ?? []);
      }
    };

    fetchData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!restaurantId) {
      alert("Error: No se encontró el ID del restaurante.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const result = await uploadProductImageToStorage(restaurantId, file);

    if (result.success && result.url) {
      setFormData({ ...formData, image: result.url });
    } else {
      alert(`Error al subir imagen: ${result.error}`);
    }

    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct: Product = {
      id: product?.id || `prod-${Date.now()}`,
      categoryId,
      restaurantId: restaurantId ?? undefined,
      ...formData,
    };

    onSave(newProduct);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre del producto</Label>
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
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="stock">Stock inicial</Label>
        <Input
          id="stock"
          type="number"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
          required
        />
      </div>

      <div>
        <Label>Imagen del producto</Label>
        {formData.image && (
          <img
            src={formData.image}
            alt="Imagen del producto"
            className="w-32 h-32 object-cover rounded mb-2"
          />
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading || !restaurantId}
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
          id="isAvailable"
          checked={formData.isAvailable}
          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
        />
        <Label htmlFor="isAvailable">Producto disponible</Label>
      </div>

      <Accordion type="multiple" className="mt-6">
        <AccordionItem value="extras">
          <AccordionTrigger className="text-left">
            <span>Grupos de Extras para este producto</span>
          </AccordionTrigger>
          <AccordionContent>
            <AssignedExtraGroups
              assignedGroups={formData.assignedExtraGroups}
              onUpdateAssignedGroups={(newGroups) =>
                setFormData({ ...formData, assignedExtraGroups: newGroups })
              }
              availableGroups={availableGroups}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!restaurantId}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
