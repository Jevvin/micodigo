"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { HeaderBase } from "./header-base";
import { supabase } from "@/app/utils/supabaseClient";

export default function DashboardHeader({
  restaurantName: initialRestaurantName,
}: {
  restaurantName: string;
}) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [restaurantName, setRestaurantName] = useState(initialRestaurantName);

  useEffect(() => {
    setHydrated(true);

    // Intenta usar localStorage solo en el cliente
    const storedName = localStorage.getItem("restaurantName");
    if (storedName) {
      setRestaurantName(storedName);
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("restaurantName");
    router.push("/restaurant");
  };

  return (
    <HeaderBase variant="dashboard" text="">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="flex flex-col">
            {hydrated && restaurantName && (
              <p className="text-lg font-semibold">{restaurantName}</p>
            )}
            <span className="text-sm text-muted-foreground">Panel de Control</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ver notificaciones">
                <Bell className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver notificaciones</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ver configuraciones">
                <User className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver configuraciones</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cerrar sesión"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cerrar sesión</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </HeaderBase>
  );
}
