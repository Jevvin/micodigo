"use client";

/**
 * CheckoutModal.tsx
 * 
 * Modal para confirmar el pedido:
 * Copia el diseño del ProductDetailsModal:
 * - Overlay manual con fondo negro translúcido
 * - Card centrado con header propio y botón X
 * - Tu contenido con inputs, método de pago y resumen de costos
 * - Validación inline con borde rojo y mensaje de error
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";

export default function CheckoutModal({
  open,
  onClose,
  cartItems,
  onRemoveItem,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  cartItems: any[];
  onRemoveItem: (index: number) => void;
  onConfirm: (orderData: any) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  // Errores de validación
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const iva = Math.round(subtotal * 0.16);
  const envio = 30;
  const total = subtotal + iva + envio;

  const handleConfirm = () => {
    let hasError = false;

    if (!name.trim()) {
      setNameError("Por favor añade tu nombre");
      hasError = true;
    } else {
      setNameError("");
    }

    if (!phone.trim()) {
      setPhoneError("Por favor añade tu número de teléfono");
      hasError = true;
    } else {
      setPhoneError("");
    }

    if (hasError) return;

    const orderData = {
      customer: { name, phone, notes },
      paymentMethod,
      items: cartItems,
      subtotal,
      iva,
      envio,
      total,
    };

    onConfirm(orderData);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Confirmar pedido</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* LISTADO DEL CARRITO */}
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center">Tu carrito está vacío.</p>
          ) : (
            cartItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border rounded-lg p-3"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x ${item.price}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRemoveItem(index)}
                >
                  Quitar
                </Button>
              </div>
            ))
          )}

          {/* DATOS DEL CLIENTE */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Escribe tu nombre compeleto"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setNameError("");
                }}
                className={nameError ? "border-red-500 focus:border-red-500" : ""}
              />
              {nameError && (
                <p className="text-sm text-red-500">{nameError}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="Escribe tu número de contacto"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (e.target.value.trim()) setPhoneError("");
                }}
                className={phoneError ? "border-red-500 focus:border-red-500" : ""}
              />
              {phoneError && (
                <p className="text-sm text-red-500">{phoneError}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Añade instrucciones o requerimientos especiales"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* MÉTODO DE PAGO */}
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as "cash" | "card")}
              className="flex space-x-4"
            >
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash">Efectivo</Label>

              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card">Tarjeta</Label>
            </RadioGroup>
          </div>

          {/* RESUMEN DE COSTOS */}
          <div className="border-t pt-4 mt-4 space-y-1 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (16%):</span>
              <span>${iva}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío:</span>
              <span>${envio}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total:</span>
              <span>${total}</span>
            </div>
          </div>

          <Button
            disabled={cartItems.length === 0}
            onClick={handleConfirm}
            className="w-full bg-black text-white hover:bg-gray-900 mt-4"
          >
            Confirmar pedido
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
