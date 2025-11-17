import { BookOpen, ListChecks, Settings2, SquareTerminal, Users, Map, Home, Database, ShoppingCart, Package } from "lucide-react";
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
      title: "Activities",
      url: "/activities",
      icon: ListChecks,
      items: [
        {
          title: "Dashboard",
          url: "/activities",
        },
        {
          title: "List",
          url: "/activities/list",
        },
      ],
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
      title: "Bodega",
      url: "/inputs",
      icon: Package,
      items: [
        {
          title: "Inventario de insumos",
          url: "/inputs",
        },
      ],
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
