"use client";

import { useState, useEffect } from "react";
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

  // ✅ Limpiar selección al abrir modal nuevo
  useEffect(() => {
    if (open && product) {
      setSelectedExtras([]);
      setQuantity(1);
      setNotes("");
    }
  }, [open, product]);

  if (!open || !product) return null;

  // ✅ Variables seguras para evitar crashes
  const productId = product?.id ?? "";
  const productName = product?.name ?? "Producto";
  const productPrice = product?.price ?? 0;
  const productImage = product?.image ?? "/placeholder.svg";
  const productDescription = product?.description ?? "";

  const handleToggleExtra = (groupId: number, extra: any, ruleType: string) => {
    const group = extraGroups.find((g) => g.id === groupId);
    if (!group) return;

    const formattedExtra: CartItemExtra = {
      id: extra.id,
      name: extra.name,
      price: extra.price,
      quantity: 1,
      groupId,
      extra_group_name: group.name,
      extra_group_sort_order: group.sortOrder,
      extra_sort_order: extra.sort_order
    };

    setSelectedExtras((prev) => {
      let updated;
      if (ruleType === "single") {
        const filtered = prev.filter((e) => e.groupId !== groupId);
        updated = prev.find((e) => e.id === extra.id) ? filtered : [...filtered, formattedExtra];
      } else if (ruleType === "multiple") {
        updated = prev.find((e) => e.id === extra.id)
          ? prev.filter((e) => e.id !== extra.id)
          : [...prev, formattedExtra];
      } else {
        updated = prev;
      }

      // ✅ Ordenar extras en tiempo real
      return updated.slice().sort((a, b) => {
        if (a.extra_group_sort_order !== b.extra_group_sort_order) {
          return a.extra_group_sort_order - b.extra_group_sort_order;
        }
        return a.extra_sort_order - b.extra_sort_order;
      });
    });
  };

  // ✅ Total de extras por 1 unidad
  const extrasTotalSingle = selectedExtras.reduce(
    (sum, e) => sum + (e.price * (e.quantity || 1)),
    0
  );

  // ✅ Total considerando cantidad
  const totalPrice = ((productPrice + extrasTotalSingle) * quantity);

  const handleAddToCart = () => {
    // ✅ Forzar orden antes de mandar al carrito
    const sortedExtras = selectedExtras.slice().sort((a, b) => {
      if (a.extra_group_sort_order !== b.extra_group_sort_order) {
        return a.extra_group_sort_order - b.extra_group_sort_order;
      }
      return a.extra_sort_order - b.extra_sort_order;
    });

    const item = {
      productId,
      name: productName,
      price: productPrice,
      quantity,
      notes,
      extras: sortedExtras,
      extrasTotal: extrasTotalSingle,
      image: productImage
    };

    onAddToCart(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{productName}</CardTitle>
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
            src={productImage}
            alt={productName}
            className="w-full h-64 object-cover rounded-lg"
          />

          <p className="text-gray-700">{productDescription}</p>

          <div className="space-y-2">
            <p className="font-medium">Precio base: ${productPrice}</p>

            {/* Extras */}
            {extraGroups && extraGroups.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Extras:</p>
                <Accordion type="multiple" className="w-full">
                  {extraGroups
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((group: any) => (
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
                              group.extras
                                .slice()
                                .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
                                .map((extra: any) => {
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

            {/* Cantidad + botón */}
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
