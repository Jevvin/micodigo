"use client";

/**
 * RestaurantTabs.tsx
 * 
 * Componente de pestañas para navegar las categorías del menú.
 * Ejemplo: Platillos, Postres, Bebidas, etc.
 * 
 * Props:
 * - categories: string[]
 * - selectedCategory: string
 * - onSelectCategory: (category: string) => void
 */

export default function RestaurantTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 rounded-md whitespace-nowrap text-sm transition ${
            category === selectedCategory
              ? "bg-black text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
