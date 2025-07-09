"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ExtraGroup {
  id: string;
  name: string;
  description: string;
}

export default function SelectorDialogAssignExtraGroup({
  open,
  onOpenChange,
  availableGroups,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableGroups: ExtraGroup[];
  onSelect: (group: ExtraGroup) => void;
}) {
  const [search, setSearch] = useState("");

  const filteredGroups = availableGroups.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asignar Grupo de Extras</DialogTitle>
          <DialogDescription>
            Selecciona un grupo de extras para asignar a este producto
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Buscar grupo por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredGroups.length === 0 && (
            <p className="text-sm text-gray-500">No hay grupos que coincidan con la búsqueda.</p>
          )}
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="flex items-center justify-between border rounded p-3 hover:bg-gray-50"
            >
              <div>
                <h4 className="font-medium">{group.name}</h4>
                <p className="text-sm text-gray-500">{group.description}</p>
              </div>
              <Button size="sm" onClick={() => onSelect(group)}>
                Asignar
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
