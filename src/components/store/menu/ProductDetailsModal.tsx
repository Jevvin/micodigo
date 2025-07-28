"use client";

import SingleSelectExtrasGroup from "@/components/store/extras/SingleSelectExtrasGroup";
import MultiSelectExtrasGroup from "@/components/store/extras/MultiSelectExtrasGroup";
import QuantitySelectExtrasGroup from "@/components/store/extras/QuantitySelectExtrasGroup";
import { useState, useEffect, useRef } from "react";
import { X, Minus, Plus, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CartItem, CartItemExtra } from "@/types/store/cart";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRestaurantStore } from "@/hooks/store/useRestaurantStore";

export default function ProductDetailsModal({
  open,
  onClose,
  product,
  onAddToCart,
  onUpdateItem,
  extraGroups,
  mode = "add",
  cartItem,
}: {
  open: boolean;
  onClose: () => void;
  product: any;
  onAddToCart: (item: any) => void;
  onUpdateItem?: (updatedItem: CartItem) => void;
  extraGroups: any[];
  mode?: "add" | "edit";
  cartItem?: CartItem;
}) {
  const isMobile = useIsMobile();
  const { restaurant } = useRestaurantStore();
  const canOrder = restaurant?.accepting_orders;

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<CartItemExtra[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && product) {
      if (mode === "edit" && cartItem) {
        setQuantity(cartItem.quantity || 1);
        setNotes(cartItem.notes || "");
        setSelectedExtras(cartItem.extras || []);
      } else {
        setQuantity(1);
        setNotes("");
        setSelectedExtras([]);
      }
    }
  }, [open, product, mode, cartItem]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !product) return null;

  const productId = product?.id ?? "";
  const productName = product?.name ?? "Producto";
  const productPrice = product?.price ?? 0;
  const productImage = product?.image ?? "/placeholder.svg";
  const productDescription = product?.description ?? "";

  const handleToggleExtra = (
    groupIdRaw: string | number,
    extra: any,
    ruleType: string
  ) => {
    const groupId = Number(groupIdRaw);
    const group = extraGroups.find((g) => Number(g.id) === groupId);
    if (!group) return;

    const formattedExtra: CartItemExtra = {
      id: Number(extra.id),
      name: extra.name,
      price: extra.price,
      quantity: 1,
      groupId,
      extra_group_name: group.name,
      extra_group_sort_order: group.sortOrder,
      extra_sort_order: extra.sort_order,
    };

    setSelectedExtras((prev) => {
      let updated;
      if (ruleType === "single") {
        const filtered = prev.filter((e) => e.groupId !== groupId);
        updated = prev.find((e) => e.id === Number(extra.id))
          ? filtered
          : [...filtered, formattedExtra];
      } else if (ruleType === "multiple") {
        updated = prev.find((e) => e.id === Number(extra.id))
          ? prev.filter((e) => e.id !== Number(extra.id))
          : [...prev, formattedExtra];
      } else {
        updated = prev;
      }

      return updated.slice().sort((a, b) =>
        a.extra_group_sort_order !== b.extra_group_sort_order
          ? a.extra_group_sort_order - b.extra_group_sort_order
          : a.extra_sort_order - b.extra_sort_order
      );
    });
  };

  const extrasTotal = selectedExtras.reduce(
    (sum, e) => sum + e.price * (e.quantity || 1),
    0
  );

  const totalPrice = (productPrice + extrasTotal) * quantity;

  const handleAction = () => {
    const sortedExtras = selectedExtras.slice().sort((a, b) =>
      a.extra_group_sort_order !== b.extra_group_sort_order
        ? a.extra_group_sort_order - b.extra_group_sort_order
        : a.extra_sort_order - b.extra_sort_order
    );

    const item: CartItem = {
      productId,
      name: productName,
      price: productPrice,
      quantity,
      notes,
      extras: sortedExtras,
      image: productImage,
    };

    if (mode === "edit" && typeof onUpdateItem === "function") {
      onUpdateItem(item);
    } else {
      onAddToCart(item);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white w-full sm:max-w-xl mx-auto shadow-lg flex flex-col rounded-2xl ${
          isMobile ? "h-[95vh]" : "h-auto max-h-[90vh]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-hide rounded-2xl"
        >
          <div className="relative w-full h-64 rounded-t-2xl overflow-hidden">
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="bg-white text-black p-2 rounded-full shadow-md hover:bg-black hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button aria-label="Favoritos" className="bg-white text-black p-2 rounded-full shadow-md hover:bg-black hover:text-white">
                <Heart className="w-5 h-5" />
              </button>
              <button aria-label="Compartir" className="bg-white text-black p-2 rounded-full shadow-md hover:bg-black hover:text-white">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="px-4 pb-32">
            <div className="mt-4 mb-4">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h2 className="text-[23px] font-bold text-black">{productName}</h2>
                <p className="text-[21px] text-black">${productPrice.toFixed(2)}</p>
              </div>
              <p className="text-[17px] text-gray-600 mt-2">{productDescription}</p>
            </div>

            <div className="space-y-6 mt-6">
              {extraGroups?.length > 0 && (
                <Accordion
                  type="multiple"
                  className="w-full"
                  defaultValue={extraGroups.map((g) => g.id.toString())}
                >
                  {extraGroups
                    .filter((group) => group?.is_visible !== false && group.extras?.length > 0)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((group: any) => (
                      <AccordionItem key={group.id} value={group.id.toString()}>
                        <AccordionTrigger>
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-[19px] text-gray-700">{group.name}</span>
                            {group.description && (
                              <span className="text-xs text-gray-500">{group.description}</span>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2">
                          {group.ruleType === "single" && (
                            <SingleSelectExtrasGroup
                              group={group}
                              selectedExtras={selectedExtras}
                              onToggleExtra={(extra) =>
                                handleToggleExtra(group.id, extra, group.ruleType)
                              }
                            />
                          )}
                          {group.ruleType === "multiple" && (
                            <MultiSelectExtrasGroup
                              group={group}
                              selectedExtras={selectedExtras}
                              onToggle={(groupId, extra) =>
                                handleToggleExtra(groupId, extra, group.ruleType)
                              }
                            />
                          )}
                          {group.ruleType === "quantity" && (
                            <QuantitySelectExtrasGroup
                              group={group}
                              selectedExtras={selectedExtras}
                              onChangeQuantity={(groupIdRaw, extra, newQty) => {
                                const groupId = Number(groupIdRaw);
                                const groupInfo = extraGroups.find((g) => Number(g.id) === groupId);
                                if (!groupInfo) return;

                                const extraId = Number(extra.id);
                                const existing = selectedExtras.find((e) => e.id === extraId);
                                let updated = [...selectedExtras];

                                if (existing) {
                                  if (newQty <= 0) {
                                    updated = updated.filter((e) => e.id !== extraId);
                                  } else {
                                    updated = updated.map((e) =>
                                      e.id === extraId ? { ...e, quantity: newQty } : e
                                    );
                                  }
                                } else {
                                  updated.push({
                                    id: extraId,
                                    name: extra.name,
                                    price: extra.price,
                                    quantity: newQty,
                                    groupId,
                                    extra_group_name: groupInfo.name,
                                    extra_group_sort_order: groupInfo.sortOrder,
                                    extra_sort_order: extra.sort_order,
                                  });
                                }

                                updated = updated.sort((a, b) =>
                                  a.extra_group_sort_order !== b.extra_group_sort_order
                                    ? a.extra_group_sort_order - b.extra_group_sort_order
                                    : a.extra_sort_order - b.extra_sort_order
                                );

                                setSelectedExtras(updated);
                              }}
                            />
                          )}
                          {group.isRequired && (
                            <p className="text-xs text-red-500 mt-1">* Obligatorio</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              )}
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
            </div>
          </div>
        </div>

        {/* Footer - Mobile */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t px-4 py-3 flex items-center justify-between gap-4 sm:hidden">
          <div className="flex items-center gap-2 w-[30%]">
            <Button variant="ghost" size="icon" className="border" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">{quantity}</span>
            <Button variant="ghost" size="icon" className="border" onClick={() => setQuantity((q) => q + 1)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {canOrder ? (
            <Button className="flex-1 bg-black text-white hover:bg-gray-900 w-[70%]" onClick={handleAction}>
              {mode === "edit" ? "Actualizar" : "Agregar al carrito"} (${totalPrice.toFixed(2)})
            </Button>
          ) : (
            <div className="flex-1 text-right text-gray-800 text-sm font-medium w-[70%]">
              Total estimado: ${totalPrice.toFixed(2)}
            </div>
          )}
        </div>

        {/* Footer - Desktop */}
        <div className="hidden sm:flex px-4 py-4 border-t items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-[30%]">
            <Button variant="ghost" size="icon" className="border" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">{quantity}</span>
            <Button variant="ghost" size="icon" className="border" onClick={() => setQuantity((q) => q + 1)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {canOrder ? (
            <Button className="flex-1 bg-black text-white hover:bg-gray-900 w-[70%]" onClick={handleAction}>
              {mode === "edit" ? "Actualizar" : "Agregar al carrito"} (${totalPrice.toFixed(2)})
            </Button>
          ) : (
            <div className="flex-1 text-right text-gray-800 text-sm font-medium w-[70%]">
              Total estimado: ${totalPrice.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
