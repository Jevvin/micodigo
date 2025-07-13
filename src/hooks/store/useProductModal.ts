"use client";

/**
 * useProductModal.ts
 * 
 * Hook para controlar la apertura/cierre del modal de detalles de producto.
 * 
 * Retorna:
 * - selectedProduct
 * - isOpen
 * - openModal(product)
 * - closeModal()
 */

import { useState } from "react";
import { Product } from "@/types/store/product";

export default function useProductModal() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsOpen(false);
  };

  return {
    selectedProduct,
    isOpen,
    openModal,
    closeModal
  };
}
