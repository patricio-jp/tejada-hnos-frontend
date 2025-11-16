import { Button } from '@/components/ui/button';
import type { Customer } from '@/types';
import { 
  Pencil, 
  Trash2, 
  Mail, 
  Phone, 
  RotateCcw, 
  Trash, 
  Calculator 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomersTableProps {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onRestore?: (customer: Customer) => void;
  onHardDelete?: (customer: Customer) => void;
  onRecalculate?: (customer: Customer) => void;
  recalculatingIds?: Set<string>;
}

export function CustomersTable({ 
  customers, 
  onEdit, 
  onDelete,
  onRestore,
  onHardDelete,
  onRecalculate,
  recalculatingIds = new Set()
}: CustomersTableProps) {
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Nombre
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                CUIT/CUIL
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Dirección
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Contacto
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                Total Gastado
              </th>
              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-24 text-center text-muted-foreground">
                  No hay clientes registrados
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const isDeleted = !!customer.deletedAt;
                const isRecalculating = recalculatingIds.has(customer.id);
                
                return (
                  <tr
                    key={customer.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50",
                      isDeleted && "bg-red-50 text-red-900 hover:bg-red-100"
                    )}
                  >
                    <td className={cn(
                      "p-4 align-middle",
                      isDeleted && "text-red-700 font-medium"
                    )}>
                      <div className="font-medium">{customer.name}</div>
                      {isDeleted && (
                        <span className="text-xs text-red-600">
                          (Eliminado)
                        </span>
                      )}
                    </td>
                    <td className={cn(
                      "p-4 align-middle",
                      isDeleted && "text-red-700"
                    )}>
                      <span className="text-sm">{customer.taxId || '-'}</span>
                    </td>
                    <td className={cn(
                      "p-4 align-middle",
                      isDeleted && "text-red-700"
                    )}>
                      <span className="text-sm">{customer.address || '-'}</span>
                    </td>
                    <td className={cn(
                      "p-4 align-middle",
                      isDeleted && "text-red-700"
                    )}>
                      <div className="flex flex-col gap-1">
                        {customer.contactEmail && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            <span>{customer.contactEmail}</span>
                          </div>
                        )}
                        {customer.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{customer.phoneNumber}</span>
                          </div>
                        )}
                        {!customer.contactEmail && !customer.phoneNumber && '-'}
                      </div>
                    </td>
                    <td className={cn(
                      "p-4 align-middle text-right",
                      isDeleted && "text-red-700"
                    )}>
                      <span className="text-sm font-semibold">
                        {formatCurrency(customer.totalSpent)}
                      </span>
                      {customer.totalOrders !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          {customer.totalOrders} {customer.totalOrders === 1 ? 'orden' : 'órdenes'}
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex justify-center gap-2">
                        {!isDeleted ? (
                          // Botones para clientes activos
                          <>
                            {onRecalculate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRecalculate(customer)}
                                title="Recalcular total gastado"
                                disabled={isRecalculating}
                                className={cn(isRecalculating && "opacity-50 cursor-not-allowed")}
                              >
                                <Calculator className={cn(
                                  "h-4 w-4 text-blue-600",
                                  isRecalculating && "animate-spin"
                                )} />
                              </Button>
                            )}
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(customer)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(customer)}
                                title="Eliminar (soft)"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </>
                        ) : (
                          // Botones para clientes eliminados (soft)
                          <>
                            {onRestore && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRestore(customer)}
                                title="Restaurar cliente"
                                className="text-green-600 hover:text-green-700"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            {onHardDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onHardDelete(customer)}
                                title="Eliminar permanentemente"
                                className="text-red-700 hover:text-red-800"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
