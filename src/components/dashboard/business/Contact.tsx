"use client";

import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import type { Restaurant } from "@/types/business";

type Props = {
  restaurant: Restaurant;
  setRestaurant: (data: Restaurant) => void;
};

export function Contact({ restaurant, setRestaurant }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="h-5 w-5 mr-2" /> Información de Contacto
        </CardTitle>
        <CardDescription>Datos de contacto públicos del restaurante</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Teléfono Principal</Label>
            <Input
              value={restaurant.phone}
              onChange={(e) =>
                setRestaurant({ ...restaurant, phone: e.target.value })
              }
              placeholder="55 1234 5678"
            />
          </div>
          <div>
            <Label>Email de Contacto</Label>
            <Input
              type="email"
              value={restaurant.email}
              onChange={(e) =>
                setRestaurant({ ...restaurant, email: e.target.value })
              }
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
