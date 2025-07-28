"use client";

import { AlertTriangle } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BusinessTabs } from "@/components/dashboard/business/Tabs";
import { General } from "@/components/dashboard/business/General";
import { Contact } from "@/components/dashboard/business/Contact";
import { Hours } from "@/components/dashboard/business/Hours";
import { Orders } from "@/components/dashboard/business/Orders";
import { useBusinessSettings } from "@/hooks/dashboard/useBusinessSettings";
import { useRouter } from "next/navigation";

export default function NegocioPage() {
  const {
    restaurant,
    setRestaurant,
    loading,
    error,
    checkSlugAvailability,
    handleUploadImage,
  } = useBusinessSettings();

  const router = useRouter();

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => router.refresh()}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (loading || !restaurant) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
            Configuración del Restaurante
          </h2>
          <p className="text-gray-600">
            Administra la información y configuración de tu negocio
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <BusinessTabs />

        <TabsContent value="general">
          <General
            restaurant={restaurant}
            setRestaurant={setRestaurant}
            checkSlugAvailability={checkSlugAvailability}
            handleUploadImage={handleUploadImage}
          />
        </TabsContent>

        <TabsContent value="contact">
          <Contact restaurant={restaurant} setRestaurant={setRestaurant} />
        </TabsContent>

        <TabsContent value="hours">
          <Hours restaurant={restaurant} setRestaurant={setRestaurant} />
        </TabsContent>

        <TabsContent value="delivery">
          <Orders restaurant={restaurant} setRestaurant={setRestaurant} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
