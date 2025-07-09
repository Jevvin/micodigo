"use client";

import { useState } from "react";
import { Plus, Search, PackageX } from "lucide-react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import SortableAssignedExtraGroup from "./SortableAssignedExtraGroup";
import Link from "next/link";

export interface AvailableGroup {
  id: string;
  name: string;
  description: string;
}

export interface AssignedGroup {
  extraGroupId: string;
  sortOrder: number;
}

export default function AssignedExtraGroups({
  assignedGroups,
  onUpdateAssignedGroups,
  availableGroups,
}: {
  assignedGroups: AssignedGroup[];
  onUpdateAssignedGroups: (groups: AssignedGroup[]) => void;
  availableGroups: AvailableGroup[];
}) {
  const [search, setSearch] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = assignedGroups.findIndex((g) => g.extraGroupId === active.id);
    const newIndex = assignedGroups.findIndex((g) => g.extraGroupId === over.id);
    const newOrder = arrayMove(assignedGroups, oldIndex, newIndex).map((g, i) => ({
      ...g,
      sortOrder: i,
    }));
    onUpdateAssignedGroups(newOrder);
  };

  const handleAddGroup = (group: AvailableGroup) => {
    if (assignedGroups.some((g) => g.extraGroupId === group.id)) return;
    onUpdateAssignedGroups([
      ...assignedGroups,
      { extraGroupId: group.id, sortOrder: assignedGroups.length }
    ]);
  };

  const handleRemoveGroup = (groupId: string) => {
    const newGroups = assignedGroups
      .filter((g) => g.extraGroupId !== groupId)
      .map((g, i) => ({ ...g, sortOrder: i }));
    onUpdateAssignedGroups(newGroups);
  };

  const getGroupDetails = (groupId: string): AvailableGroup | undefined =>
    availableGroups.find((g) => g.id === groupId);

  // Filtro para buscar disponibles
  const filteredAvailable = availableGroups.filter(
    (g) =>
      !assignedGroups.some((a) => a.extraGroupId === g.id) &&
      g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Grupos de Extras Asignados</h3>

      {assignedGroups.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No hay grupos asignados a este producto.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={assignedGroups.map((g) => g.extraGroupId)}
            strategy={verticalListSortingStrategy}
          >
            <Accordion type="multiple" className="w-full">
              {assignedGroups.map((assigned) => {
                const details = getGroupDetails(assigned.extraGroupId);
                return details ? (
                  <SortableAssignedExtraGroup
                    key={assigned.extraGroupId}
                    group={{
                      ...details,
                      sortOrder: assigned.sortOrder,
                    }}
                    onRemove={() => handleRemoveGroup(assigned.extraGroupId)}
                  />
                ) : null;
              })}
            </Accordion>
          </SortableContext>
        </DndContext>
      )}

      <Accordion type="single" collapsible>
        <AccordionItem value="add-extra">
          <AccordionTrigger className="text-left">
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              <span>Agregar Grupo de Extras</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {availableGroups.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <PackageX className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="mb-2">No tienes grupos de extras disponibles.</p>
                <Link href="/dashboard/extras">
                  <Button variant="outline" size="sm">
                    Crear primer grupo de extras
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Input
                    placeholder="Buscar grupos de extras..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {filteredAvailable.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay resultados para tu búsqueda.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredAvailable.map((group) => (
                      <div
                        key={group.id}
                        className="flex justify-between items-center border rounded-lg p-2"
                      >
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-sm text-gray-500">{group.description}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleAddGroup(group)}>
                          Asignar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
