import type { LucideIcon } from "lucide-react";

export type MenuRole = "ADMIN" | "CAPATAZ" | "OPERARIO" | string;

export type MenuSubItem = {
  title: string;
  url: string;
  roles?: MenuRole[];
};

export type MenuItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  roles?: MenuRole[];
  items?: MenuSubItem[];
};
