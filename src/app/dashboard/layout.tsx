import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/utils/supabaseServer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import DashboardHeader from "./components/dashboard-header";
import { Toaster } from "sonner"; // ✅ Toaster global

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/restaurant");
  }

  const { data } = await supabase
    .from("restaurants")
    .select("name")
    .eq("user_id", user.id)
    .single();

  const restaurantName = data?.name || "Restaurante";

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-screen overflow-x-hidden bg-gray-50">
        <AppSidebar />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <DashboardHeader restaurantName={restaurantName} />

          <main className="flex-1 min-w-0 overflow-auto p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>

      {/* ✅ Posición actualizada + sin duración (se controla en el custom toast) */}
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          className: "bg-white text-black shadow-lg",
        }}
      />
    </SidebarProvider>
  );
}
