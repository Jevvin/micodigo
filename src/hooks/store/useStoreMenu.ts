"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { Product } from "@/types/store/product";
import { useRestaurantStore } from "@/hooks/store/useRestaurantStore";
import { notFound } from "next/navigation";

type ProductWithCategory = Product & {
  menu_categories?: {
    name: string;
    sort_order: number;
    is_active: boolean;
  };
};

const isCacheExpired = (timestamp: string | null): boolean => {
  if (!timestamp) return true;
  const now = Date.now();
  const saved = new Date(timestamp).getTime();
  return now - saved > 10 * 60 * 1000; // 10 minutos
};

export function useStoreMenu(restaurantSlug: string) {
  const {
    restaurant,
    products,
    categories,
    extrasMap,
    lastUpdated,
    setRestaurant,
    setProducts,
    setCategories,
    setExtrasForProduct,
  } = useRestaurantStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      if (
        !isCacheExpired(lastUpdated) &&
        restaurant &&
        products.length > 0 &&
        categories.length > 0
      ) {
        setSelectedCategory(categories[0] || "");
        setLoading(false);
        return;
      }

     const { data: restaurantData, error: restaurantError } = await supabase
  .from("restaurants")
  .select("*, restaurant_hours(*)") // ⬅️ incluye todo, incluyendo tus campos nuevos
  .eq("slug", restaurantSlug)
  .single();



      if (restaurantError || !restaurantData) {
        notFound(); // ⬅️ Redirige al 404 inmediatamente
        return;
      }

      setRestaurant(restaurantData);

      const { data: productsData, error: productsError } = await supabase
        .from("menu_products")
        .select("*, menu_categories(name, sort_order, is_active)")
        .eq("restaurant_id", restaurantData.id)
        .eq("is_available", true)
        .order("sort_order", { ascending: true });

      if (productsError || !productsData) {
        setProducts([]);
        setCategories([]);
        setSelectedCategory("");
        setLoading(false);
        return;
      }

      const activeProducts = productsData.filter(
        (p) => p.menu_categories && p.menu_categories.is_active
      );

      setProducts(activeProducts);

      const seen = new Map<string, number>();
      activeProducts.forEach((p) => {
        if (p.menu_categories) {
          seen.set(p.menu_categories.name, p.menu_categories.sort_order);
        }
      });

      const uniqueCategories = Array.from(seen.entries())
        .sort((a, b) => a[1] - b[1])
        .map(([name]) => name);

      setCategories(uniqueCategories);
      setSelectedCategory(uniqueCategories[0] || "");

      for (const product of activeProducts) {
        const { data, error } = await supabase
          .from("product_extra_groups")
          .select(`
            id,
            sort_order,
            extra_groups (
              id,
              name,
              description,
              rule_type,
              is_required,
              is_included,
              max_selections,
              min_selections,
              is_visible,
              extras (
                id,
                name,
                price,
                stock,
                is_active,
                sort_order
              )
            )
          `)
          .eq("product_id", product.id)
          .order("sort_order", { ascending: true });

        const groups =
          !error && data
            ? data
                .map((row) => {
                  const group = Array.isArray(row.extra_groups)
                    ? row.extra_groups[0]
                    : row.extra_groups;
                  if (!group || group.is_visible === false) return null;

                  return {
                    id: group.id,
                    name: group.name,
                    description: group.description,
                    ruleType: group.rule_type,
                    isRequired: group.is_required,
                    isIncluded: group.is_included,
                    maxSelections: group.max_selections,
                    minSelections: group.min_selections,
                    extras: (group.extras ?? []).slice().sort((a: any, b: any) => a.sort_order - b.sort_order),
                    sortOrder: row.sort_order,
                  };
                })
                .filter((g) => g !== null)
            : [];

        setExtrasForProduct(product.id, groups);
      }

      const now = new Date().toISOString();
      localStorage.setItem("restaurant-store-lastUpdated", now);
      setLoading(false);
    };

    if (restaurantSlug) fetchData();
  }, [restaurantSlug]);

  const filteredProducts = products.filter(
    (p) => p.menu_categories?.name === selectedCategory
  );

  return {
    restaurant, // ✅ Ya validado, nunca null
    categories,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
    products,
    extrasMap,
    loading,
  };
}
