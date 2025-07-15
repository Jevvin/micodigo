"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { X } from "lucide-react";
import { CartItemExtra } from "@/types/store/cart";

export default function ProductDetailsModal({
  open,
  onClose,
  product,
  onAddToCart,
  extraGroups
}: {
  open: boolean;
  onClose: () => void;
  product: any;
  onAddToCart: (item: any) => void;
  extraGroups: any[];
}) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<CartItemExtra[]>([]);

  if (!open || !product) return null;

  const handleToggleExtra = (groupId: number, extra: any, ruleType: string) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.id === extra.id);

      if (ruleType === "single") {
        const filtered = prev.filter((e) => e.groupId !== groupId);
        return exists ? filtered : [...filtered, { ...extra, quantity: 1, groupId }];
      }

      if (ruleType === "multiple") {
        return exists
          ? prev.filter((e) => e.id !== extra.id)
          : [...prev, { ...extra, quantity: 1, groupId }];
      }

      return prev;
    });
  };

  // ✅ Calcula TOTAL DE EXTRAS para UNA unidad
  const extrasTotalSingle = selectedExtras.reduce(
    (sum, e) => sum + (e.price * (e.quantity || 1)),
    0
  );

  // ✅ Multiplica por la cantidad de productos seleccionados
  const totalPrice = ((product.price + extrasTotalSingle) * quantity);

  const handleAddToCart = () => {
    const item = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      notes,
      extras: selectedExtras,
      extrasTotal: extrasTotalSingle,
      image: product.image
    };
    onAddToCart(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{product.name}</CardTitle>
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
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-64 object-cover rounded-lg"
          />

          <p className="text-gray-700">{product.description}</p>

          <div className="space-y-2">
            <p className="font-medium">Precio base: ${product.price}</p>

            {/* Extras en acordeón */}
            {extraGroups && extraGroups.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Extras:</p>
                <Accordion type="multiple" className="w-full">
                  {extraGroups.map((group: any) => (
                    <AccordionItem key={group.id} value={group.id.toString()}>
                      <AccordionTrigger>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{group.name}</span>
                          <span className="text-xs text-gray-500">{group.description}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {group.extras && group.extras.length > 0 ? (
                            group.extras.map((extra: any) => {
                              const selected = selectedExtras.find((e) => e.id === extra.id);
                              return (
                                <Button
                                  key={extra.id}
                                  variant={selected ? "default" : "outline"}
                                  className="text-sm"
                                  onClick={() => handleToggleExtra(group.id, extra, group.ruleType)}
                                >
                                  {extra.name} +${extra.price}
                                </Button>
                              );
                            })
                          ) : (
                            <p className="text-xs text-gray-400">No hay extras disponibles en este grupo.</p>
                          )}
                        </div>
                        {group.isRequired && (
                          <p className="text-xs text-red-500">* Obligatorio</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* Notas */}
            <div>
              <label className="text-sm">Notas:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                rows={2}
                placeholder="Notas especiales"
              />
            </div>

            {/* Selector de cantidad + botón de añadir */}
            <div className="flex items-center space-x-2 mt-4">
              <label className="text-sm">Cantidad:</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-16 border rounded px-2 py-1 text-sm"
              />

              <Button
                className="flex-1 bg-black text-white hover:bg-gray-900"
                onClick={handleAddToCart}
              >
                Añadir al carrito
              </Button>
            </div>

            {/* Precio Total */}
            <div className="text-right text-base font-bold mt-2">
              Total: ${totalPrice}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
