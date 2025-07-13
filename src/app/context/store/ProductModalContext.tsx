"use client";

/**
 * productmodalcontext.tsx
 * 
 * Contexto global para manejar el estado del modal de detalles de producto
 * en la tienda pública.
 * 
 * Permite abrir/cerrar el modal y compartir el producto actual seleccionado.
 */

import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/types/store/product";

interface ProductModalContextType {
  selectedProduct: Product | null;
  open: boolean;
  openModal: (product: Product) => void;
  closeModal: () => void;
}

const ProductModalContext = createContext<ProductModalContextType | undefined>(undefined);

export const ProductModalProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setOpen(false);
  };

  return (
    <ProductModalContext.Provider value={{ selectedProduct, open, openModal, closeModal }}>
      {children}
    </ProductModalContext.Provider>
  );
};

export const useProductModalContext = () => {
  const context = useContext(ProductModalContext);
  if (!context) throw new Error("useProductModalContext debe usarse dentro de ProductModalProvider");
  return context;
};
