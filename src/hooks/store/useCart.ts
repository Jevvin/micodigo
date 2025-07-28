"use client";

import { create } from "zustand";
import { CartItem, CartItemExtra } from "@/types/store/cart";

interface CartState {
  items: CartItem[];

  isDrawerOpen: boolean;
  isCheckoutOpen: boolean;

  sortExtras: (extras?: CartItemExtra[]) => CartItemExtra[];

  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  increaseQty: (index: number) => void;
  decreaseQty: (index: number) => void;
  updateItem: (index: number, newItem: CartItem) => void; // ✅ NUEVA FUNCIÓN
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

  sortExtras: (extras) => {
    if (!extras) return [];
    return extras.slice().sort((a, b) => {
      if (a.extra_group_sort_order !== b.extra_group_sort_order) {
        return a.extra_group_sort_order - b.extra_group_sort_order;
      }
      return a.extra_sort_order - b.extra_sort_order;
    });
  },

  addItem: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        {
          ...item,
          extras: get().sortExtras(item.extras),
        },
      ],
    })),

  removeItem: (index) =>
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    })),

  increaseQty: (index) =>
    set((state) => {
      const updatedItems = [...state.items];
      updatedItems[index].quantity += 1;
      return { items: updatedItems };
    }),

  decreaseQty: (index) =>
    set((state) => {
      const updatedItems = [...state.items];
      if (updatedItems[index].quantity > 1) {
        updatedItems[index].quantity -= 1;
      } else {
        updatedItems.splice(index, 1);
      }
      return { items: updatedItems };
    }),

  // ✅ Nueva función para reemplazar un producto del carrito por uno actualizado
  updateItem: (index, newItem) =>
    set((state) => {
      const updatedItems = [...state.items];
      updatedItems[index] = {
        ...newItem,
        extras: get().sortExtras(newItem.extras),
      };
      return { items: updatedItems };
    }),

  clearCart: () => set({ items: [] }),

  getTotal: () =>
    get().items.reduce((sum, item) => {
      const extrasTotal = item.extras
        ? item.extras.reduce((eSum, e) => eSum + e.price * e.quantity, 0)
        : 0;
      return sum + (item.price + extrasTotal) * item.quantity;
    }, 0),

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),

  openCheckout: () => set({ isCheckoutOpen: true }),
  closeCheckout: () => set({ isCheckoutOpen: false }),
}));

export default useCartStore;
