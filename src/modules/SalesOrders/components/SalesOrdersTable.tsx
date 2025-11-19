import { Eye, Pencil, Trash2 } from 'lucide-react';
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
import type { SalesOrder } from '@/types';

type SalesOrdersTableProps = {
  orders: SalesOrder[];
  onDelete: (id: string) => void;
};

type StatusBadge = {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
};

function formatStatus(status: SalesOrder['status']): StatusBadge {
  switch (status) {
    case 'PENDIENTE':
      return { label: 'Pendiente', variant: 'secondary' as const };
    case 'APROBADA':
      return { label: 'Aprobada', variant: 'default' as const };
    case 'DESPACHADA_PARCIAL':
      return { label: 'Despachada parcial', variant: 'outline' as const };
    case 'DESPACHADA_TOTAL':
      return { label: 'Despachada total', variant: 'outline' as const };
    case 'PAGADA':
      return { label: 'Pagada', variant: 'default' as const, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' };
    case 'CERRADA':
      return { label: 'Cerrada', variant: 'outline' as const };
    case 'CANCELADA':
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

function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '$ 0,00';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function SalesOrdersTable({ orders, onDelete }: SalesOrdersTableProps) {
  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%]">Cliente</TableHead>
            <TableHead className="w-[100px]">Estado</TableHead>
            <TableHead className="w-[120px]">Total</TableHead>
            <TableHead className="w-[40%] pl-4">Productos</TableHead>
            <TableHead className="w-[120px]">Fecha</TableHead>
            <TableHead className="w-[80px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No hay órdenes de venta para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const status = formatStatus(order.status);
              const canEdit = order.status === 'PENDIENTE';

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.customer.name}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className={status.className}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell className="pl-4">
                    <div className="space-y-1 text-sm">
                      {order.details.map((detail) => (
                        <div key={detail.id}>
                          <span className="font-medium text-foreground">
                            {detail.variety} {detail.caliber}
                          </span>
                          <span className="ml-2 text-muted-foreground">
                            {detail.quantityShipped ?? 0} / {detail.quantityKg} kg
                          </span>
                          {detail.status && detail.status !== 'PENDIENTE' && (
                            <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                              {detail.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            aria-label="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Ver detalles</TooltipContent>
                      </Tooltip>
                      {canEdit && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                      )}
                      {canEdit && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-destructive transition hover:text-destructive hover:bg-destructive/10"
                              aria-label="Eliminar"
                              onClick={() => onDelete(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar</TooltipContent>
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

export default SalesOrdersTable;
