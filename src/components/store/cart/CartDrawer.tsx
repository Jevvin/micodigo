"use client";

import { useEffect, useState } from "react";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { Product } from "@/types/store/product";
import { CartItem } from "@/types/store/cart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SuggestedProductsCarousel from "../menu/SuggestedProductsCarousel";

export default function CartDrawer({
  open,
  onClose,
  cartItems,
  onRemoveItem,
  onIncreaseQty,
  onDecreaseQty,
  onProceedToCheckout,
  allProducts,
  onAddSuggestedProduct,
  restaurantName,
  onEditItem,
}: {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (index: number) => void;
  onIncreaseQty: (index: number) => void;
  onDecreaseQty: (index: number) => void;
  onProceedToCheckout: () => void;
  allProducts: Product[];
  onAddSuggestedProduct: (product: Product) => void;
  restaurantName: string;
  onEditItem: (index: number) => void;
}) {
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  const subtotal = cartItems.reduce((sum, item) => {
    const extrasTotalPerUnit =
      item.extras?.reduce((eSum, e) => eSum + e.price * e.quantity, 0) || 0;
    return sum + (item.price + extrasTotalPerUnit) * item.quantity;
  }, 0);

  const suggestedProducts = allProducts.filter(
    (p) => !cartItems.some((item) => item.productId === p.id)
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative ml-auto h-full w-full sm:w-full md:w-[30vw] bg-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold truncate">{restaurantName}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-6 h-6 text-gray-500" />
            </Button>
          </div>

          <Separator />

          <h3 className="text-lg font-semibold mt-5 mb-5">Tu carrito</h3>

          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Tu carrito está vacío.</p>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item, index) => {
                const extrasTotal =
                  item.extras?.reduce((sum, extra) => sum + extra.price * extra.quantity, 0) || 0;
                const itemSubtotal = (item.price + extrasTotal) * item.quantity;

                return (
                  <div key={index} className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 rounded object-cover"
                      />

                      <div className="flex-1 px-3">
                        <p className="leading-tight text-black">
                          <span className="font-semibold">{item.name}</span>
                          <span className="mx-1">·</span>
                          <span className="text-black font-normal">
                            ${item.price.toFixed(2)}
                          </span>
                        </p>

                        {item.extras?.length > 0 && (
                          <ul className="mt-1 text-sm text-gray-700 space-y-1">
                            {item.extras
                              .sort((a, b) =>
                                a.extra_group_sort_order !== b.extra_group_sort_order
                                  ? a.extra_group_sort_order - b.extra_group_sort_order
                                  : a.extra_sort_order - b.extra_sort_order
                              )
                              .map((extra, i) => (
                                <li key={i}>
                                  • {extra.name}
                                  {extra.price > 0 && (
                                    <span className="text-gray-600 ml-1">
                                      +${(extra.price * extra.quantity).toFixed(2)}
                                    </span>
                                  )}
                                </li>
                              ))}
                          </ul>
                        )}

                        <p className="mt-1 text-sm text-black">
                          ${itemSubtotal.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmDeleteIndex(index)}
                          className="text-gray-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-4 h-4"
                            onClick={() =>
                              item.quantity === 1
                                ? setConfirmDeleteIndex(index)
                                : onDecreaseQty(index)
                            }
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="mx-2 text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-4 h-4"
                            onClick={() => onIncreaseQty(index)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditItem(index)}
                          className="text-sm text-black border border-black rounded-full mt-1 px-3 py-1"
                        >
                          Editar
                        </Button>
                      </div>
                    </div>

                    {confirmDeleteIndex === index && (
                      <div className="mt-1 p-3 border rounded bg-gray-100 text-sm space-y-2">
                        <p>¿Deseas quitar <strong>{item.name}</strong> del carrito?</p>
                        <div className="flex gap-3">
                          <Button
                            className="bg-red-500 text-white hover:bg-red-600"
                            size="sm"
                            onClick={() => {
                              onRemoveItem(index);
                              setConfirmDeleteIndex(null);
                            }}
                          >
                            Eliminar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmDeleteIndex(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-fit rounded-full bg-gray-100 text-black text-sm font-medium px-4 py-1"
            >
              + Agregar más productos
            </Button>
          </div>

          {suggestedProducts.length > 0 && (
            <div className="mt-11">
              <h3 className="text-lg font-semibold mb-2">Ofertas para ti</h3>
              <SuggestedProductsCarousel
                products={suggestedProducts}
                onAddToCart={onAddSuggestedProduct}
              />
            </div>
          )}

          <div className="mt-10 border-t pt-4 space-y-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Button
              className="w-full bg-black text-white hover:bg-gray-900"
              disabled={cartItems.length === 0}
              onClick={onProceedToCheckout}
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
