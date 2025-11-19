import { MonitorCog } from "lucide-react";

export function SystemHeader() {
  return (
      <div className="flex w-full items-center gap-2 overflow-hidden rounded-md text-left systemHeader"
      >
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <MonitorCog className="size-4" />
        </div>
        <div className="grid flex-1 text-left leading-tight space-y-1">
          <span className="truncate font-medium">NogalWare</span>
          <span className="truncate text-xs">SIGN</span>
        </div>
      </div>

  )
}
