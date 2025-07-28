"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { GripVertical, Edit, Trash2, Eye, EyeOff, ImageIcon } from "lucide-react";
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
import type { ExtraItem } from "@/types/menu";


/**
 * Componente SortableExtraItem
 */
export default function SortableExtraItem({
  item,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  item: ExtraItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 border rounded-lg bg-white">
      <div className="flex items-center space-x-3">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
          ) : (
            <ImageIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div>
          <h4 className="font-medium">{item.name}</h4>
          <p className="text-sm text-gray-500">
            ${item.price} • Stock: {item.stock}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={item.isActive ? "default" : "secondary"}>
          {item.isActive ? "Activo" : "Inactivo"}
        </Badge>
        <Button variant="ghost" size="sm" onClick={onToggleActive}>
          {item.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este extra?</AlertDialogTitle>
              <AlertDialogDescription>
                Recuerda que esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={onDelete}
              >
                Sí, eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
