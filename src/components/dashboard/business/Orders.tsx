"use client";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MapPin, Store, Package } from "lucide-react";
import type { Restaurant } from "@/types/business";

type Props = {
  restaurant: Restaurant;
  setRestaurant: (data: Restaurant) => void;
};

export function Orders({ restaurant, setRestaurant }: Props) {
  return (
    <div className="space-y-6">
      {/* Switch global */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-[17px] sm:text-[18px] md:text-[19px]">
              <Store className="h-5 w-5 mr-2" />
              Aceptar Pedidos
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Habilitar pedidos</span>
              <Switch
                checked={restaurant.accepting_orders}
                onCheckedChange={(checked) =>
                  setRestaurant({ ...restaurant, accepting_orders: checked })
                }
              />
            </div>
          </div>
          <CardDescription>
            Permite activar o desactivar el sistema de pedidos en línea
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Delivery */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-[17px] sm:text-[18px] md:text-[19px]">
              <MapPin className="h-5 w-5 mr-2" />
              A Domicilio
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Habilitar pedidos</span>
              <Switch
                checked={restaurant.accepts_delivery}
                onCheckedChange={(checked) =>
                  setRestaurant({ ...restaurant, accepts_delivery: checked })
                }
              />
            </div>
          </div>
          <CardDescription>
            Configura los parámetros para entregas a domicilio
          </CardDescription>
        </CardHeader>
        {restaurant.accepts_delivery && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Costo de Envío ($)</Label>
                <Input
                  type="number"
                  value={restaurant.delivery_fee || ""}
                  onChange={(e) =>
                    setRestaurant({
                      ...restaurant,
                      delivery_fee: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Pedido Mínimo ($)</Label>
                <Input
                  type="number"
                  value={restaurant.min_order_amount || ""}
                  onChange={(e) =>
                    setRestaurant({
                      ...restaurant,
                      min_order_amount: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Radio de Entrega (km)</Label>
                <Input
                  type="number"
                  value={restaurant.delivery_radius || ""}
                  onChange={(e) =>
                    setRestaurant({
                      ...restaurant,
                      delivery_radius: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pick Up */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-[17px] sm:text-[18px] md:text-[19px]">
              <Package className="h-5 w-5 mr-2" />
              Para llevar
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Habilitar pedidos</span>
              <Switch
                checked={restaurant.accepts_pickup}
                onCheckedChange={(checked) =>
                  setRestaurant({ ...restaurant, accepts_pickup: checked })
                }
              />
            </div>
          </div>
          <CardDescription>
            Permite a los clientes recoger su pedido en el restaurante
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
