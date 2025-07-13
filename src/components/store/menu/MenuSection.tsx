"use client";

/**
 * MenuSection.tsx
 * 
 * Muestra el título de la sección de menú y la lista de productos.
 * Por ejemplo: "Platillos Principales", "Postres", etc.
 * 
 * Props:
 * - title: string
 * - products: any[]
 * - onSelectProduct: (product: any) => void
 */

import ProductCard from "./ProductCard";

export default function MenuSection({
  title,
  products,
  onSelectProduct,
}: {
  title: string;
  products: any[];
  onSelectProduct: (product: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onSelectProduct(product)}
          />
        ))}
      </div>
    </div>
  );
}
