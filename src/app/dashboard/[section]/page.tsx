"use client";

import { useParams } from "next/navigation";

/**
 * Página dinámica para cada sección del Dashboard.
 * Usamos el parámetro [section] de la ruta.
 * Muestra un título y contenido de ejemplo.
 */
export default function SectionPage() {
  const params = useParams();
  const activePanel = params.section as string;

  return (
    <section className="flex-1 px-4 py-6">
      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-800 mb-4 capitalize">
        {activePanel.replace("-", " ")}
      </h1>

      {/* Contenido placeholder */}
      <div className="text-gray-600 max-w-full">
        Aquí irá el contenido de la sección: <strong>{activePanel}</strong>
      </div>
    </section>
  );
}
