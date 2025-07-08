import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/utils/supabaseServer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import DashboardHeader from "./components/dashboard-header";
import { Toaster } from "@/components/ui/toaster"; // ✅ IMPORTA EL TOASTER

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
  const supabase = await createSupabaseServerClient();

  // ✅ Pedir user con validación segura
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/restaurant");
  }

  // ✅ Obtener datos del restaurante
  const { data } = await supabase
    .from("restaurants")
    .select("name")
    .eq("user_id", user.id)
    .single();

  const restaurantName = data?.name || "Restaurante";

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-screen overflow-x-hidden bg-gray-50">
        {/* Barra lateral izquierda */}
        <AppSidebar />

        {/* Contenido principal */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Header superior con nombre dinámico del restaurante */}
          <DashboardHeader restaurantName={restaurantName} />

          {/* Área dinámica de contenido */}
          <main className="flex-1 min-w-0 overflow-auto p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>

      <Toaster />  {/* ✅ AÑADIDO AQUÍ PARA NOTIFICACIONES */}
    </SidebarProvider>
  );
}
