"use client";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { Restaurant, RestaurantHours } from "@/types/business";

type Props = {
  restaurant: Restaurant;
  setRestaurant: (data: Restaurant) => void;
};

const orderedDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const dayTranslations: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export function Hours({ restaurant, setRestaurant }: Props) {
  const sortedHours = orderedDays
    .map((day) => restaurant.restaurant_hours.find((h) => h.day_of_week === day))
    .filter(Boolean) as RestaurantHours[];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" /> Horarios de Operación
        </CardTitle>
        <CardDescription>
          Configura los horarios de atención de tu restaurante
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedHours.length ? (
            sortedHours.map((hours) => (
              <div
                key={hours.id}
                className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                {/* Día + Switch */}
                <div className="flex items-center gap-4 min-w-[180px]">
                  <span className="w-20 font-medium">
                    {dayTranslations[hours.day_of_week]}
                  </span>
                  <Switch
                    checked={hours.is_open}
                    onCheckedChange={(checked) => {
                      const updated = restaurant.restaurant_hours.map((h) =>
                        h.id === hours.id ? { ...h, is_open: checked } : h
                      );
                      setRestaurant({
                        ...restaurant,
                        restaurant_hours: updated,
                      });
                    }}
                  />
                </div>

                {/* Horarios */}
                {hours.is_open ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hours.open_time || ""}
                      onChange={(e) => {
                        const updated = restaurant.restaurant_hours.map((h) =>
                          h.id === hours.id
                            ? { ...h, open_time: e.target.value }
                            : h
                        );
                        setRestaurant({
                          ...restaurant,
                          restaurant_hours: updated,
                        });
                      }}
                      className="w-auto min-w-[8rem] flex-shrink-0"
                    />
                    <span className="text-center">a</span>
                    <Input
                      type="time"
                      value={hours.close_time || ""}
                      onChange={(e) => {
                        const updated = restaurant.restaurant_hours.map((h) =>
                          h.id === hours.id
                            ? { ...h, close_time: e.target.value }
                            : h
                        );
                        setRestaurant({
                          ...restaurant,
                          restaurant_hours: updated,
                        });
                      }}
                      className="w-auto min-w-[8rem] flex-shrink-0"
                    />
                  </div>
                ) : (
                  <Badge variant="secondary">Cerrado</Badge>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No se encontraron horarios configurados.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
