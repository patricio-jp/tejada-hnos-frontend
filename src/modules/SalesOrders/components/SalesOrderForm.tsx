import { useEffect, useMemo, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useAuth from '@/modules/Auth/hooks/useAuth';
import { customerApi } from '@/modules/Customers/utils/customer-api';
import type { CreateSalesOrderInput } from '../utils/sales-order-api';

type SalesOrderFormProps = {
  onSubmit: (payload: CreateSalesOrderInput) => Promise<void> | void;
  onCancel?: () => void;
  submitting?: boolean;
};

type CustomerOption = {
  id: string;
  name: string;
  lastName?: string;
};

type DetailLine = {
  id: string;
  variety: string;
  caliber: string;
  unitPrice: number;
  quantityKg: number;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

function createEmptyLine(): DetailLine {
  return {
    id: crypto.randomUUID(),
    variety: '',
    caliber: '',
    unitPrice: 0,
    quantityKg: 0,
  };
}

export function SalesOrderForm({ onSubmit, onCancel, submitting = false }: SalesOrderFormProps) {
  const auth = useAuth();

  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);

  const [details, setDetails] = useState<DetailLine[]>([createEmptyLine()]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      setLoadingCustomers(true);
      setCustomersError(null);
      try {
        const data = await customerApi.getAll();
        if (!cancelled) {
          const options = data.map((customer) => ({
            id: customer.id,
            name: customer.name,
            // lastName: customer.lastName,
          }));
          setCustomers(options);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'No se pudieron cargar los clientes';
          setCustomersError(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingCustomers(false);
        }
      }
    }

    void loadCustomers();
    return () => {
      cancelled = true;
    };
  }, [auth.accessToken]);

  const orderTotal = useMemo(() => {
    return details.reduce((acc, line) => acc + line.unitPrice * line.quantityKg, 0);
  }, [details]);

  const handleDetailChange = (lineId: string, field: keyof DetailLine, value: string) => {
    setDetails((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        if (field === 'unitPrice' || field === 'quantityKg') {
          const numericValue = Number(value);
          return { ...line, [field]: Number.isNaN(numericValue) ? 0 : numericValue };
        }
        return { ...line, [field]: value };
      }),
    );
  };

  const handleAddLine = () => {
    setDetails((prev) => [...prev, createEmptyLine()]);
  };

  const handleRemoveLine = (lineId: string) => {
    setDetails((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== lineId) : prev));
  };

  const validateForm = () => {
    if (!customerId) {
      setFormError('Selecciona un cliente para registrar la orden.');
      return false;
    }

    const hasValidLines = details.some(
      (line) => line.variety.trim() && line.caliber.trim() && line.unitPrice > 0 && line.quantityKg > 0,
    );

    if (!hasValidLines) {
      setFormError('Agrega al menos una línea con variedad, calibre, precio y cantidad válidos.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    const payload: CreateSalesOrderInput = {
      customerId,
      details: details
        .filter((line) => line.variety.trim() && line.caliber.trim() && line.unitPrice > 0 && line.quantityKg > 0)
        .map((line) => ({
          variety: line.variety.trim(),
          caliber: line.caliber.trim(),
          unitPrice: line.unitPrice,
          quantityKg: line.quantityKg,
        })),
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="customer">Cliente *</Label>
          <select
            id="customer"
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            disabled={loadingCustomers || submitting}
          >
            <option value="">Selecciona un cliente</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
                {/* {customer.lastName ? ` ${customer.lastName}` : ''} */}
              </option>
            ))}
          </select>
          {loadingCustomers && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando clientes...
            </p>
          )}
          {customersError && <p className="text-sm text-destructive">{customersError}</p>}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Detalle de productos</h2>
              <p className="text-sm text-muted-foreground">
                Agrega las variedades, calibres y cantidades solicitadas por el cliente.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={handleAddLine} disabled={submitting}>
              Agregar línea
            </Button>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Variedad</TableHead>
                  <TableHead className="min-w-[150px]">Calibre</TableHead>
                  <TableHead className="min-w-[140px] text-right">Precio unitario</TableHead>
                  <TableHead className="min-w-[140px] text-right">Cantidad (kg)</TableHead>
                  <TableHead className="min-w-[140px] text-right">Subtotal</TableHead>
                  <TableHead className="w-[60px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.map((line) => {
                  const subtotal = line.unitPrice * line.quantityKg;

                  return (
                    <TableRow key={line.id}>
                      <TableCell>
                        <Input
                          value={line.variety}
                          onChange={(event) => handleDetailChange(line.id, 'variety', event.target.value)}
                          placeholder="Ej: Chandler"
                          disabled={submitting}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.caliber}
                          onChange={(event) => handleDetailChange(line.id, 'caliber', event.target.value)}
                          placeholder="Ej: LARGE"
                          disabled={submitting}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.unitPrice || ''}
                          onChange={(event) => handleDetailChange(line.id, 'unitPrice', event.target.value)}
                          className="text-right"
                          disabled={submitting}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          step="0.1"
                          value={line.quantityKg || ''}
                          onChange={(event) => handleDetailChange(line.id, 'quantityKg', event.target.value)}
                          className="text-right"
                          disabled={submitting}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(subtotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLine(line.id)}
                          disabled={details.length === 1 || submitting}
                          aria-label="Eliminar línea"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 border-t pt-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total general</p>
            <p className="text-2xl font-semibold">{formatCurrency(orderTotal)}</p>
          </div>
        </div>

        {formError && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
              </>
            ) : (
              'Guardar orden'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default SalesOrderForm;
