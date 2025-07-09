"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Eye, EyeOff, Edit, Trash2, GripVertical, ImageIcon } from "lucide-react";
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

import { Product } from "@/types/menu";  // ✅ Usa el type global

export default function SortableProduct({
  product,
  onEdit,
  onDelete,
  onToggleAvailability,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: product.id });
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
          <ImageIcon className="h-6 w-6 text-gray-400" />
        </div>
        <div>
          <h4 className="font-medium">{product.name}</h4>
          <p className="text-sm text-gray-500">
            ${product.price} • Stock: {product.stock}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={product.isAvailable ? "default" : "secondary"}>
          {product.isAvailable ? "Disponible" : "No disponible"}
        </Badge>
        <Button variant="ghost" size="sm" onClick={onToggleAvailability}>
          {product.isAvailable ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              <AlertDialogTitle>¿Deseas eliminar este producto?</AlertDialogTitle>
              <AlertDialogDescription>
                Recuerda que esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={onDelete}>
                Sí, eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
