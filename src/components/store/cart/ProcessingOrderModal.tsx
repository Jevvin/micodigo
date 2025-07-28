"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}

export default function ProcessingOrderModal({
  open,
  error,
  onRetry,
  onClose,
}: Props) {
  const isError = !!error;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold flex-wrap">
              {isError ? "Ocurrió un error" : "Procesando tu pedido..."}
            </DialogTitle>
          </div>
        </DialogHeader>

        <Separator />

        <div className="py-6 space-y-4 text-center">
          {!isError ? (
            <>
              <Loader2 className="h-10 w-10 mx-auto animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">
                Por favor espera mientras confirmamos tu pedido con el restaurante.
              </p>
            </>
          ) : (
            <>
              <XCircle className="h-10 w-10 mx-auto text-red-500" />
              <p className="text-sm text-muted-foreground">
                {error || "Hubo un problema al enviar tu pedido."}
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <Button onClick={onRetry}>Reintentar</Button>
                <Button variant="outline" onClick={onClose}>
                  Volver
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
