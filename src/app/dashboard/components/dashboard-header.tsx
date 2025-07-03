"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";

/**
 * Header superior del Dashboard
 * - SidebarTrigger siempre a la izquierda
 * - Nombre dinámico del restaurante
 * - Botones de notificaciones, usuario y cerrar sesión
 */
export default function DashboardHeader({
  restaurantName,
  children
}: {
  restaurantName: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Maneja el cierre de sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
      <div className="flex items-center gap-3">
        {children}
        <div className="flex flex-col">
          <span className="text-lg font-semibold">{restaurantName}</span>
          <span className="text-sm text-muted-foreground">Panel de Control</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notificaciones">
          <Bell className="h-5 w-5" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="ghost" size="icon" aria-label="Menú de usuario">
          <User className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cerrar sesión"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
