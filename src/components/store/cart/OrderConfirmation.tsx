"use client";

/**
 * OrderConfirmation.tsx
 * 
 * Modal o componente para mostrar un mensaje de confirmación
 * después de que el usuario realiza el pedido exitosamente.
 * 
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - orderId: string | number
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function OrderConfirmation({
  open,
  onClose,
  orderId,
}: {
  open: boolean;
  onClose: () => void;
  orderId: string | number;
}) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span>¡Pedido confirmado!</span>
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-600">
          Tu pedido ha sido recibido exitosamente. Número de pedido:
        </p>
        <div className="my-2 text-lg font-bold text-green-700">
          #{orderId}
        </div>
        <p className="text-sm text-gray-500">
          Te notificaremos cuando tu pedido esté en preparación o camino.
        </p>

        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="bg-black text-white hover:bg-gray-900">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
