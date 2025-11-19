import { BookOpen, CircleDollarSign, ClipboardList, Settings2, SquareTerminal, Users, Map, Home, Database, ShoppingCart } from "lucide-react";
import type { MenuItem } from "@/common/types/menu-item";

export const MENUS_MAIN: MenuItem[] = [
    { 
      title: "Home",
      url: "/dashboard",
      icon: Home,
      roles: ["ADMIN", "CAPATAZ"],
    },
    {
      title: "Mis Tareas",
      url: "/my-tasks",
      icon: ClipboardList,
      roles: ["OPERARIO"],
    },
    {
      title: "Campos y Parcelas",
      url: "/fields",
      icon: Map,
      roles: ["ADMIN", "CAPATAZ"],
      items: [
        {
          title: "Campos",
          url: "/fields",
        },
        {
          title: "Lista de Campos",
          url: "/fields/list",
        },
        {
          title: "Variedades",
          url: "/varieties",
          roles: ["ADMIN"],
        },
      ]
    },
    {
      title: "Clientes",
      url: "/customers",
      icon: Users,
      roles: ["ADMIN", "CAPATAZ"],
    },
    {
      title: "Proveedores",
      url: "/suppliers",
      icon: Users,
      roles: ["ADMIN", "CAPATAZ"],
    },
    {
      title: "Órdenes de Trabajo",
      url: "/work-orders",
      icon: ClipboardList,
      roles: ["ADMIN", "CAPATAZ"],
    },
    {
      title: "Órdenes de Compra",
      url: "/purchases",
      icon: ShoppingCart,
      roles: ["ADMIN", "CAPATAZ"],
      items: [
        {
          title: "Lista de Órdenes",
          url: "/purchases",
        },
        {
          title: "Nueva Orden",
          url: "/purchases/new",
        },
        {
          title: "Aprobaciones (Admin)",
          url: "/purchases/approvals",
          roles: ["ADMIN"],
        },
        {
          title: "Cierre (Admin)",
          url: "/purchases/closure",
          roles: ["ADMIN"],
        },
      ],
    },
    {
      title: "Órdenes de Venta",
      url: "/sales-orders",
      icon: CircleDollarSign,
      roles: ["ADMIN", "CAPATAZ"],
      items: [
        {
          title: "Lista de Órdenes",
          url: "/sales-orders",
        },
        {
          title: "Nueva Orden",
          url: "/sales-orders/new",
        },
        {
          title: "Aprobaciones (Admin)",
          url: "/sales-orders/approvals",
          roles: ["ADMIN"],
        },
        {
          title: "Cierre (Admin)",
          url: "/sales-orders/closure",
          roles: ["ADMIN"],
        }
      ]
    },
    {
      title: "Reportes",
      url: "/reports",
      icon: BookOpen,
      roles: ["ADMIN", "CAPATAZ"],
    },
    {
      title: "Usuarios",
      url: "/users",
      icon: Users,
      roles: ["ADMIN"],
      items: [
        {
          title: "Lista de Usuarios",
          url: "/users/list",
        },
        {
          title: "Crear Usuario",
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
