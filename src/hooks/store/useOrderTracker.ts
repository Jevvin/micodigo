"use client";

/**
 * useOrderTracker.ts
 * 
 * Hook para hacer polling y obtener el estado en vivo de un pedido.
 * 
 * Props:
 * - orderId
 * 
 * Retorna:
 * - orderStatus
 * - isLoading
 * - error
 */

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { OrderStatus } from "@/types/store/order";

export default function useOrderTracker(orderId: number | null) {
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    if (!orderId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setStatus(data?.status || null);
    setLoading(false);
  };

  useEffect(() => {
    if (!orderId) return;

    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
    }, 10000); // Poll cada 10 segundos

    return () => clearInterval(interval);
  }, [orderId]);

  return { status, loading, error };
}
