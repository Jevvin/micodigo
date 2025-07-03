"use client"

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const section = pathParts[2] || "inicio";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar (handles mobile/desktop automatically) */}
        <AppSidebar activePanel={section} />

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-auto">
          {/* Header with trigger button for mobile */}
          <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </header>

          <main className="flex-1 p-4 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
