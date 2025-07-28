"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Store } from "lucide-react";
import { Restaurant } from "@/types/business";

type Props = {
  restaurant: Restaurant;
  setRestaurant: (data: Restaurant) => void;
  checkSlugAvailability: (newSlug: string) => void;
  handleUploadImage: (file: File, type: "cover" | "profile") => void;
};

export function General({ restaurant, setRestaurant, checkSlugAvailability, handleUploadImage }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Store className="h-5 w-5 mr-2" /> Información General
        </CardTitle>
        <CardDescription>Datos básicos de tu restaurante</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SLUG */}
        <div>
          <Label>URL Personalizada (slug)</Label>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="mi-restaurante-unico"
              value={restaurant.slug || ""}
              onChange={(e) => {
                const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                setRestaurant({ ...restaurant, slug: newSlug });
                checkSlugAvailability(newSlug);
              }}
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${restaurant.slug}`;
                window.open(url, "_blank");
              }}
              disabled={!restaurant.slug}
            >
              Ver Menú
            </Button>
          </div>
          <p className="text-sm text-gray-500">Tus clientes podrán verla y ordenarte aquí.</p>
        </div>

        {/* Nombre del restaurante y descripción */}
        <div className="space-y-4">
          <div>
            <Label>Nombre del Restaurante</Label>
            <Input
              value={restaurant.name}
              onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea
              value={restaurant.description || ""}
              onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
            />
          </div>
        </div>

        {/* ADDRESS */}
        <div>
          <Label>Dirección Completa</Label>
          <Textarea
            value={restaurant.address || ""}
            onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
          />
        </div>

        {/* IMAGES */}
        <div className="space-y-4 pt-4">
          <h4 className="font-medium">Imágenes del Restaurante</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cover */}
            <div>
              <Label>Imagen de Portada</Label>
              <div className="mt-2">
                <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {restaurant.cover_image_url ? (
                    <img src={restaurant.cover_image_url} alt="Portada" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Subir imagen de portada</p>
                    </div>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadImage(file, "cover");
                  }}
                />
              </div>
            </div>

            {/* Profile */}
            <div>
              <Label>Logo / Imagen de Perfil</Label>
              <div className="mt-2">
                <div className="w-24 h-24 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto overflow-hidden">
                  {restaurant.logo_image_url ? (
                    <img src={restaurant.logo_image_url} alt="Logo" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Logo</p>
                    </div>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadImage(file, "profile");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
