"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { CartItemExtra } from "@/types/store/cart";

interface Extra {
  id: number;
  name: string;
  price: number;
  sort_order: number;
}

interface Group {
  id: number;
  ruleType: "quantity";
  extras?: Extra[];
}

export default function QuantitySelectExtrasGroup({
  group,
  selectedExtras,
  onChangeQuantity,
}: {
  group: Group;
  selectedExtras: CartItemExtra[];
  onChangeQuantity: (groupId: number, extra: Extra, newQty: number) => void;
}) {
  if (!group?.extras || group.extras.length === 0) return null;

  return (
    <div className="space-y-2">
      {group.extras
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((extra) => {
          const selected = selectedExtras.find((e) => e.id === extra.id);
          const qty = selected?.quantity || 0;

          return (
            <div
              key={extra.id}
              className="flex items-center justify-between border rounded px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{extra.name}</p>
                {extra.price > 0 && (
                  <p className="text-xs text-gray-500">
                    +${extra.price.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="border"
                  onClick={() =>
                    onChangeQuantity(group.id, extra, Math.max(0, qty - 1))
                  }
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium w-4 text-center">
                  {qty}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="border"
                  onClick={() =>
                    onChangeQuantity(group.id, extra, qty + 1)
                  }
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
    </div>
  );
}
