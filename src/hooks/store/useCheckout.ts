"use client";

/**
 * useCheckout.ts
 * 
 * Hook para manejar la lógica del checkout.
 * 
 * - Datos del cliente
 * - Dirección de entrega
 * - Método de pago
 * - Validación simple
 * - Generar payload de pedido
 */

import { useState, useEffect } from "react";
import { CartItem } from "@/types/store/cart";
import { CustomerInfo, OrderPayload } from "@/types/store/order";

export default function useCheckout(cartItems: CartItem[], restaurantId: number) {
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    addressId: undefined,
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | null>(null);
  const [loading, setLoading] = useState(false);

  const [deliveryFee, setDeliveryFee] = useState<number>(30);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  // Calcular subtotal y total automáticamente al cambiar el carrito
  useEffect(() => {
    const newSubtotal = cartItems.reduce((sum, item) => {
      const extrasTotal = item.extras?.reduce((eSum, e) => eSum + e.price * (e.quantity ?? 1), 0) || 0;
      return sum + (item.price * item.quantity) + extrasTotal;
    }, 0);

    setSubtotal(newSubtotal);
    setTotal(newSubtotal + deliveryFee);
  }, [cartItems, deliveryFee]);

  const isValid = () => {
    return (
      customer.name.trim() !== "" &&
      customer.phone.trim() !== "" &&
      (paymentMethod === "cash" || paymentMethod === "card") &&
      cartItems.length > 0
    );
  };

  const generateOrderPayload = (): OrderPayload => ({
    restaurantId,
    customer,
    paymentMethod: paymentMethod!,
    items: cartItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes,
      extras: item.extras.map((e) => ({
        id: e.id,
        quantity: e.quantity,
        price: e.price,
      })),
    })),
    deliveryFee,
    subtotal,
    total,
  });

  const submitOrder = async () => {
    if (!isValid()) throw new Error("Datos incompletos");
    setLoading(true);
    try {
      const payload = generateOrderPayload();

      // Aquí se conectaría con Supabase o la API real
      console.log("Submitting order", payload);

      // Simular espera
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);

      return payload;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  return {
    customer,
    setCustomer,
    paymentMethod,
    setPaymentMethod,
    isValid,
    generateOrderPayload,
    submitOrder,
    loading,
    deliveryFee,
    subtotal,
    total
  };
}
