"use client"

import * as React from "react"

import { NavMain } from "@/components/layout/sidebar/nav-main"
import { NavUser } from "@/components/layout/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SystemInfo } from "./system-info"
import { SystemHeader } from "./system-header"
import { MENUS_MAIN } from "@/common/consts/menus"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  }
}

const MENU_LINKS = MENUS_MAIN;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SystemHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={MENU_LINKS} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
        <SystemInfo />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
