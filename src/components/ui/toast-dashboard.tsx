"use client";

import { toast } from "sonner";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type CustomToast = {
  id: number;
  dismiss: (id: number) => void;
};

type ToastProps = {
  t: CustomToast;
  message: string;
};

const TOAST_DURATION = 2000; // ms

export function DashboardToast({ t, message }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => toast.dismiss(t.id), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [t.id]);

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-xl border border-border bg-[#121826] text-white shadow-lg"
      )}
      style={{ "--toast-duration": `${TOAST_DURATION}ms` } as React.CSSProperties}
    >
      <div className="flex items-center px-4 py-3 gap-4">
        {/* Ícono de éxito */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500">
          <span className="text-sm">✓</span>
        </div>

        {/* Mensaje */}
        <p className="flex-1 text-sm font-medium">{message}</p>

        {/* Botón de cerrar */}
        <button
          className="text-white hover:text-gray-300 transition"
          onClick={() => toast.dismiss(t.id)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="h-1 w-full bg-green-500 animate-toast-bar rounded-b-xl" />
    </div>
  );
}
