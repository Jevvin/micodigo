"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BusinessTabs() {
  return (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="general">General</TabsTrigger>
      <TabsTrigger value="contact">Contacto</TabsTrigger>
      <TabsTrigger value="hours">Horarios</TabsTrigger>
      <TabsTrigger value="delivery">Pedidos</TabsTrigger>
    </TabsList>
  );
}
