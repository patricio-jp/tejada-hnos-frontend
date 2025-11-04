import { BookOpen, ListChecks, Settings2, SquareTerminal, Users, Map, Home, Database } from "lucide-react";
import type { MenuItem } from "@/common/types/menu-item";

export const MENUS_MAIN: MenuItem[] = [
  {
      title: "Main Dashboard",
      url: "/",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "About",
          url: "/about",
        },
        {
          title: "Protected",
          url: "/protected",
        },
        {
          title: "Login",
          url: "/login",
        },
      ],
    },
    {
      title: "Home",
      url: "/",
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
