import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { WorkOrderForm } from '../components/WorkOrderForm';
import { useWorkOrders } from '../hooks/useWorkOrders';
import { workOrderApi } from '../utils/api';
import type { CreateWorkOrderDTO, WorkOrder } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { canEditWorkOrder, getEditDisabledReason } from '../utils/work-order-permissions';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export function WorkOrderFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { createWorkOrder, updateWorkOrder, createWorkOrderStatus } = useWorkOrders();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      workOrderApi
        .getById(id)
        .then((data) => {
          setWorkOrder(data);
          setLoadError(null);
          
          // Validar si la orden puede editarse
          if (!canEditWorkOrder(data)) {
            const reason = getEditDisabledReason(data);
            setLoadError(reason);
            toast.error('No se puede editar esta orden', {
              description: reason,
            });
          }
        })
        .catch((error) => {
          setLoadError(error instanceof Error ? error.message : 'Error al cargar la orden');
          toast.error('Error al cargar la orden de trabajo');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = useCallback(
    async (formData: CreateWorkOrderDTO) => {
      try {
        if (isEditMode && id) {
          await updateWorkOrder(id, formData);
          toast.success('Orden de trabajo actualizada', {
            description: 'Los cambios se guardaron correctamente.',
          });
        } else {
          await createWorkOrder(formData);
          toast.success('Orden de trabajo creada', {
            description: 'La nueva orden se registró correctamente.',
          });
        }
        navigate('/work-orders');
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : `No se pudo ${isEditMode ? 'actualizar' : 'crear'} la orden de trabajo`;
        toast.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} la orden de trabajo`, {
          description: message,
        });
        throw error instanceof Error ? error : new Error(message);
      }
    },
    [createWorkOrder, updateWorkOrder, navigate, isEditMode, id],
  );

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl p-6 space-y-6">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (loadError) {
    const isEditRestricted = workOrder && !canEditWorkOrder(workOrder);
    
    return (
      <div className="container mx-auto max-w-3xl p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-destructive">
                {isEditRestricted ? 'Esta orden no puede editarse' : 'Error al cargar la orden'}
              </p>
              <p className="text-sm text-destructive/80">{loadError}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/work-orders')}
            >
              Volver a órdenes de trabajo
            </Button>
            {workOrder && (
              <Button
                variant="default"
                onClick={() => navigate(`/work-orders/${workOrder.id}`)}
              >
                Ver detalles
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? 'Modifica los datos de la orden de trabajo.'
            : 'Completa los datos para registrar una nueva orden de trabajo.'}
        </p>
      </div>

      {createWorkOrderStatus.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {createWorkOrderStatus.error instanceof Error
            ? createWorkOrderStatus.error.message
            : 'Ocurrió un error al procesar la orden de trabajo.'}
        </div>
      )}

      <WorkOrderForm initialData={workOrder || undefined} onSubmit={handleSubmit} />
    </div>
  );
}

export default WorkOrderFormPage;
