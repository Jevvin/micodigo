"use client";

import { useEffect, useState } from "react";
import { MenuCustomizer } from "@/components/dashboard/menu-customizer";

export default function MenuPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
  <MenuCustomizer />
);
}