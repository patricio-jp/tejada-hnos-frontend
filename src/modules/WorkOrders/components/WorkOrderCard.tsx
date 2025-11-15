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
  const dateWarning = workOrder.status !== 'COMPLETED' && workOrder.status !== 'CANCELLED' && workOrder.status !== 'UNDER_REVIEW'
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
      <CardHeader className="p-3 pb-2 md:p-6 md:pb-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 overflow-hidden">
            <CardTitle className="text-sm md:text-base lg:text-lg break-words leading-tight">
              {workOrder.title}
            </CardTitle>
            <CardDescription className="mt-1 md:mt-1.5 text-xs md:text-sm line-clamp-2">
              {workOrder.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0 min-w-fit">
            {dateWarning && (
              <Badge 
                variant={dateWarning.status === 'overdue' ? 'destructive' : 'warning'}
                className="text-[10px] md:text-xs px-1.5 py-0.5 h-auto whitespace-nowrap flex items-center gap-1"
              >
                {dateWarning.status === 'overdue' ? (
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <Clock className="h-3 w-3 flex-shrink-0" />
                )}
                <span className="hidden md:inline">{dateWarning.message}</span>
              </Badge>
            )}
            <WorkOrderStatusBadge status={workOrder.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
        <div className="space-y-1.5 md:space-y-2">
          {/* Información de fechas */}
          <div className="flex items-center gap-1.5 text-[11px] md:text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">
              {format(new Date(workOrder.scheduledDate), "dd MMM", { locale: es })}
              {' - '}
              {format(new Date(workOrder.dueDate), "dd MMM yyyy", { locale: es })}
            </span>
          </div>

          {/* Parcelas asignadas */}
          {workOrder.plots && workOrder.plots.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] md:text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">
                {workOrder.plots.length === 1 
                  ? `${workOrder.plots[0].name}` 
                  : `${workOrder.plots.length} parcelas`}
              </span>
            </div>
          )}

          {/* Usuario asignado */}
          {workOrder.assignedTo && (
            <div className="flex items-center gap-1.5 text-[11px] md:text-sm text-muted-foreground">
              <User className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">{workOrder.assignedTo.name}</span>
            </div>
          )}

          {/* Actividades */}
          <div className="flex items-center gap-1.5 text-[11px] md:text-sm text-muted-foreground">
            <FileText className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span>
              {workOrder.activities?.length || 0} {workOrder.activities?.length === 1 ? 'actividad' : 'actividades'}
            </span>
          </div>

          {/* Botón de acción */}
          <Button 
            className="w-full mt-1.5 text-xs md:text-sm h-8 md:h-10" 
            onClick={() => navigate(`/work-orders/${workOrder.id}`)}
          >
            Ver Detalle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
