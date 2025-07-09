"use client";

import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

// ✅ Ajuste aquí: incluir sortOrder
export interface AssignedExtraGroup {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
}

export default function SortableAssignedExtraGroup({
  group,
  onRemove,
}: {
  group: AssignedExtraGroup;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={group.id} className="border rounded-lg mb-2">
        <AccordionTrigger className="px-4 hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <div {...attributes} {...listeners} className="cursor-grab">
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <h4 className="font-medium">{group.name}</h4>
                <p className="text-sm text-gray-500">{group.description}</p>
              </div>
            </div>
            <Badge variant="secondary">Asignado</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="flex justify-end">
            <Button variant="destructive" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4 mr-1" />
              Quitar Grupo
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}
