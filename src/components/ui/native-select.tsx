// src/components/ui/native-select.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&_option]:bg-background [&_option]:text-foreground",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
