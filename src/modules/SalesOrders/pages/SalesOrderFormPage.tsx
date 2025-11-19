import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import useAuth from '@/modules/Auth/hooks/useAuth';
import { SalesOrderForm } from '../components/SalesOrderForm';
import { salesOrderApi, type CreateSalesOrderInput } from '../utils/sales-order-api';

export function SalesOrderFormPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = useCallback(
    async (data: CreateSalesOrderInput) => {
      if (!auth.accessToken) {
        toast.error('No se encontró un token de autenticación');
        return;
      }

      setSubmitting(true);
      try {
        await salesOrderApi.create(data, auth.accessToken);
        toast.success('Orden de venta creada correctamente');
        navigate('/sales-orders');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo crear la orden de venta';
        toast.error('Error al crear la orden de venta', { description: message });
      } finally {
        setSubmitting(false);
      }
    },
    [auth.accessToken, navigate],
  );

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Nueva Orden de Venta</h1>
        <p className="text-muted-foreground">
          Completa la información del cliente y los productos solicitados para registrar una nueva orden de venta.
        </p>
      </div>

      <div className="rounded-md border bg-card p-6 shadow-lg">
        <SalesOrderForm
          onSubmit={handleCreate}
          onCancel={() => navigate('/sales-orders')}
          submitting={submitting}
        />
      </div>
    </div>
  );
}

export default SalesOrderFormPage;
