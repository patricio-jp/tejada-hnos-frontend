import { Badge } from "@/components/ui/badge";
import { WorkOrderStatus, type WorkOrder } from "@/types";

interface WorkOrderStatusBadgeProps {
  status: WorkOrder['status'];
}

export function WorkOrderStatusBadge({ status }: WorkOrderStatusBadgeProps) {
  const variants: Record<WorkOrder['status'], { variant: "default" | "secondary" | "destructive" | "outline" | "warning"; label: string }> = {
    [WorkOrderStatus.PENDING]: { variant: "outline", label: "Pendiente" },
    [WorkOrderStatus.IN_PROGRESS]: { variant: "default", label: "En Progreso" },
    [WorkOrderStatus.UNDER_REVIEW]: { variant: "warning", label: "En Revisión" },
    [WorkOrderStatus.COMPLETED]: { variant: "secondary", label: "Completada" },
    [WorkOrderStatus.CANCELLED]: { variant: "destructive", label: "Cancelada" },
  };

  const config = variants[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
