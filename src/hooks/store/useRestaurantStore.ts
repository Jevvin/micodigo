"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Restaurant } from "@/types/store/store";
import { Product } from "@/types/store/product";

type ExtrasGroup = {
  id: number;
  name: string;
  description: string;
  ruleType: string;
  isRequired: boolean;
  isIncluded: boolean;
  maxSelections: number;
  minSelections: number;
  extras: any[];
  sortOrder: number;
};

type OrderType = "delivery" | "pickup" | null;

interface RestaurantStoreState {
  restaurant: Restaurant | null;
  products: Product[];
  categories: string[];
  extrasMap: Record<number, ExtrasGroup[]>;
  lastUpdated: string | null;
  orderType: OrderType;
  setRestaurant: (restaurant: Restaurant) => void;
  setProducts: (products: Product[]) => void;
  setCategories: (categories: string[]) => void;
  setExtrasForProduct: (productId: number, extras: ExtrasGroup[]) => void;
  setOrderType: (type: OrderType) => void;
  clearStore: () => void;
}

export const useRestaurantStore = create<RestaurantStoreState>()(
  persist(
    (set) => ({
      restaurant: null,
      products: [],
      categories: [],
      extrasMap: {},
      lastUpdated: null,
      orderType: null,
      setRestaurant: (restaurant) => set({ restaurant }),
      setProducts: (products) => set({ products }),
      setCategories: (categories) => set({ categories }),
      setExtrasForProduct: (productId, extras) =>
        set((state) => ({
          extrasMap: {
            ...state.extrasMap,
            [productId]: extras,
          },
        })),
      setOrderType: (type) => set({ orderType: type }),
      clearStore: () =>
        set({
          restaurant: null,
          products: [],
          categories: [],
          extrasMap: {},
          lastUpdated: null,
          orderType: null,
        }),
    }),
    {
      name: "restaurant-store",
      partialize: (state) => ({
        restaurant: state.restaurant,
        products: state.products,
        categories: state.categories,
        extrasMap: state.extrasMap,
        lastUpdated: state.lastUpdated,
        orderType: state.orderType, // Incluido para mantener selección entre recargas
      }),
      version: 1,
    }
  )
);
