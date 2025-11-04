import { Button } from '@/components/ui/button';
import type { Customer } from '../types/customer';
import { Pencil, Trash2, Mail, Phone } from 'lucide-react';

interface CustomersTableProps {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

export function CustomersTable({ customers, onEdit, onDelete }: CustomersTableProps) {
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
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="h-24 text-center text-muted-foreground">
                  No hay clientes registrados
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle">
                    <div className="font-medium">{customer.name}</div>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="text-sm">{customer.taxId || '-'}</span>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="text-sm">{customer.address || '-'}</span>
                  </td>
                  <td className="p-4 align-middle">
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
                  <td className="p-4 align-middle">
                    <div className="flex gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(customer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(customer)}
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
