"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/utils/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";


export default function RestaurantPage() {
  const params = useParams();
  const restaurantSlug = params.restaurantSlug as string;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState<string>("");

  const restaurantId = restaurantSlug;

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) {
  setRestaurant(null);
  setLoading(false);
  return;
}


      setLoading(true);

      const { data: restaurantData, error } = await supabase
  .from("restaurants")
  .select("*, restaurant_hours(*)")
  .eq("slug", restaurantSlug)
  .single();


      if (error || !restaurantData) {
        setRestaurant(null);
        setLoading(false);
        return;
      }

      setRestaurant(restaurantData);
      setLoading(false);
    };

    fetchRestaurant();
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurant || !restaurant.restaurant_hours) return;

    const updateStatus = () => {
      const now = new Date();
      const day = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const todayHours = restaurant.restaurant_hours.find(
        (h: any) => h.day_of_week === day
      );

      if (!todayHours || !todayHours.is_open || !todayHours.open_time || !todayHours.close_time) {
        setStatusText("Cerrado");
        return;
      }

      const [openH, openM] = todayHours.open_time.split(":").map(Number);
      const [closeH, closeM] = todayHours.close_time.split(":").map(Number);

      const openDate = new Date(now);
      openDate.setHours(openH, openM, 0, 0);

      const closeDate = new Date(now);
      closeDate.setHours(closeH, closeM, 0, 0);

      const minsToOpen = Math.floor((openDate.getTime() - now.getTime()) / 60000);
      const minsToClose = Math.floor((closeDate.getTime() - now.getTime()) / 60000);

      if (minsToOpen > 0 && minsToOpen <= 30) {
        setStatusText(`Abre en ${minsToOpen} min`);
      } else if (now >= openDate && now <= closeDate) {
        if (minsToClose > 0 && minsToClose <= 30) {
          setStatusText(`Cierra en ${minsToClose} min`);
        } else {
          setStatusText("Abierto");
        }
      } else {
        setStatusText("Cerrado");
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, [restaurant]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-lg">Cargando restaurante...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-red-500">Restaurante no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* PORTADA */}
      <div className="relative w-full h-[220px] overflow-hidden">
        {restaurant.cover_image_url ? (
          <img
            src={restaurant.cover_image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="bg-gray-200 w-full h-full flex items-center justify-center">
            <span className="text-gray-500">Sin imagen de portada</span>
          </div>
        )}

        <div className="absolute top-4 right-4">
          <Badge
            className={`text-white ${
              statusText.includes("Abierto") || statusText.includes("Abre")
                ? "bg-green-600"
                : statusText.includes("Cierra")
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          >
            {statusText}
          </Badge>
        </div>
      </div>

      {/* INFO HEADER */}
      <div className="bg-white shadow -mt-6 relative z-10 rounded-t-lg px-4 py-4 max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          {restaurant.logo_image_url ? (
            <img
              src={restaurant.logo_image_url}
              alt="Logo"
              className="w-16 h-16 rounded-full object-cover border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              Logo
            </div>
          )}

          <div>
            <h1 className="text-xl md:text-2xl font-bold">{restaurant.name}</h1>
            <p className="text-gray-600 text-sm">{restaurant.description}</p>
            <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
              <span>⭐ 4.8</span>
              <span>• 25-35 min</span>
              <span>• Envío $30</span>
            </div>
          </div>
        </div>

        <Button variant="outline" className="mt-4 md:mt-0">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Carrito
        </Button>
      </div>
      <Breadcrumbs />
    </div>
  );
}
