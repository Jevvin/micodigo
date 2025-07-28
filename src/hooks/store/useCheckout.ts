"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { CartItem } from "@/types/store/cart";
import { CustomerInfo, OrderPayload } from "@/types/store/order";

export interface CheckoutOrderData {
  customer: CustomerInfo;
  address: any;
  paymentMethod: "cash" | "card";
}

export default function useCheckout(cartItems: CartItem[], restaurantId: number) {
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    addressId: undefined,
    notes: "",
  });

  const [address, setAddress] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | null>(null);
  const [loading, setLoading] = useState(false);

  const [deliveryFee, setDeliveryFee] = useState<number>(30);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  // ✅ Calcular subtotal y total automáticamente al cambiar el carrito
  useEffect(() => {
    const newSubtotal = cartItems.reduce((sum, item) => {
      const extrasTotal = item.extras?.reduce((eSum, e) => eSum + e.price * (e.quantity ?? 1), 0) || 0;
      return sum + (item.price * item.quantity) + extrasTotal;
    }, 0);

    setSubtotal(newSubtotal);
    setTotal(newSubtotal + deliveryFee);
  }, [cartItems, deliveryFee]);

  const buildReserveItems = () => {
    const items = cartItems.map(item => ({
      id: item.productId,
      quantity: item.quantity,
      is_extra: false
    }));

    const extras = cartItems.flatMap(item =>
      (item.extras || []).map(extra => ({
        id: extra.id,
        quantity: extra.quantity,
        is_extra: true
      }))
    );

    return [...items, ...extras];
  };

  // ✅ Enviar el pedido
  const submitOrder = async (orderData: CheckoutOrderData) => {
    if (
      !orderData.customer.name.trim() ||
      !orderData.customer.phone.trim() ||
      (orderData.paymentMethod !== "cash" && orderData.paymentMethod !== "card") ||
      !orderData.address ||
      cartItems.length === 0
    ) {
      throw new Error("Datos incompletos");
    }

    setLoading(true);
    try {
      // 👉 1. Reservar stock
      const itemsForReserve = buildReserveItems();

      if (itemsForReserve.length === 0) {
        throw new Error("⚠️ El carrito está vacío o mal formateado. Nada para reservar.");
      }

      const { error: reserveError } = await supabase.rpc("reserve_stock", {
        p_restaurant_id: restaurantId,
        items: itemsForReserve,
      });

      if (reserveError) {
        throw new Error(reserveError.message || "No se pudo reservar stock");
      }

      // 👉 2. Calcular totales (usamos datos directos, no estados)
      const extrasTotal = cartItems.reduce(
        (sum, item) =>
          sum + (item.extras?.reduce((eSum, e) => eSum + e.price * (e.quantity ?? 1), 0) || 0),
        0
      );
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + extrasTotal;
      const deliveryFee = 30;
      const total = subtotal + deliveryFee;

      // 👉 3. Construir payload final
      const payload = {
        restaurantId,
        customer: orderData.customer,
        address: orderData.address,
        paymentMethod: orderData.paymentMethod,
        deliveryType: "delivery",
        specialInstructions: orderData.customer.notes || "",
        items: cartItems.map((item) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
          extras: (item.extras || []).map((e) => ({
            id: e.id,
            name: e.name,
            quantity: e.quantity,
            price: e.price,
          })),
        })),
        deliveryFee,
        subtotal,
        total,
      };

      // 👉 4. Enviar a la API
      const response = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Error al crear la orden");
      }

      setLoading(false);
      return result.confirmedOrder;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  return {
    customer,
    setCustomer,
    address,
    setAddress,
    paymentMethod,
    setPaymentMethod,
    submitOrder,
    loading,
    deliveryFee,
    subtotal,
    total,
  };
}
