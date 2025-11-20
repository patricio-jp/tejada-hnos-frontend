import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Plot } from '@/types/plots'; // Asegúrate de que este tipo existe
import { 
  Pencil, 
  Trash2, 
  RotateCcw, 
  Trash, 
  MapPin,
  Ruler,
  Leaf,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PlotsTableProps {
  plots: Plot[];
  onEdit?: (plot: Plot) => void;
  onDelete?: (plot: Plot) => void; // Soft delete
  onRestore?: (plot: Plot) => void;
  onHardDelete?: (plot: Plot) => void;
}

export function PlotsTable({ 
  plots, 
  onEdit, 
  onDelete,
  onRestore,
  onHardDelete,
}: PlotsTableProps) {

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch (e) {
      return dateString;
    }
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
                Variedad
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                Área (ha)
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Fecha Plantación
              </th>
              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {plots.length === 0 ? (
              <tr>
                <td colSpan={5} className="h-24 text-center text-muted-foreground">
                  No hay parcelas registradas que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              plots.map((plot: any) => {
                const isDeleted = !!plot.deletedAt;
                const varietyName = plot.variety?.name || 'Sin variedad';
                
                return (
                  <tr
                    key={plot.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50",
                      isDeleted && "bg-red-50/50 dark:bg-red-950/20"
                    )}
                  >
                    {/* Nombre */}
                    <td className={cn("p-4 align-middle", isDeleted && "text-red-600 dark:text-red-400")}>
                      <div className="font-medium">{plot.name}</div>
                      {isDeleted && (
                        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          Eliminado
                        </span>
                      )}
                    </td>

                    {/* Variedad */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-3 w-3 text-green-600" />
                        <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                          {varietyName}
                        </Badge>
                      </div>
                    </td>

                    {/* Área */}
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-mono font-semibold">
                          {plot.area ? Number(plot.area).toFixed(4) : '0.0000'}
                        </span>
                        <Ruler className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </td>

                    {/* Fecha Plantación */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(plot.datePlanted)}</span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="p-4 align-middle">
                      <div className="flex justify-center gap-2">
                        {!isDeleted ? (
                          <>
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(plot)}
                                title="Editar parcela"
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(plot)}
                                title="Mover a papelera"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            {onRestore && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRestore(plot)}
                                title="Restaurar parcela"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            {onHardDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onHardDelete(plot)}
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