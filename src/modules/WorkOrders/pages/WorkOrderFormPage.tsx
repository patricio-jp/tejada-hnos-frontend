import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { WorkOrderForm } from '../components/WorkOrderForm';
import { useWorkOrders } from '../hooks/useWorkOrders';
import type { CreateWorkOrderInput } from '../types';

export function WorkOrderFormPage() {
  const navigate = useNavigate();
  const { createWorkOrder, createWorkOrderStatus } = useWorkOrders();

  const handleSubmit = useCallback(
    async (formData: CreateWorkOrderInput) => {
      try {
        await createWorkOrder(formData);
        toast.success('Orden de trabajo creada', {
          description: 'La nueva orden se registró correctamente.',
        });
        navigate('/work-orders');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo crear la orden de trabajo';
        toast.error('Error al crear la orden de trabajo', {
          description: message,
        });
        throw error instanceof Error ? error : new Error(message);
      }
    },
    [createWorkOrder, navigate],
  );

  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Nueva Orden de Trabajo</h1>
        <p className="text-muted-foreground">
          Completa los datos para registrar una nueva orden de trabajo.
        </p>
      </div>

      {createWorkOrderStatus.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {createWorkOrderStatus.error instanceof Error
            ? createWorkOrderStatus.error.message
            : 'Ocurrió un error al crear la orden de trabajo.'}
        </div>
      )}

      <WorkOrderForm onSubmit={handleSubmit} />
    </div>
  );
}

export default WorkOrderFormPage;
