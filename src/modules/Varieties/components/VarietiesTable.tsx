import { Button } from '@/components/ui/button';
import type { Variety } from '../types/variety';
import { Pencil, Trash2 } from 'lucide-react';

interface VarietiesTableProps {
  varieties: Variety[];
  onEdit?: (variety: Variety) => void;
  onDelete?: (variety: Variety) => void;
}

export function VarietiesTable({ varieties, onEdit, onDelete }: VarietiesTableProps) {
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
                Descripción
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {varieties.length === 0 ? (
              <tr>
                <td colSpan={3} className="h-24 text-center text-muted-foreground">
                  No hay variedades registradas
                </td>
              </tr>
            ) : (
              varieties.map((variety) => (
                <tr
                  key={variety.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle">
                    <div className="font-medium">{variety.name}</div>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="text-sm">{variety.description || '-'}</span>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(variety)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(variety)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
