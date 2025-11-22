import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Field } from '@/lib/map-types'; // Usamos la definición que ya tienes
import { 
  Pencil, 
  Trash2, 
  RotateCcw, 
  Trash, 
  MapPin,
  Ruler,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldsTableProps {
  fields: Field[];
  onEdit?: (field: Field) => void;
  onDelete?: (field: Field) => void; // Soft delete
  onRestore?: (field: Field) => void;
  onHardDelete?: (field: Field) => void;
}

export function FieldsTable({ 
  fields, 
  onEdit, 
  onDelete,
  onRestore,
  onHardDelete,
}: FieldsTableProps) {

  // Helper para obtener el nombre del manager de forma segura
  const getManagerName = (field: any) => {
    if (field.manager) {
      return `${field.manager.name} ${field.manager.lastName || ''}`;
    }
    if (field.managerName) return field.managerName;
    return null;
  };

  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Nombre
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Dirección
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Capataz Encargado
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                Área (ha)
              </th>
              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                Parcelas
              </th>
              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-24 text-center text-muted-foreground">
                  No hay campos registrados que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              fields.map((field: any) => {
                const isDeleted = !!field.deletedAt;
                const managerName = getManagerName(field);
                
                return (
                  <tr
                    key={field.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50",
                      isDeleted && "bg-red-50/50 dark:bg-red-950/20"
                    )}
                  >
                    {/* Nombre */}
                    <td className={cn("p-4 align-middle", isDeleted && "text-red-600 dark:text-red-400")}>
                      <div className="font-medium">{field.name}</div>
                      {isDeleted && (
                        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          Eliminado
                        </span>
                      )}
                    </td>

                    {/* Dirección */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[200px]" title={field.address}>
                          {field.address || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Capataz */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {managerName ? (
                          <span className="text-sm font-medium">{managerName}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Sin asignar</span>
                        )}
                      </div>
                    </td>

                    {/* Área */}
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-mono font-semibold">
                          {field.area ? Number(field.area).toFixed(2) : '0.00'}
                        </span>
                        <Ruler className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </td>

{/* ... dentro del map ... */}

{/* Parcelas (Count) - DISEÑO MEJORADO */}
<td className="p-4 align-middle text-center">
  {/* Calculamos la cantidad */}
  {(field.plots?.length || field.plotCount || 0) > 0 ? (
    <div className="flex justify-center">
      <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-blue-100 px-2 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-100">
        {field.plots?.length || field.plotCount}
      </span>
    </div>
  ) : (
    <span className="text-sm text-muted-foreground/50">-</span>
  )}
</td>
                    {/* Acciones */}
                    <td className="p-4 align-middle">
                      <div className="flex justify-center gap-2">
                        {!isDeleted ? (
                          // Acciones para campos ACTIVOS
                          <>
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(field)}
                                title="Editar campo"
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(field)}
                                title="Mover a papelera"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </>
                        ) : (
                          // Acciones para campos ELIMINADOS (Papelera)
                          <>
                            {onRestore && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRestore(field)}
                                title="Restaurar campo"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            {onHardDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onHardDelete(field)}
                                title="Eliminar permanentemente"
                                className="text-red-700 hover:text-red-800 hover:bg-red-50"
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