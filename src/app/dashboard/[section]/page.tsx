"use client";

import { useParams } from "next/navigation";

export default function SectionPage() {
  const params = useParams();
  const activePanel = params.section as string;

  return (
    <section className="flex-1 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 capitalize">
        {activePanel.replace("-", " ")}
      </h1>
      <p className="text-gray-600">
        Aquí irá el contenido de la sección: <strong>{activePanel}</strong>
      </p>
    </section>
  );
}