"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * HeaderBase es un header flexible y consistente.
 * - Garantiza misma altura y padding para dashboard y sidebar.
 * - Cambia fondo/borde según "variant".
 * - Permite contenido dinámico con children.
 */
export function HeaderBase({
  text,
  variant,
  children,
  className,
}: {
  text: string;
  variant: "sidebar" | "dashboard";
  children?: React.ReactNode;
  className?: string;
}) {
  const baseClasses = cn(
    "flex h-16 px-4 items-center",
    variant === "dashboard"
      ? "bg-white border-b justify-between"
      : "bg-sidebar text-sidebar-foreground justify-between",
    className
  );

  return (
    <header className={baseClasses}>
      {variant === "dashboard" ? (
        <>
          {children}
        </>
      ) : (
        <>
          <span className="font-semibold text-lg">{text}</span>
          {children}
        </>
      )}
    </header>
  );
}
