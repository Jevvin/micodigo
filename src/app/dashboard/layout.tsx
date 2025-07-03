"use client";

// 🧩 Librerías y hooks de Next.js
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

// 🧩 Componentes internos del dashboard
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import DashboardHeader from "./components/dashboard-header";
import { SidebarTrigger } from "@/components/ui/sidebar";

// 🧩 Cliente Supabase para autenticación y datos
import { supabase } from "@/app/utils/supabaseClient";

/**
 * Layout principal del Dashboard.
 * - Incluye Sidebar a la izquierda y el contenido principal a la derecha.
 * - Muestra el Header con el nombre del restaurante y botones de usuario.
 * - Protege rutas dinámicas y carga datos desde Supabase.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Estado local para el nombre del restaurante
  const [restaurantName, setRestaurantName] = useState<string>("Cargando...");

  // Obtener la ruta actual y marcar la sección activa en el sidebar
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const section = pathParts[2] || "inicio";

  /**
   * Efecto que se ejecuta al montar el layout:
   * Consulta Supabase para obtener el nombre del restaurante del usuario autenticado.
   */
  useEffect(() => {
    async function fetchRestaurantName() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setRestaurantName("No autenticado");
          return;
        }

        const { data, error } = await supabase
          .from("restaurants")
          .select("name")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("❌ Error obteniendo restaurante:", error.message);
          setRestaurantName("Error al cargar");
        } else {
          setRestaurantName(data?.name || "Restaurante");
        }
      } catch (err: any) {
        console.error("❌ Error general:", err.message);
        setRestaurantName("Error");
      }
    }

    fetchRestaurantName();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* Barra lateral izquierda */}
        <AppSidebar activePanel={section} />

        {/* Contenido principal */}
        <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">
          {/* Header superior con SidebarTrigger y nombre */}
          <DashboardHeader restaurantName={restaurantName}>
            {/* El botón de retraer sidebar, siempre visible */}
            <SidebarTrigger />
          </DashboardHeader>

          {/* Área dinámica de contenido */}
          <main className="flex-1 w-full min-w-0 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
