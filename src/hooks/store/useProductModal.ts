"use client";

import { useState } from "react";
import { Product } from "@/types/store/product";
import { CartItem } from "@/types/store/cart";

type Mode = "add" | "edit";

export default function useProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mode, setMode] = useState<Mode>("add");
  const [cartItem, setCartItem] = useState<CartItem | undefined>(undefined);

  const openAddModal = (product: Product) => {
    setSelectedProduct(product);
    setCartItem(undefined);
    setMode("add");
    setIsOpen(true);
  };

  const openEditModal = (product: Product, item: CartItem) => {
    setSelectedProduct(product);
    setCartItem(item);
    setMode("edit");
    setIsOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setCartItem(undefined);
    setMode("add");
    setIsOpen(false);
  };

  return {
    isOpen,
    selectedProduct,
    mode,
    cartItem,
    openAddModal,
    openEditModal,
    closeModal,
  };
}
