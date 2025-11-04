import { Button } from '@/components/ui/button';
import type { Supplier } from '../types/supplier';
import { Pencil, Trash2, Mail, Phone } from 'lucide-react';

interface SuppliersTableProps {
  suppliers: Supplier[];
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (supplier: Supplier) => void;
}

export function SuppliersTable({ suppliers, onEdit, onDelete }: SuppliersTableProps) {
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
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="h-24 text-center text-muted-foreground">
                  No hay proveedores registrados
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle">
                    <div className="font-medium">{supplier.name}</div>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="text-sm">{supplier.taxId || '-'}</span>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="text-sm">{supplier.address || '-'}</span>
                  </td>
                  <td className="p-4 align-middle">
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
                  <td className="p-4 align-middle">
                    <div className="flex gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(supplier)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(supplier)}
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
