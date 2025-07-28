"use client";

import { forwardRef } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/types/store/product";

// Reutilizable
const normalizeTitleToId = (title: string) =>
  `category-${title.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;

interface MenuSectionProps {
  title: string;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

// forwardRef para poder pasar el ref desde page.tsx
const MenuSection = forwardRef<HTMLDivElement, MenuSectionProps>(
  ({ title, products, onSelectProduct }, ref) => {
    return (
      <div
        ref={ref}
        id={normalizeTitleToId(title)}
        className="space-y-6 scroll-mt-24"
      >
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

        {products.length === 0 ? (
          <p className="text-gray-500 italic">
            No hay productos disponibles en esta categoría.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onSelectProduct(product)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

MenuSection.displayName = "MenuSection";
export default MenuSection;
export { normalizeTitleToId }; // opcional, para usar en page.tsx también
