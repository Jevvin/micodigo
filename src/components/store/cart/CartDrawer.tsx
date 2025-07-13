"use client";

/**
 * CartDrawer.tsx
 *
 * Drawer lateral para mostrar el carrito de compras.
 * Incluye listado de productos, extras, notas, subtotales y botón para ir a checkout.
 */

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function CartDrawer({
  open,
  onClose,
  cartItems,
  onRemoveItem,
  onProceedToCheckout,
}: {
  open: boolean;
  onClose: () => void;
  cartItems: any[];
  onRemoveItem: (id: number) => void;
  onProceedToCheckout: () => void;
}) {
  /** Calcular total incluyendo extras */
  const subtotal = cartItems.reduce((sum, item) => {
    const extrasTotal = item.extras
      ? item.extras.reduce((eSum: number, e: any) => eSum + e.price * e.quantity, 0)
      : 0;
    return sum + (item.price * item.quantity) + extrasTotal;
  }, 0);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full max-w-sm flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center">
            Carrito
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 mt-4 space-y-4">
          {cartItems.length === 0 && (
            <p className="text-gray-500 text-center mt-10">Tu carrito está vacío.</p>
          )}

          {cartItems.map((item, index) => {
            const itemExtrasTotal = item.extras
              ? item.extras.reduce((eSum: number, e: any) => eSum + e.price * e.quantity, 0)
              : 0;
            const itemSubtotal = (item.price * item.quantity) + itemExtrasTotal;

            return (
              <div
                key={index}
                className="flex flex-col border rounded-lg p-3 bg-gray-50 space-y-2"
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} x ${item.price}
                    </p>

                    {item.notes && (
                      <p className="text-xs text-gray-500 italic mt-1">
                        Nota: {item.notes}
                      </p>
                    )}

                    {item.extras && item.extras.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium">Extras:</p>
                        {item.extras.map((extra: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs text-gray-600">
                            <span>
                              {extra.quantity} x {extra.name}
                            </span>
                            <span>${extra.price * extra.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(index)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="flex justify-between text-sm font-medium text-green-700 pt-1 border-t">
                  <span>Subtotal:</span>
                  <span>${itemSubtotal}</span>
                </div>
              </div>
            );
          })}
        </ScrollArea>

        <div className="border-t pt-4 mt-4 space-y-2">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>${subtotal}</span>
          </div>
          <Button
            className="w-full bg-black text-white hover:bg-gray-900"
            disabled={cartItems.length === 0}
            onClick={onProceedToCheckout}
          >
            Proceder al Pago
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
