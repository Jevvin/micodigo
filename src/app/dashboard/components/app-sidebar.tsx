"use client"

import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Package,
  MenuIcon,
  AlertCircle,
  Settings,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  activePanel: string
}

const menuItems = [
  { id: "inicio", title: "Inicio", icon: LayoutDashboard, description: "Vista rápida del negocio" },
  { id: "pedidos", title: "Pedidos en Vivo", icon: AlertCircle, description: "Pantalla de cocina", badge: "PDV" },
  { id: "ventas", title: "Ventas", icon: TrendingUp, description: "Historial y estadísticas" },
  { id: "clientes", title: "Clientes", icon: Users, description: "Base de datos de clientes" },
  { id: "inventario", title: "Inventario", icon: Package, description: "Stock de productos" },
  { id: "menu", title: "Personalizar Menú", icon: MenuIcon, description: "Categorías y productos" },
  { id: "configuracion", title: "Configuración", icon: Settings, description: "Ajustes del restaurante" },
]

export function AppSidebar({ activePanel }: AppSidebarProps) {
  const router = useRouter()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <MenuIcon className="h-6 w-6 text-orange-600" />
          <span className="font-semibold text-lg">RestaurantOS</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Panel de Control</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => router.push(item.id === "inicio" ? '/dashboard' : `/dashboard/${item.id}`)}
                    isActive={activePanel === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">{item.badge}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
