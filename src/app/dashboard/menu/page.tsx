"use client";

import { useEffect, useState } from "react";
import MenuCustomizer from "@/components/dashboard/menu/MenuCustomizer";
import ExtrasCustomizer from "@/components/dashboard/extras/ExtrasCustomizer";
import { Separator } from "@/components/ui/separator";

export default function MenuPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <MenuCustomizer />

      <Separator className="my-6" />

      <ExtrasCustomizer />
    </>
  );
}
