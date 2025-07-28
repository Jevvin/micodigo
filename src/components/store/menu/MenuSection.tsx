"use client";

/**
 * MenuSection.tsx
 * 
 * Este componente representa una sección del menú de un restaurante.
 * Muestra el título de una categoría (ej. "Entradas", "Bebidas") y todos los productos que pertenecen a ella.
 * 
 * También se asigna un ID único a cada sección basado en el nombre de la categoría,
 * para permitir el scroll automático cuando se hace clic en una categoría desde el StickyCategoryTabs.
 * 
 * Props:
 * - title: string → nombre de la categoría (usado como título y como ID)
 * - products: Product[] → lista de productos que pertenecen a esta categoría
 * - onSelectProduct: (product: Product) => void → callback que se ejecuta al hacer clic en un producto (abre el modal)
 */


import ProductCard from "./ProductCard";
import { Product } from "@/types/store/product";

interface MenuSectionProps {
  title: string;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

// Función para normalizar el título y usarlo como ID seguro
const normalizeTitleToId = (title: string) =>
  `category-${title.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;

export default function MenuSection({
  title,
  products,
  onSelectProduct,
}: MenuSectionProps) {
  return (
    <div id={normalizeTitleToId(title)} className="space-y-6 scroll-mt-24">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

      {products.length === 0 ? (
        <p className="text-gray-500 italic">No hay productos disponibles en esta categoría.</p>
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
