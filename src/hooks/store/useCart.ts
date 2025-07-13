"use client";

/**
 * src/hooks/store/useCart.ts
 * 
 * Hook global con Zustand para manejar el estado del carrito.
 * 
 * - items en el carrito
 * - isDrawerOpen (estado del Drawer lateral)
 * - isCheckoutOpen (estado del modal de checkout)
 * - addItem / removeItem / clearCart
 * - getTotal con extras
 * - open/closeDrawer() y open/closeCheckout() para UI
 */

import { create } from "zustand";
import { CartItem } from "@/types/store/cart";

interface CartState {
  items: CartItem[];

  isDrawerOpen: boolean;
  isCheckoutOpen: boolean;

  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  getTotal: () => number;

  openDrawer: () => void;
  closeDrawer: () => void;

  openCheckout: () => void;
  closeCheckout: () => void;
}

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isDrawerOpen: false,
  isCheckoutOpen: false,

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  removeItem: (index) =>
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    })),

  clearCart: () => set({ items: [] }),

  getTotal: () =>
    get().items.reduce((sum, item) => {
      const extrasTotal = item.extras
        ? item.extras.reduce((eSum, e) => eSum + e.price * e.quantity, 0)
        : 0;
      return sum + (item.price * item.quantity) + extrasTotal;
    }, 0),

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),

  openCheckout: () => set({ isCheckoutOpen: true }),
  closeCheckout: () => set({ isCheckoutOpen: false }),
}));

export default useCartStore;
