"use client";

/**
 * CartButton.tsx
 *
 * Botón flotante para mostrar el icono del carrito con contador de items.
 * Se muestra centrado en la parte inferior de la pantalla (como Uber Eats).
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
  if (count <= 0) return null; // No mostrar si no hay productos

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <Button
        onClick={onClick}
        variant="default"
        className="bg-black text-white hover:bg-gray-900 px-6 py-4 rounded-full shadow-lg text-base font-medium flex items-center gap-2"
      >
        <ShoppingCart className="h-5 w-5" />
        <span>Ver carrito</span>
        <span className="ml-1 font-bold">({count})</span>
      </Button>
    </div>
  );
}
