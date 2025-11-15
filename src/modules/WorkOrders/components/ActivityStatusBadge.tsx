import { Badge } from "@/components/ui/badge";
import { ActivityStatus } from "@/modules/WorkOrders/types/work-orders";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface ActivityStatusBadgeProps {
  status: ActivityStatus;
}

export function ActivityStatusBadge({ status }: ActivityStatusBadgeProps) {
  const config: Record<ActivityStatus, { variant: "default" | "secondary" | "destructive"; label: string; icon: React.ReactNode }> = {
    PENDING: { 
      variant: "secondary", 
      label: "Pendiente", 
      icon: <Clock className="h-3 w-3 mr-1" />
    },
    APPROVED: { 
      variant: "default", 
      label: "Aprobada", 
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />
    },
    REJECTED: { 
      variant: "destructive", 
      label: "Rechazada", 
      icon: <XCircle className="h-3 w-3 mr-1" />
    },
  };

  const { variant, label, icon } = config[status];

  return (
    <Badge variant={variant} className="flex items-center w-fit">
      {icon}
      {label}
    </Badge>
  );
}
