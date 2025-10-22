"use client"

import * as React from "react"
import {
  BookOpen,
  Map,
  Settings2,
  SquareTerminal,
} from "lucide-react"

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

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
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
      title: "Fields and Plots",
      url: "/fields",
      icon: Map,
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SystemHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
        <SystemInfo />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
