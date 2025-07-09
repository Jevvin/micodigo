"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Plus, ImageIcon } from "lucide-react";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ExtraGroupForm from "./ExtraGroupForm";
import SortableExtraGroup from "./SortableExtraGroup";

type Supabase = any;
const supabase = createClientComponentClient<Supabase>();

interface ExtraItem {
  id: string;
  groupId: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  isActive: boolean;
}

interface ExtraGroup {
  id: string;
  restaurantId?: string;
  name: string;
  description: string;
  ruleType: "single" | "multiple" | "quantity";
  isRequired: boolean;
  maxSelections: number;
  minSelections: number;
  isIncluded: boolean;
  sortOrder: number;
  items: ExtraItem[];
}

export default function ExtrasCustomizer() {
  const [extraGroups, setExtraGroups] = useState<ExtraGroup[]>([]);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const loadRestaurantId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("restaurants")
        .select("id")
        .eq("user_id", user.id)
        .single();
      setRestaurantId(data?.id ?? null);
    };
    loadRestaurantId();
  }, []);

  useEffect(() => {
    if (!restaurantId) return;
    const loadExtras = async () => {
      const { data: groupsData } = await supabase
        .from("extra_groups")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", { ascending: true });

      if (!groupsData) return;

      const groupsWithItems: ExtraGroup[] = [];
      for (const group of groupsData) {
        const { data: items } = await supabase
          .from("extras")
          .select("*")
          .eq("extra_group_id", group.id)
          .order("sort_order", { ascending: true });

        groupsWithItems.push({
          id: group.id,
          restaurantId,
          name: group.name,
          description: group.description,
          ruleType: group.tipo_regla,
          isRequired: group.obligatorio,
          maxSelections: group.max_selecciones,
          minSelections: group.min_selecciones,
          isIncluded: group.gratis_incluidos,
          sortOrder: group.sort_order,
          items: (items ?? []).map((item) => ({
            id: item.id,
            groupId: item.extra_group_id,
            name: item.nombre,
            price: item.precio,
            stock: item.stock,
            image: item.imagen,
            isActive: item.activo,
          })),
        });
      }
      setExtraGroups(groupsWithItems);
    };
    loadExtras();
  }, [restaurantId]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = extraGroups.findIndex((g) => g.id === active.id);
    const newIndex = extraGroups.findIndex((g) => g.id === over.id);
    const newOrder = arrayMove(extraGroups, oldIndex, newIndex);
    setExtraGroups(newOrder);

    for (let i = 0; i < newOrder.length; i++) {
      await supabase
        .from("extra_groups")
        .update({ sort_order: i })
        .eq("id", newOrder[i].id);
    }
  };

  const handleSaveGroup = async (group: ExtraGroup) => {
    if (!restaurantId) return;

    if (group.id.startsWith("grp-")) {
      const { data } = await supabase
        .from("extra_groups")
        .insert({
          name: group.name,
          description: group.description,
          tipo_regla: group.ruleType,
          obligatorio: group.isRequired,
          max_selecciones: group.maxSelections,
          min_selecciones: group.minSelections,
          gratis_incluidos: group.isIncluded,
          restaurant_id: restaurantId,
          sort_order: extraGroups.length,
        })
        .select()
        .single();

      if (data) {
        setExtraGroups([
          ...extraGroups,
          {
            ...group,
            id: data.id,
            sortOrder: data.sort_order,
            items: [],
          },
        ]);
      }
    } else {
      await supabase
        .from("extra_groups")
        .update({
          name: group.name,
          description: group.description,
          tipo_regla: group.ruleType,
          obligatorio: group.isRequired,
          max_selecciones: group.maxSelections,
          min_selecciones: group.minSelections,
          gratis_incluidos: group.isIncluded,
        })
        .eq("id", group.id);

      setExtraGroups(
        extraGroups.map((g) => (g.id === group.id ? group : g))
      );
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    await supabase.from("extra_groups").delete().eq("id", groupId);
    await supabase.from("extras").delete().eq("extra_group_id", groupId);
    setExtraGroups(extraGroups.filter((g) => g.id !== groupId));
  };

  const handleSaveItem = async (groupId: string, newItem: ExtraItem) => {
    const group = extraGroups.find((g) => g.id === groupId);
    if (!group) return;

    const { data } = await supabase
      .from("extras")
      .insert({
        nombre: newItem.name,
        precio: newItem.price,
        stock: newItem.stock,
        imagen: newItem.image,
        activo: newItem.isActive,
        extra_group_id: groupId,
        sort_order: group.items.length,
      })
      .select()
      .single();

    if (data) {
      const savedItem: ExtraItem = { ...newItem, id: data.id };
      setExtraGroups(
        extraGroups.map((g) =>
          g.id === groupId
            ? { ...g, items: [...g.items, savedItem] }
            : g
        )
      );
    }
  };

  const handleUpdateItem = async (groupId: string, item: ExtraItem) => {
    const group = extraGroups.find((g) => g.id === groupId);
    if (!group) return;

    if (item.id.startsWith("item-")) {
      return handleSaveItem(groupId, item);
    } else {
      await supabase
        .from("extras")
        .update({
          nombre: item.name,
          precio: item.price,
          stock: item.stock,
          imagen: item.image,
          activo: item.isActive,
        })
        .eq("id", item.id);

      setExtraGroups(
        extraGroups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                items: g.items.map((i) => (i.id === item.id ? item : i)),
              }
            : g
        )
      );
    }
  };

  const handleDeleteItem = async (groupId: string, itemId: string) => {
    await supabase.from("extras").delete().eq("id", itemId);
    setExtraGroups(
      extraGroups.map((g) =>
        g.id === groupId
          ? { ...g, items: g.items.filter((i) => i.id !== itemId) }
          : g
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Grupos de Extras</h2>
          <p className="text-gray-600">Organiza tus grupos y opciones con arrastrar y soltar</p>
        </div>
        <Button onClick={() => setIsAddingGroup(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Grupo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grupos de Extras</CardTitle>
          <CardDescription>
            Arrastra los grupos para cambiar su orden. Haz clic en un grupo para ver y organizar sus opciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={extraGroups.map((g) => g.id)} strategy={verticalListSortingStrategy}>
              <Accordion type="multiple" className="w-full">
                {extraGroups.map((group) => (
                  <SortableExtraGroup
                    key={group.id}
                    group={group}
                    onUpdateGroup={handleSaveGroup}
                    onDeleteGroup={handleDeleteGroup}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={handleDeleteItem}
                  />
                ))}
              </Accordion>
            </SortableContext>
          </DndContext>

          {extraGroups.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No hay grupos de extras</h3>
              <p className="mb-4">Comienza agregando tu primer grupo de extras</p>
              <Button onClick={() => setIsAddingGroup(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Grupo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddingGroup} onOpenChange={setIsAddingGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Grupo de Extras</DialogTitle>
            <DialogDescription>Crea un nuevo grupo de extras para organizar opciones</DialogDescription>
          </DialogHeader>
          <ExtraGroupForm
            onSave={(newGroup) => {
              handleSaveGroup(newGroup);
              setIsAddingGroup(false);
            }}
            onCancel={() => setIsAddingGroup(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
