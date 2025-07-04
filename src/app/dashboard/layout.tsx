// src/app/dashboard/layout.tsx

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/utils/supabaseServer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import DashboardHeader from "./components/dashboard-header";

/**
 * Layout principal del Dashboard.
 * - Protegido en el servidor: redirige al login si no hay sesión.
 * - Obtiene el nombre del restaurante desde Supabase en el servidor.
 * - Incluye Sidebar, Header y contenido dinámico.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ⚡️ Nuevo: Await la creación del cliente
  const supabase = await createSupabaseServerClient();

  // ⚡️ Obtener la sesión
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/restaurant");
  }

  // ⚡️ Obtener datos del restaurante
  const { data } = await supabase
    .from("restaurants")
    .select("name")
    .eq("user_id", session.user.id)
    .single();

  const restaurantName = data?.name || "Restaurante";

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-screen overflow-x-hidden bg-gray-50">
        {/* Barra lateral izquierda */}
        <AppSidebar activePanel="" />

        {/* Contenido principal */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Header superior con nombre dinámico del restaurante */}
          <DashboardHeader restaurantName={restaurantName} />

          {/* Área dinámica de contenido */}
          <main className="flex-1 min-w-0 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
