"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function Breadcrumbs() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-black transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver al inicio
      </Link>
    </div>
  );
}
