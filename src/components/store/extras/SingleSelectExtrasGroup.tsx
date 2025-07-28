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
  ruleType: "single";
  extras?: Extra[];
}

export default function SingleSelectExtrasGroup({
  group,
  selectedExtras,
  onToggleExtra,
}: {
  group: Group;
  selectedExtras: CartItemExtra[];
  onToggleExtra: (extra: Extra) => void;
}) {
  if (!group?.extras || group.extras.length === 0) return null;

  const selectedId = selectedExtras.find((e) => e.groupId === group.id)?.id;

  return (
    <div className="space-y-2">
      {group.extras
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((extra) => (
          <label
            key={extra.id}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <input
              type="radio"
              name={`extra-group-${group.id}`}
              checked={selectedId === extra.id}
              onChange={() => onToggleExtra(extra)}
              className="accent-black"
            />
            <span>
              {extra.name}
              {extra.price > 0 && ` +$${extra.price}`}
            </span>
          </label>
        ))}
    </div>
  );
}
