"use client";

import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, ImageIcon } from "lucide-react";
import { useState } from "react";
import ExtraGroupForm from "./ExtraGroupForm";
import SortableExtraGroup from "./SortableExtraGroup";
import { useExtrasManager } from "@/hooks/dashboard/useExtrasManager";
import { useToast } from "@/hooks/use-toast";

export default function ExtrasCustomizer() {
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const { toast } = useToast();

  const {
    extraGroups,
    handleSaveGroup,
    handleDeleteGroup,
    handleUpdateItem,
    handleDeleteItem,
    handleDragEnd,
    handleReorderItems,
  } = useExtrasManager({
    onSave: () =>
      toast({
        title: "Grupo guardado correctamente",
      }),
    onUpdate: () =>
      toast({
        title: "Grupo actualizado correctamente",
        description: "Los cambios se han guardado exitosamente.",
      }),
  });

  const handleDeleteGroupWithToast = async (groupId: string) => {
    await handleDeleteGroup(groupId);
    toast({
      title: "Grupo eliminado exitosamente",
      description: "El grupo y sus extras fueron eliminados.",
    });
  };

  const handleUpdateItemWithToast = async (groupId: string, item: any) => {
    const isNew = typeof item.id === "string" && item.id.startsWith("item-");
    await handleUpdateItem(groupId, item);
    toast({
      title: isNew ? "Extra guardado correctamente" : "Extra actualizado correctamente",
    });
  };

  const handleDeleteItemWithToast = async (groupId: string, itemId: string | number) => {
  await handleDeleteItem(groupId, String(itemId));
  toast({
    title: "Extra eliminado correctamente",
  });
};

const handleReorderItemsWithToast = async (groupId: string, newItems: any[]) => {
  await handleReorderItems(groupId, newItems);
  toast({
    title: "Extra actualizado correctamente",
  });
};


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Grupos de Extras</h2>
          <p className="text-gray-600">
            Organiza tus grupos y opciones con arrastrar y soltar
          </p>
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
                    onDeleteGroup={handleDeleteGroupWithToast}
                    onUpdateItem={handleUpdateItemWithToast}
                    onDeleteItem={handleDeleteItemWithToast}
                    handleReorderItems={handleReorderItemsWithToast}
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
