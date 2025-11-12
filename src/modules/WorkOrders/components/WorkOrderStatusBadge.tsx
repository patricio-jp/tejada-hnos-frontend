import { Badge } from "@/components/ui/badge";
import { WorkOrderStatus } from "@/modules/WorkOrders/types/work-orders";

interface WorkOrderStatusBadgeProps {
  status: WorkOrderStatus;
}

export function WorkOrderStatusBadge({ status }: WorkOrderStatusBadgeProps) {
  const variants: Record<WorkOrderStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    PENDING: { variant: "outline", label: "Pendiente" },
    IN_PROGRESS: { variant: "default", label: "En Progreso" },
    COMPLETED: { variant: "secondary", label: "Completada" },
    CANCELLED: { variant: "destructive", label: "Cancelada" },
  };

  const config = variants[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
