"use client";

import { useState } from "react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Edit, Plus, Trash2, ImageIcon } from "lucide-react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import ExtraGroupForm from "./ExtraGroupForm";
import ExtraItemForm from "./ExtraItemForm";
import SortableExtraItem from "./SortableExtraItem";

import type { ExtraGroup, ExtraItem } from "@/types/menu";

type SortableExtraGroupProps = {
  group: ExtraGroup;
  onUpdateGroup: (group: ExtraGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onUpdateItem: (groupId: string, item: ExtraItem) => void;
  onDeleteItem: (groupId: string, itemId: string) => void;
  handleReorderItems: (groupId: string, newItems: ExtraItem[]) => void;
};

export default function SortableExtraGroup({
  group,
  onUpdateGroup,
  onDeleteGroup,
  onUpdateItem,
  onDeleteItem,
  handleReorderItems,
}: SortableExtraGroupProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: group.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [itemBeingEdited, setItemBeingEdited] = useState<ExtraItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleItemDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = group.items.findIndex((i) => i.id === active.id);
    const newIndex = group.items.findIndex((i) => i.id === over.id);

    const newItems = arrayMove(group.items, oldIndex, newIndex).map((item, index) => ({
      ...item,
      sortOrder: index,
    }));

    onUpdateGroup({ ...group, items: newItems });
    handleReorderItems(String(group.id), newItems);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={String(group.id)} className="border rounded-lg mb-4">
        <AccordionTrigger className="px-4 hover:no-underline">
          <div className="flex items-center justify-between w-full mr-4">
            <div className="flex items-center space-x-3">
              <div {...attributes} {...listeners} className="cursor-grab">
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">{group.name}</h3>
                <p className="text-sm text-gray-500">{group.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={group.isRequired ? "default" : "secondary"}>
                {group.isRequired ? "Obligatorio" : "Opcional"}
              </Badge>
              <Badge variant="outline">{group.ruleType}</Badge>
              <span className="text-sm text-gray-500">{group.items?.length || 0} extras</span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditingGroup(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar Grupo
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsAddingItem(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Extra
                </Button>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar grupo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar este grupo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Recuerda que todos los extras dentro de él también se eliminarán.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className={buttonVariants({ variant: "destructive" })}
                      onClick={() => onDeleteGroup(String(group.id))}
                    >
                      Sí, eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
              <SortableContext items={group.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <SortableExtraItem
                      key={item.id}
                      item={{
                        ...item,
                        groupId: String(group.id),
                        sortOrder: item.sortOrder ?? 0,
                      }}
                      onEdit={() => {
                        setItemBeingEdited({
                          ...item,
                          groupId: String(group.id),
                          sortOrder: item.sortOrder ?? 0,
                        });
                        setIsEditingItem(true);
                      }}
                      onDelete={() => onDeleteItem(String(group.id), String(item.id))}
                      onToggleActive={() =>
                        onUpdateItem(String(group.id), {
                          ...item,
                          groupId: String(group.id),
                          isActive: !item.isActive,
                          sortOrder: item.sortOrder ?? 0,
                        })
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {group.items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No hay extras en este grupo</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsAddingItem(true)}>
                  Agregar primer extra
                </Button>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <Dialog open={isEditingGroup} onOpenChange={setIsEditingGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Grupo de Extras</DialogTitle>
            <DialogDescription>Modifica los detalles del grupo</DialogDescription>
          </DialogHeader>
          <ExtraGroupForm
            group={group}
            onSave={(updatedGroup) => {
              onUpdateGroup(updatedGroup);
              setIsEditingGroup(false);
            }}
            onCancel={() => setIsEditingGroup(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Extra</DialogTitle>
            <DialogDescription>Crea un nuevo extra para este grupo</DialogDescription>
          </DialogHeader>
          <ExtraItemForm
            groupId={String(group.id)} 
            onSave={(newItem) => {
              onUpdateItem(String(group.id), {
                ...newItem,
                groupId: String(group.id),
                sortOrder: newItem.sortOrder ?? 0,
              });
              setIsAddingItem(false);
            }}
            onCancel={() => setIsAddingItem(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingItem} onOpenChange={setIsEditingItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Extra</DialogTitle>
            <DialogDescription>Modifica los detalles del extra</DialogDescription>
          </DialogHeader>
          {itemBeingEdited && (
            <ExtraItemForm
              groupId={String(group.id)}
              item={itemBeingEdited}
              onSave={(updatedItem) => {
                onUpdateItem(String(group.id), {
                  ...updatedItem,
                  groupId: String(group.id),
                  sortOrder: updatedItem.sortOrder ?? 0,
                });
                setIsEditingItem(false);
                setItemBeingEdited(null);
              }}
              onCancel={() => setIsEditingItem(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
