"use client";

/**
 * ProductList.tsx
 * 
 * Renderiza un grid de ProductCard para mostrar el menú completo.
 * 
 * Props:
 * - products: array de productos
 * - onProductClick: (product: any) => void
 */

import ProductCard from "./ProductCard";

export default function ProductList({
  products,
  onProductClick,
}: {
  products: any[];
  onProductClick: (product: any) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick(product)}
        />
      ))}
    </div>
  );
}

