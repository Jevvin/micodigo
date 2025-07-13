"use client";

/**
 * OrderStatusTracker.tsx
 * 
 * Componente para mostrar el seguimiento en vivo del estado de un pedido.
 * 
 * Props:
 * - status: string
 * - estimatedDelivery: string | null
 */

import { CheckCircle, Clock, Truck, PackageCheck } from "lucide-react";

const STATUS_STEPS = [
  { key: "new", label: "Nuevo", icon: Clock },
  { key: "preparing", label: "Preparando", icon: PackageCheck },
  { key: "ready", label: "Listo para Entregar", icon: CheckCircle },
  { key: "out_for_delivery", label: "En Camino", icon: Truck },
  { key: "delivered", label: "Entregado", icon: CheckCircle },
];

export default function OrderStatusTracker({
  status,
  estimatedDelivery,
}: {
  status: string;
  estimatedDelivery: string | null;
}) {
  const currentIndex = STATUS_STEPS.findIndex((step) => step.key === status);

  return (
    <div className="w-full max-w-xl mx-auto p-4 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold text-gray-900 text-center">
        Estado de tu pedido
      </h2>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 md:space-x-4">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center md:flex-col text-center md:text-left space-x-2 md:space-x-0 md:space-y-1">
              <Icon
                className={`h-6 w-6 ${
                  isCompleted ? "text-green-600" : "text-gray-400"
                }`}
              />
              <span
                className={`text-sm ${
                  isCompleted ? "text-green-700 font-semibold" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {estimatedDelivery && status === "out_for_delivery" && (
        <p className="text-center text-sm text-gray-600 mt-2">
          Tiempo estimado de entrega: <strong>{estimatedDelivery}</strong>
        </p>
      )}
    </div>
  );
}
