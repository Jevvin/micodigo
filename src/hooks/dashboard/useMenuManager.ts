"use client";

import { useCallback, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Category, Product } from "@/types/menu";
import { toastDashboard } from "@/components/ui/toast-dashboard";

const supabase = createClientComponentClient();

export function useMenuManager() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadRestaurantId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("restaurants")
      .select("id")
      .eq("user_id", user.id)
      .single();
    setRestaurantId(data?.id ?? null);
  }, []);

  const loadMenu = useCallback(async () => {
    if (!restaurantId) return;

    const { data: catData } = await supabase
      .from("menu_categories")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("sort_order", { ascending: true });

    if (!catData) return;

    const categoriesWithProducts: Category[] = [];

    for (const cat of catData) {
      const { data: products } = await supabase
        .from("menu_products")
        .select("*")
        .eq("category_id", cat.id)
        .order("sort_order", { ascending: true });

      const formattedProducts: Product[] = (products ?? []).map((p) => ({
        id: p.id,
        categoryId: p.category_id,
        restaurantId: p.restaurant_id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        isAvailable: p.is_available,
        image: p.image,
        sortOrder: p.sort_order,
        assignedExtraGroups: [],
      }));

      categoriesWithProducts.push({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        isActive: cat.is_active,
        sortOrder: cat.sort_order,
        products: formattedProducts,
      });
    }

    setCategories(categoriesWithProducts);
  }, [restaurantId]);

  useEffect(() => {
    loadRestaurantId();
  }, [loadRestaurantId]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const handleReorderCategories = async (newOrder: Category[]) => {
    setCategories(newOrder);

    for (let i = 0; i < newOrder.length; i++) {
      await supabase
        .from("menu_categories")
        .update({ sort_order: i })
        .eq("id", newOrder[i].id);
    }

    toastDashboard("Cambios guardados");
  };

  const handleReorderProducts = async (categoryId: string, newProducts: Product[]) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, products: newProducts } : cat
      )
    );

    for (let i = 0; i < newProducts.length; i++) {
      await supabase
        .from("menu_products")
        .update({ sort_order: i })
        .eq("id", newProducts[i].id);
    }

    toastDashboard("Cambios guardados");
  };

  const handleSaveCategory = async (category: Category) => {
    if (!restaurantId) return;

    if (!category.id) {
      const { data } = await supabase
        .from("menu_categories")
        .insert({
          name: category.name,
          description: category.description,
          is_active: category.isActive,
          restaurant_id: restaurantId,
          sort_order: categories.length,
        })
        .select()
        .single();

      if (data) {
        setCategories([
          ...categories,
          {
            ...category,
            id: data.id,
            sortOrder: data.sort_order,
            products: [],
          },
        ]);
        toastDashboard("Cambios guardados");
      }
    } else {
      await supabase
        .from("menu_categories")
        .update({
          name: category.name,
          description: category.description,
          is_active: category.isActive,
        })
        .eq("id", category.id);

      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? category : c))
      );

      toastDashboard("Cambios guardados");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await supabase.from("menu_categories").delete().eq("id", categoryId);
    await supabase.from("menu_products").delete().eq("category_id", categoryId);

    setCategories((prev) => prev.filter((c) => c.id !== categoryId));

    toastDashboard("Cambios guardados");
  };

  const handleUpdateProduct = async (categoryId: string, product: Product) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat || !restaurantId) return;

    const isNew = String(product.id).startsWith("prod-");

    if (isNew) {
      const { data: newProd } = await supabase
        .from("menu_products")
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          is_available: product.isAvailable,
          image: product.image,
          category_id: categoryId,
          restaurant_id: restaurantId,
          sort_order: cat.products.length,
        })
        .select()
        .single();

      if (!newProd) return;

      for (const assigned of product.assignedExtraGroups) {
        await supabase.from("product_extra_groups").insert({
          product_id: newProd.id,
          extra_group_id: assigned.extraGroupId,
          sort_order: assigned.sortOrder,
        });
      }

      const newProduct: Product = {
        ...product,
        id: newProd.id,
        categoryId,
        restaurantId,
        sortOrder: newProd.sort_order,
      };

      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, products: [...c.products, newProduct] }
            : c
        )
      );

      toastDashboard("Cambios guardados");
    } else {
      await supabase
        .from("menu_products")
        .update({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          is_available: product.isAvailable,
          image: product.image,
        })
        .eq("id", product.id);

      await supabase
        .from("product_extra_groups")
        .delete()
        .eq("product_id", product.id);

      for (const assigned of product.assignedExtraGroups) {
        await supabase.from("product_extra_groups").insert({
          product_id: product.id,
          extra_group_id: assigned.extraGroupId,
          sort_order: assigned.sortOrder,
        });
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                products: c.products.map((p) =>
                  p.id === product.id
                    ? { ...product, categoryId, restaurantId }
                    : p
                ),
              }
            : c
        )
      );

      toastDashboard("Cambios guardados");
    }
  };

  const handleDeleteProduct = async (categoryId: string, productId: string) => {
    await supabase.from("menu_products").delete().eq("id", productId);
    await supabase.from("product_extra_groups").delete().eq("product_id", productId);

    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? { ...c, products: c.products.filter((p) => p.id !== productId) }
          : c
      )
    );

    toastDashboard("Cambios guardados");
  };

  return {
    categories,
    setCategories,
    restaurantId,
    handleReorderCategories,
    handleReorderProducts,
    handleSaveCategory,
    handleDeleteCategory,
    handleUpdateProduct,
    handleDeleteProduct,
  };
}
