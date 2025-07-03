"use client";

import Link from "next/link";

export function HeaderPublic() {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
      <Link href="/" className="text-2xl font-bold text-orange-500">
        RestaurantOS
      </Link>
      <div className="space-x-3">
        <Link
          href="/login"
          className="border border-gray-300 text-gray-800 px-4 py-1.5 rounded hover:bg-gray-100"
        >
          Iniciar Sesión
        </Link>
        <Link
          href="/restaurant"
          className="bg-orange-500 text-white px-4 py-1.5 rounded hover:bg-orange-600"
        >
          Restaurante
        </Link>
      </div>
    </header>
  );
}
