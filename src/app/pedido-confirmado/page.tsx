"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Truck,
  CookingPot,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateWhatsappMessage } from "@/components/store/whatsapp/GenerateWhatsappMessage";

// Tipos

type Extra = {
  name: string;
  quantity: number;
  price: number;
};

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  extras?: Extra[];
};

type ConfirmedOrder = {
  orderId: number;
  restaurantName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryType: "delivery" | "pickup";
  restaurantPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "cash" | "card";
  isPaid: boolean;
  cashReceived?: number;
  status: string;
};

export default function PedidoConfirmadoPage() {
  const router = useRouter();
  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Primer useEffect: localStorage y llamada inicial
  useEffect(() => {
    const saved = localStorage.getItem("confirmed_order");
    if (saved) {
      const parsed = JSON.parse(saved);
      setOrder(parsed);
      fetch(`/api/store/tracking?orderId=${parsed.orderId}`)
        .then((res) => res.json())
        .then((data) => {
          setStatus(data.order?.status ?? parsed.status);
        })
        .catch((err) => {
          console.error("Error consultando estado actualizado:", err);
          setStatus(parsed.status);
        });
    } else {
      router.replace("/");
    }
  }, [router]);

  // Segundo useEffect: polling 5s
  useEffect(() => {
    if (!order?.orderId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/store/tracking?orderId=${order.orderId}`);
        const data = await res.json();
        if (data?.order?.status && data.order.status !== status) {
          setStatus(data.order.status);
        }
      } catch (error) {
        console.error("Error al obtener estado del pedido:", error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [order?.orderId, status]);

  // ✅ Validación de estado cargado
  if (!order || !status) return null;

  const getStatusInfo = (status: string | null) => {
    switch (status) {
      case "accepted":
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-600 mb-4" />,
          title: "Pedido aceptado",
          text: "Tu pedido fue aceptado. ¡En breve comenzarán a prepararlo!",
        };
      case "preparing":
        return {
          icon: <CookingPot className="w-12 h-12 text-orange-500 mb-4" />,
          title: "Preparando tu pedido...",
          text: "Tu pedido está siendo preparado.",
        };
      case "out_for_delivery":
        return {
          icon: <Truck className="w-12 h-12 text-blue-600 mb-4" />,
          title: "Pedido en camino",
          text: "¡Tu pedido va en camino!",
        };
      case "ready":
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-600 mb-4" />,
          title: "Pedido listo para recoger",
          text: "Tu pedido está listo. Puedes recogerlo en el restaurante.",
        };
      case "delivered":
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-600 mb-4" />,
          title: "Pedido entregado",
          text: "¡Gracias por tu compra! Tu pedido ha sido entregado.",
        };
      case "rejected":
        return {
          icon: <XCircle className="w-12 h-12 text-red-500 mb-4" />,
          title: "Pedido rechazado",
          text: "Tu pedido fue rechazado. Consulta por WhatsApp el motivo de la cancelación.",
        };
      default:
        return {
          icon: <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />,
          title: "Esperando confirmación...",
          text: "Estamos esperando que el restaurante confirme tu pedido.",
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gray-50 text-center">
      {statusInfo.icon}
      <h1 className="text-2xl font-bold mb-2">{statusInfo.title}</h1>
      <p className="text-gray-600 mb-6">{statusInfo.text}</p>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-left mb-6">
        <h2 className="text-lg font-semibold mb-3">Resumen del pedido</h2>
        <ul className="space-y-4">
          {order.items.map((item, idx) => (
            <li key={idx}>
              <div className="flex justify-between font-medium">
                <span>
                  {item.quantity} x {item.name}
                </span>
                <span>${item.price}</span>
              </div>
              {item.extras && item.extras.length > 0 && (
                <ul className="pl-4 mt-1 text-sm text-gray-500 space-y-1">
                  {item.extras.map((extra, i) => (
                    <li key={i}>
                      {extra.quantity} x {extra.name} (${extra.price})
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 font-bold text-right text-lg">
          Total: ${order.total}
        </div>
      </div>

      <Button
        className="bg-green-600 hover:bg-green-700 text-white w-full max-w-md flex items-center justify-center gap-2"
        onClick={() => {
          const message = encodeURIComponent(generateWhatsappMessage(order));
          const phone = order.restaurantPhone?.replace(/\D/g, "");
          const whatsappUrl = phone
            ? `https://wa.me/${phone}?text=${message}`
            : `https://wa.me/?text=${message}`;
          window.open(whatsappUrl, "_blank");
        }}
      >
        <SiWhatsapp className="w-5 h-5" />
        Enviar pedido por WhatsApp
      </Button>

      <div className="mt-6 text-sm text-gray-500">
        Estado actual:{" "}
        <span className="font-semibold text-gray-700 capitalize">
          {statusInfo.title}
        </span>
      </div>
    </div>
  );
}