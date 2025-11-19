import { BookOpen, CircleDollarSign, ClipboardList, Settings2, SquareTerminal, Users, Map, Home, Database, ShoppingCart } from "lucide-react";
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
      title: "Órdenes de Venta",
      url: "/sales-orders",
      icon: CircleDollarSign,
      roles: ["ADMIN"],
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
