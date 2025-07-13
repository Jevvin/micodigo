"use client";

/**
 * CartButton.tsx
 * 
 * Botón para mostrar el icono del carrito con contador de items.
 * Puede colocarse en el header o en la página del restaurante.
 * 
 * Props:
 * - count: número de items en el carrito
 * - onClick: función para abrir el modal
 */

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartButton({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      variant="default"
      className="bg-black text-white hover:bg-gray-900 relative px-4 py-2 rounded-lg text-sm font-normal"
    >
      <ShoppingCart className="h-5 w-5 mr-2" />
      {`Carrito (${count})`}
    </Button>
  );
}
