"use client";

import { CartItemExtra } from "@/types/store/cart";

interface Extra {
  id: number;
  name: string;
  price: number;
  sort_order: number;
}

interface Group {
  id: number;
  ruleType: "multiple";
  extras?: Extra[];
}

export default function MultiSelectExtrasGroup({
  group,
  selectedExtras,
  onToggle,
}: {
  group: Group;
  selectedExtras: CartItemExtra[];
  onToggle: (groupId: number, extra: Extra) => void;
}) {
  if (!group?.extras || group.extras.length === 0) return null;

  return (
    <div className="space-y-2">
      {group.extras
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((extra) => {
          const isSelected = selectedExtras.some((e) => e.id === extra.id);
          return (
            <label
              key={extra.id}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(group.id, extra)}
                className="accent-black"
              />
              <span>
                {extra.name}
                {extra.price > 0 && ` +$${extra.price}`}
              </span>
            </label>
          );
        })}
    </div>
  );
}
