"use client";

/**
 * RestaurantStatusBadge.tsx
 * 
 * Este componente muestra el "badge" del estado abierto/cerrado/abre/cierra.
 * Se usa sobre la imagen de portada del restaurante.
 * 
 * Props:
 * - statusText: string
 */

import { Badge } from "@/components/ui/badge";

export default function RestaurantStatusBadge({ statusText }: { statusText: string }) {
  return (
    <Badge
      className={`${
        statusText.includes("Abierto") || statusText.includes("Abre")
          ? "bg-green-600"
          : statusText.includes("Cierra")
          ? "bg-yellow-500"
          : "bg-red-500"
      } text-white px-3 py-2 rounded-full text-sm font-medium`}
    >
      {statusText}
    </Badge>
  );
}
