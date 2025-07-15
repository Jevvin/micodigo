"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Cart, CartItem, CartItemExtra } from "@/types/store/cart";

interface CartContextType {
  cart: Cart;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  updateQuantity: (productId: number, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    deliveryFee: 30,
    total: 30,
  });

  const recalculateTotals = (items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => {
      const extrasTotal = item.extras?.reduce((eSum, e) => eSum + e.price * (e.quantity ?? 1), 0) || 0;
      return sum + (item.price * item.quantity) + extrasTotal;
    }, 0);
    const deliveryFee = cart.deliveryFee;
    const total = subtotal + deliveryFee;
    return { subtotal, deliveryFee, total };
  };

  const sortExtras = (extras?: CartItemExtra[]) => {
    if (!extras) return [];
    return extras.slice().sort((a, b) => {
      if (a.extra_group_sort_order !== b.extra_group_sort_order) {
        return a.extra_group_sort_order - b.extra_group_sort_order;
      }
      return a.extra_sort_order - b.extra_sort_order;
    });
  };

  const addItem = (item: CartItem) => {
    // ✅ Ordenar extras antes de guardar en el carrito
    const sortedExtras = sortExtras(item.extras);

    setCart((prev) => {
      const existingIndex = prev.items.findIndex((i) => i.productId === item.productId);
      let newItems = [...prev.items];

      if (existingIndex > -1) {
        newItems[existingIndex].quantity += item.quantity;
        newItems[existingIndex].extras = sortedExtras;
        newItems[existingIndex].notes = item.notes;
      } else {
        newItems.push({ ...item, extras: sortedExtras });
      }

      const totals = recalculateTotals(newItems);
      return { ...prev, items: newItems, ...totals };
    });
  };

  const removeItem = (productId: number) => {
    setCart((prev) => {
      const newItems = prev.items.filter((i) => i.productId !== productId);
      const totals = recalculateTotals(newItems);
      return { ...prev, items: newItems, ...totals };
    });
  };

  const clearCart = () => {
    setCart({
      items: [],
      subtotal: 0,
      deliveryFee: 30,
      total: 30,
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCart((prev) => {
      const newItems = prev.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      const totals = recalculateTotals(newItems);
      return { ...prev, items: newItems, ...totals };
    });
  };

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, clearCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCartContext debe usarse dentro de CartProvider");
  return context;
};
