"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function MenuSkeleton() {
  return (
    <div className="space-y-12">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-1/3 rounded-md bg-gray-200" /> {/* Título de categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-40 rounded-xl bg-gray-200" /> {/* Imagen producto */}
                <Skeleton className="h-4 w-3/4 rounded-md bg-gray-200" />
                <Skeleton className="h-4 w-1/2 rounded-md bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
