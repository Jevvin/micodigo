"use client";

/**
 * RestaurantInfoModal.tsx
 * 
 * Este componente es un modal informativo:
 * - Muestra detalles extendidos del restaurante
 * - Estado abierto/cerrado
 * - Redes sociales (placeholder)
 * - Tipos de servicio
 * - Horarios
 * - Dirección
 * 
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - restaurant: objeto
 * - statusText: string
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Info,
  X,
  Phone,
  Instagram,
  Facebook,
  Globe,
  Truck,
  MapPin,
  Clock
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function RestaurantInfoModal({
  open,
  onClose,
  restaurant,
  statusText
}: {
  open: boolean;
  onClose: () => void;
  restaurant: any;
  statusText: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
  <div className="flex items-center justify-between flex-wrap gap-2">
    <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold flex-wrap">
      <span>Información</span>
    </DialogTitle>

    <button
      onClick={onClose}
      className="text-gray-500 hover:text-gray-800 transition shrink-0"
      aria-label="Cerrar"
    >
      <X className="w-5 h-5 sm:w-5 sm:h-5" />
    </button>
  </div>
</DialogHeader>

        <Separator />


        {/* Estado */}
        <div className="flex items-center space-x-2 mb-4">
          <div
            className={`w-3 h-3 rounded-full ${
              statusText.includes("Abierto") || statusText.includes("Abre")
                ? "bg-green-500"
                : statusText.includes("Cierra")
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          />
          <span className="font-medium">{statusText}</span>
          <Info className="h-4 w-4 text-gray-400" />
        </div>

        {/* Nombre y logo */}
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={restaurant.logo_image_url || "/placeholder.svg"}
            alt="Logo"
            className="w-12 h-12 rounded-lg object-cover border"
          />
          <p className="text-lg font-semibold">{restaurant.name}</p>
        </div>

        {/* Redes sociales */}
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="sm" className="p-2">
            <Phone className="h-5 w-5 text-green-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Instagram className="h-5 w-5 text-pink-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Facebook className="h-5 w-5 text-blue-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Globe className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        {/* Tipos de servicio */}
        <div className="mb-6">
          <p className="text-base font-medium mb-3">Tipos de servicio</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-blue-600" />
                <span className="font-medium">A domicilio</span>
              </div>
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">✓</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-green-600" />
                <span className="font-medium">Para llevar</span>
              </div>
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="mb-6">
          <p className="flex items-center font-medium mb-3">
            <Clock className="h-4 w-4 mr-2" /> Horarios de atención
          </p>
          <div className="space-y-2 text-sm">
            {restaurant.restaurant_hours?.map((hours: any) => {
              const dayTranslations: Record<string, string> = {
                monday: "Lunes",
                tuesday: "Martes",
                wednesday: "Miércoles",
                thursday: "Jueves",
                friday: "Viernes",
                saturday: "Sábado",
                sunday: "Domingo"
              };
              const dayName = dayTranslations[hours.day_of_week] || hours.day_of_week;
              const formatTime = (time: string) => {
                if (!time) return "";
                const [hour, minute] = time.split(":").map(Number);
                const date = new Date();
                date.setHours(hour, minute);
                return date.toLocaleTimeString("es-MX", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true
                });
              };
              return (
                <div key={hours.id} className="flex justify-between">
                  <span className="capitalize">{dayName}</span>
                  <span
                    className={
                      hours.is_open
                        ? "text-gray-600"
                        : "text-red-500 font-medium"
                    }
                  >
                    {hours.is_open
                      ? `${formatTime(hours.open_time)} - ${formatTime(
                          hours.close_time
                        )}`
                      : "Cerrado"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ubicación */}
        <div className="border-t pt-4">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <p className="font-medium">Ubicación</p>
              <p className="text-sm text-gray-600">
                {restaurant.address || "Dirección no disponible"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
