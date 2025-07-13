"use client";

/**
 * ordercontext.tsx
 * 
 * Contexto global para manejar el estado del pedido en seguimiento
 * (order tracking) en la tienda pública.
 */

import { createContext, useContext, useState, ReactNode } from "react";
import { Order } from "@/types/store/order";

interface OrderContextType {
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const clearOrder = () => setCurrentOrder(null);

  return (
    <OrderContext.Provider value={{ currentOrder, setCurrentOrder, clearOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrderContext debe usarse dentro de OrderProvider");
  return context;
};
