import { Eye, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { WorkOrder } from '@/types';
import { canEditWorkOrder } from '../utils/work-order-permissions';

type WorkOrdersTableProps = {
  workOrders: WorkOrder[];
};

type StatusBadge = {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning';
  className?: string;
};

function formatStatus(status: WorkOrder['status']): StatusBadge {
  switch (status) {
    case 'PENDING':
      return { label: 'Pendiente', variant: 'secondary' as const };
    case 'IN_PROGRESS':
      return { label: 'En progreso', variant: 'default' as const };
    case 'COMPLETED':
      return { label: 'Completada', variant: 'outline' as const, className: 'text-green-600 border-green-100 bg-green-50 dark:border-green-900/40 dark:bg-green-900/20' };
    case 'UNDER_REVIEW':
      return { label: 'En revisión', variant: 'warning' as const };
    case 'CANCELLED':
      return { label: 'Cancelada', variant: 'destructive' as const };
    default:
      return { label: status, variant: 'outline' as const };
  }
}

function formatDate(value: string | undefined | null): string {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha inválida';
  return date.toLocaleDateString('es-AR', { timeZone: 'UTC' });
}

export function WorkOrdersTable({ workOrders }: WorkOrdersTableProps) {
  const navigate = useNavigate();

  const handleViewDetails = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };

  const handleEdit = (workOrderId: string) => {
    navigate(`/work-orders/edit/${workOrderId}`);
  };

  return (
    <TooltipProvider>
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha Programada</TableHead>
          <TableHead>Fecha Límite</TableHead>
          <TableHead>Asignado a</TableHead>
          <TableHead>Campo</TableHead>
          <TableHead>Parcela</TableHead>
          <TableHead className="w-[50px] text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workOrders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No hay órdenes de trabajo para mostrar.
            </TableCell>
          </TableRow>
        ) : (
          workOrders.map((workOrder) => {
            const firstPlot = workOrder.plots?.[0] as { name?: string; id?: string; field?: { name?: string }; fieldName?: string } | undefined;
            const status = formatStatus(workOrder.status);
            const firstPlotName = firstPlot?.name ?? firstPlot?.id ?? 'Sin parcela';
            const fieldName = firstPlot?.field?.name ?? firstPlot?.fieldName ?? 'Sin campo';
            const isEditable = canEditWorkOrder(workOrder);

            return (
              <TableRow key={workOrder.id}>
                <TableCell className="font-medium">{workOrder.title}</TableCell>
                <TableCell>
                  <Badge variant={status.variant} className={status.className}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(workOrder.scheduledDate)}</TableCell>
                <TableCell>{formatDate(workOrder.dueDate)}</TableCell>
                <TableCell>{workOrder.assignedTo?.name ?? 'Sin asignar'}</TableCell>
                <TableCell>{fieldName}</TableCell>
                <TableCell>{firstPlotName}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleViewDetails(workOrder.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          aria-label="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalles</TooltipContent>
                    </Tooltip>
                    {isEditable && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleEdit(workOrder.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
      </Table>
    </TooltipProvider>
  );
}

export default WorkOrdersTable;
