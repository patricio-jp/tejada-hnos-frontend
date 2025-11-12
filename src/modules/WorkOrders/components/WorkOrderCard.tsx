import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, FileText, AlertTriangle, Clock } from "lucide-react";
import type { WorkOrder } from "@/modules/WorkOrders/types/work-orders";
import { WorkOrderStatusBadge } from "./WorkOrderStatusBadge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router";
import { getDateWarning } from "../utils/date-helpers";

interface WorkOrderCardProps {
  workOrder: WorkOrder;
}

export function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  const navigate = useNavigate();
  const dateWarning = workOrder.status !== 'COMPLETED' && workOrder.status !== 'CANCELLED' 
    ? getDateWarning(workOrder.dueDate) 
    : null;

  // Determinar clases de estilo según el estado de la fecha
  const cardClasses = dateWarning
    ? dateWarning.status === 'overdue'
      ? 'hover:shadow-md transition-all border-l-4 border-l-red-500/70 bg-red-200/30 dark:bg-red-800/10'
      : 'hover:shadow-md transition-all border-l-4 border-l-yellow-500/70 bg-yellow-100/30 dark:bg-yellow-800/10'
    : 'hover:shadow-md transition-shadow';

  return (
    <Card className={cardClasses}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{workOrder.title}</CardTitle>
            <CardDescription className="mt-1.5">
              {workOrder.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-center gap-2">
            {dateWarning && (
              <Badge 
                variant={dateWarning.status === 'overdue' ? 'destructive' : 'warning'}
                className="flex items-center gap-1 text-xs"
              >
                {dateWarning.status === 'overdue' ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {dateWarning.message}
              </Badge>
            )}
            <WorkOrderStatusBadge status={workOrder.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Información de fechas */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(workOrder.scheduledDate), "dd MMM yyyy", { locale: es })}
              {' - '}
              {format(new Date(workOrder.dueDate), "dd MMM yyyy", { locale: es })}
            </span>
          </div>

          {/* Parcelas asignadas */}
          {workOrder.plots && workOrder.plots.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {workOrder.plots.length === 1 
                  ? `${workOrder.plots[0].name}` 
                  : `${workOrder.plots.length} parcelas`}
              </span>
            </div>
          )}

          {/* Usuario asignado */}
          {workOrder.assignedTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{workOrder.assignedTo.name}</span>
            </div>
          )}

          {/* Actividades */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>
              {workOrder.activities?.length || 0} {workOrder.activities?.length === 1 ? 'actividad' : 'actividades'}
            </span>
          </div>

          {/* Botón de acción */}
          <Button 
            className="w-full mt-2" 
            onClick={() => navigate(`/work-orders/${workOrder.id}`)}
          >
            Ver Detalle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
