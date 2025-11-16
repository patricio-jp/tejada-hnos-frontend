import { Button } from '@/components/ui/button';
import type { Supplier } from '@/types';
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

interface SuppliersTableProps {
  suppliers: Supplier[];
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (supplier: Supplier) => void;
  onRestore?: (supplier: Supplier) => void;
  onHardDelete?: (supplier: Supplier) => void;
  onRecalculate?: (supplier: Supplier) => void;
  recalculatingIds?: Set<string>;
}

/**
 * Tabla de proveedores con funcionalidades completas.
 * 
 * Características:
 * - Visualización de datos básicos y contacto
 * - Columna de total suministrado con formato de moneda
 * - Styling diferenciado para registros eliminados (soft delete)
 * - Botones: Calculator (recalcular), Edit, Soft Delete, Restore, Hard Delete
 * - Estado de loading visual para recálculo (spinner)
 */
export function SuppliersTable({ 
  suppliers, 
  onEdit, 
  onDelete,
  onRestore,
  onHardDelete,
  onRecalculate,
  recalculatingIds = new Set()
}: SuppliersTableProps) {
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
                Total Suministrado
              </th>
              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-24 text-center text-muted-foreground">
                  No hay proveedores registrados
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => {
                const isDeleted = !!supplier.deletedAt;
                const isRecalculating = recalculatingIds.has(supplier.id);
                
                return (
                  <tr
                    key={supplier.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50",
                      isDeleted && "bg-red-50 text-red-900 hover:bg-red-100"
                    )}
                  >
                    <td className={cn(
                      "p-4 align-middle",
                      isDeleted && "text-red-700 font-medium"
                    )}>
                      <div className="font-medium">{supplier.name}</div>
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
                      <span className="text-sm">{supplier.taxId || '-'}</span>
                    </td>
                    <td className={cn(
                      "p-4 align-middle",
                      isDeleted && "text-red-700"
                    )}>
                      <span className="text-sm">{supplier.address || '-'}</span>
                    </td>
                    <td className={cn(
                      "p-4 align-middle",
                      isDeleted && "text-red-700"
                    )}>
                      <div className="flex flex-col gap-1">
                        {supplier.contactEmail && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            <span>{supplier.contactEmail}</span>
                          </div>
                        )}
                        {supplier.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{supplier.phoneNumber}</span>
                          </div>
                        )}
                        {!supplier.contactEmail && !supplier.phoneNumber && '-'}
                      </div>
                    </td>
                    <td className={cn(
                      "p-4 align-middle text-right",
                      isDeleted && "text-red-700"
                    )}>
                      <span className="text-sm font-semibold">
                        {formatCurrency(supplier.totalSupplied)}
                      </span>
                      {supplier.totalOrders !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          {supplier.totalOrders} {supplier.totalOrders === 1 ? 'orden' : 'órdenes'}
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex justify-center gap-2">
                        {!isDeleted ? (
                          // Botones para proveedores activos
                          <>
                            {onRecalculate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRecalculate(supplier)}
                                title="Recalcular total suministrado"
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
                                onClick={() => onEdit(supplier)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(supplier)}
                                title="Eliminar (soft)"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </>
                        ) : (
                          // Botones para proveedores eliminados (soft)
                          <>
                            {onRestore && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRestore(supplier)}
                                title="Restaurar proveedor"
                                className="text-green-600 hover:text-green-700"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            {onHardDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onHardDelete(supplier)}
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
