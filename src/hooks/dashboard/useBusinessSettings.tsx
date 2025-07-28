"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabaseClient";
import type { Restaurant, RestaurantHours } from "@/types/business";
import { DashboardToast } from "@/components/ui/toast-dashboard";
import type { CustomToast } from "@/components/ui/toast-dashboard";
import { toast } from "sonner";

function deepEqual(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export function useBusinessSettings() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const originalRef = useRef<Restaurant | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Toast reutilizable
  const showToast = (message: string) => {
    toast.custom((t) => (
      <DashboardToast t={t as unknown as CustomToast} message={message} />
    ));
  };

  // Cargar datos iniciales
  useEffect(() => {
    const fetchRestaurant = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setError("No autenticado");

      const { data, error } = await supabase
        .from("restaurants")
        .select("*, restaurant_hours(*)")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setError("No se encontró el restaurante.");
      } else {
        setRestaurant(data as Restaurant);
        originalRef.current = data as Restaurant;
      }

      setLoading(false);
    };

    fetchRestaurant();
  }, []);

  // Autosave al detectar cambios
  useEffect(() => {
    if (!restaurant || !originalRef.current) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      const hasChanged = !deepEqual(
        normalizeRestaurant(restaurant),
        normalizeRestaurant(originalRef.current!)
      ) || !deepEqual(restaurant.restaurant_hours, originalRef.current!.restaurant_hours);

      if (!hasChanged) return;

      setSaving(true);

      try {
        const updates = normalizeRestaurant(restaurant);

        const { error: restaurantError } = await supabase
          .from("restaurants")
          .update(updates)
          .eq("id", restaurant.id);

        if (restaurantError) throw restaurantError;

        // Actualizar horarios
        const hourResults = await Promise.all(
          (restaurant.restaurant_hours || []).map((h: RestaurantHours) =>
            supabase
              .from("restaurant_hours")
              .update({
                is_open: h.is_open,
                open_time: h.open_time,
                close_time: h.close_time,
              })
              .eq("id", h.id)
          )
        );

        const hourError = hourResults.find((r) => r.error);
        if (hourError) throw hourError.error;

        originalRef.current = {
  ...restaurant,
  ...normalizeRestaurant(restaurant),
};
        showToast("Cambios guardados");
        router.refresh();
      } catch (err: any) {
        toast.error("Error al guardar cambios");
      } finally {
        setSaving(false);
      }
    }, 1000);
  }, [restaurant]);

  const normalizeRestaurant = (r: Restaurant) => ({
    name: r.name,
    description: r.description,
    address: r.address,
    phone: r.phone,
    email: r.email,
    cover_image_url: r.cover_image_url,
    logo_image_url: r.logo_image_url,
    delivery_fee: r.delivery_fee,
    min_order_amount: r.min_order_amount,
    delivery_radius: r.delivery_radius,
    slug: r.slug?.trim(),
    accepting_orders: r.accepting_orders,
    accepts_delivery: r.accepts_delivery,
    accepts_pickup: r.accepts_pickup,
  });

  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("restaurants")
      .select("id")
      .eq("slug", slug)
      .single();
    return !data && !error;
  };

  const handleUploadImage = async (
    file: File,
    type: "cover" | "profile"
  ): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from("restaurant-images")
      .upload(fileName, file);
    if (error) throw error;

    const { publicUrl } = supabase.storage
      .from("restaurant-images")
      .getPublicUrl(fileName).data;

    return publicUrl;
  };

  return {
    restaurant,
    setRestaurant,
    loading,
    saving,
    error,
    checkSlugAvailability,
    handleUploadImage,
  };
}
