// src/modules/Purchases/components/StatusBadge.tsx

import { Badge } from "@/components/ui/badge";
import { PurchaseOrderStatus } from "../types";

interface StatusBadgeProps {
  status: PurchaseOrderStatus;
  className?: string;
}

const STATUS_CONFIG: Record<PurchaseOrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  [PurchaseOrderStatus.PENDIENTE]: {
    label: "Pendiente",
    variant: "secondary",
  },
  [PurchaseOrderStatus.APROBADA]: {
    label: "Aprobada",
    variant: "default",
  },
  [PurchaseOrderStatus.RECIBIDA]: {
    label: "Recibida",
    variant: "default",
  },
  [PurchaseOrderStatus.RECIBIDA_PARCIAL]: {
    label: "Recibida Parcialmente",
    variant: "outline",
  },
  [PurchaseOrderStatus.CERRADA]: {
    label: "Cerrada",
    variant: "secondary",
  },
  [PurchaseOrderStatus.CANCELADA]: {
    label: "Cancelada",
    variant: "destructive",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
