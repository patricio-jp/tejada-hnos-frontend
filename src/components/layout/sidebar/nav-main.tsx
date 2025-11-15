import { useMemo } from "react"
import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router"
import type { MenuItem } from "@/common/types/menu-item"
import useAuthHook from "@/modules/Auth/hooks/useAuth"

export function NavMain({
  items
}: {
  items: MenuItem[]
}) {
  const auth = useAuthHook()
  const userRole = typeof auth.accessPayload?.role === "string" ? auth.accessPayload.role : undefined

  const filteredItems = useMemo(() => {
    return items
      .map((item) => {
        if (item.roles && item.roles.length > 0) {
          if (!userRole || !item.roles.includes(userRole)) {
            return null
          }
        }

        if (item.items) {
          const allowedSubItems = item.items.filter((subItem) => {
            if (subItem.roles && subItem.roles.length > 0) {
              if (!userRole) return false
              return subItem.roles.includes(userRole)
            }
            return true
          })

          if (item.items.length > 0 && allowedSubItems.length === 0) {
            return null
          }

          return { ...item, items: allowedSubItems }
        }

        return item
      })
      .filter((item): item is MenuItem => item !== null)
  }, [items, userRole])

  return (
    <SidebarGroup>
      <SidebarMenu>
        {filteredItems.map((item) => 
          item.items && item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <NavLink to={subItem.url}>
                            <span>{subItem.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
