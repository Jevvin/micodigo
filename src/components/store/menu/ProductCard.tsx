"use client";

/**
 * ProductCard.tsx
 * 
 * Muestra un producto individual en forma de tarjeta.
 * 
 * Props:
 * - product: any (objeto del producto)
 * - onClick: () => void (handler para abrir el modal de detalles)
 */

export default function ProductCard({
  product,
  onClick,
}: {
  product: any;
  onClick: () => void;
}) {
  return (
    <div
      className="border rounded-lg overflow-hidden shadow-sm bg-white cursor-pointer hover:shadow-md transition-all"
      onClick={onClick}
    >
      <img
        src={product.image || "/placeholder.svg"}
        alt={product.name}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">{product.name}</h3>
        </div>

        <p className="text-gray-600 mb-3">{product.description}</p>

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-green-600">
            ${product.price}
          </span>
          <button className="text-sm px-3 py-1 bg-black text-white rounded-md">
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
