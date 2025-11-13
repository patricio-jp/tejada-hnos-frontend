import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { WorkOrder } from '../types';

type WorkOrdersTableProps = {
  workOrders: WorkOrder[];
};

type StatusBadge = {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha Programada</TableHead>
          <TableHead>Asignado a</TableHead>
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
            const firstPlot = workOrder.plots?.[0] as { name?: string; id?: string } | undefined;
            const status = formatStatus(workOrder.status);
            const firstPlotName = firstPlot?.name ?? firstPlot?.id ?? 'Sin parcela';

            return (
              <TableRow key={workOrder.id}>
                <TableCell className="font-medium">{workOrder.title}</TableCell>
                <TableCell>
                  <Badge variant={status.variant} className={status.className}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(workOrder.scheduledDate)}</TableCell>
                <TableCell>{workOrder.assignedTo?.name ?? 'Sin asignar'}</TableCell>
                <TableCell>{firstPlotName}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
                        aria-label="Acciones"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

export default WorkOrdersTable;
