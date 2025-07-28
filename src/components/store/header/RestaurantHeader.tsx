"use client";

/**
 * RestaurantHeader.tsx
 * 
 * Este componente muestra la cabecera del restaurante:
 * - Logo, nombre, descripción
 * - Badge de estado (abierto/cerrado)
 * - Botón para abrir el modal de información
 * 
 * ⚠️ El botón de carrito fue eliminado porque ahora usamos el botón flotante.
 */

import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function RestaurantHeader({
  restaurant,
  statusText,
  onOpenInfo,
}: {
  restaurant: any;
  statusText: string;
  onOpenInfo: () => void;
}) {
  return (
    <div className="-mt-6 mx-4 mb-6 relative z-10">
      <Card className="p-6">
        <div className="flex items-start space-x-4">
          {/* LOGO */}
          {restaurant.logo_image_url ? (
            <img
              src={restaurant.logo_image_url}
              alt={restaurant.name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              Logo
            </div>
          )}

          {/* CENTRO */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{restaurant.name}</p>
              <Button
                variant="ghost"
                size="icon"
                className="p-1"
                onClick={onOpenInfo}
              >
                <Info className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
            <p className="text-gray-600 text-base md:text-lg mb-3">
              {restaurant.description}
            </p>
            <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-1">4.8</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">⏱</span> 25-35 min
              </div>
              <div className="flex items-center">
                <span className="mr-1">🚚</span> Envío $30
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
