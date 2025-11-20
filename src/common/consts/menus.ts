import { BookOpen, ClipboardList, Settings2, SquareTerminal, Users, Map, Home, Database, ShoppingCart, Truck } from "lucide-react";
import type { MenuItem } from "@/common/types/menu-item";

export const MENUS_MAIN: MenuItem[] = [
  {
      title: "Main Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "About",
          url: "/about",
        },
        {
          title: "Protected",
          url: "/protected",
        },
      ],
    },
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Mis Tareas",
      url: "/work-orders/my-tasks",
      icon: ClipboardList,
    },
    {
      title: "Fields and Plots",
      url: "/fields",
      icon: Map,
      items: [
        {
          title: "Fields",
          url: "/fields",
        },
        {
          title: "Fields list",
          url: "/fields/list",
        },
        {
          title: "Listado de Parcelas",
          url: "/fields/plots-list",
        },
        {
          title: "🧪 API Tests",
          url: "/fields/test",
        }
      ]
    },
    {
      title: "Catálogos",
      url: "/suppliers",
      icon: Database,
      items: [
        {
          title: "Proveedores",
          url: "/suppliers",
        },
        {
          title: "Clientes",
          url: "/customers",
        },
        {
          title: "Variedades",
          url: "/varieties",
        },
      ],
    },
    {
      title: "Logística / Envíos",
      url: "/shipments",
      icon: Truck, // Asegúrate de importar Truck de lucide-react
      roles: ["ADMIN", "CAPATAZ"],
      items: [
        {
          title: "Despachar Pedidos",
          url: "/shipments",
        },
        {
          title: "Historial Envíos", // Futuro
          url: "/shipments/history", 
        }
      ]
    },
  
  // ...
    {
      title: "Órdenes de Trabajo",
      url: "/work-orders",
      icon: ClipboardList,
      roles: ["ADMIN", "CAPATAZ"],
    },
    {
      title: "Purchase Orders",
      url: "/purchases",
      icon: ShoppingCart,
      items: [
        {
          title: "Orders List",
          url: "/purchases",
        },
        {
          title: "New Order",
          url: "/purchases/new",
        },
        {
          title: "Approvals (Admin)",
          url: "/purchases/approvals",
        },
        {
          title: "Closure (Admin)",
          url: "/purchases/closure",
        },
      ],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BookOpen,
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
      items: [
        {
          title: "List",
          url: "/users/list",
        },
        {
          title: "Create",
          url: "/users/create",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2
    }
];
