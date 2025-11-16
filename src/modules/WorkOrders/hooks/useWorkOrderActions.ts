import { useState } from 'react';
import { WorkOrderStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface UseWorkOrderActionsProps {
  workOrder: {
    id: string;
    status: WorkOrderStatus;
    assignedToId: string | null;
  };
  onSuccess?: () => void;
}

interface WorkOrderAction {
  label: string;
  nextStatus: WorkOrderStatus;
  description: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

export function useWorkOrderActions({ workOrder, onSuccess }: UseWorkOrderActionsProps) {
  const { user, accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determinar rol del usuario
  const userRole = (user as any)?.role || '';
  const isOperario = userRole === 'OPERARIO';
  const isCapataz = userRole === 'CAPATAZ';
  const isAdmin = userRole === 'ADMIN';
  const isAssigned = workOrder.assignedToId === user?.id;

  // Definir acciones disponibles según el estado actual y el rol
  const getAvailableActions = (): WorkOrderAction[] => {
    const actions: WorkOrderAction[] = [];

    // Operario (solo si está asignado)
    if (isOperario && isAssigned) {
      switch (workOrder.status) {
        case 'PENDING':
          actions.push({
            label: 'Iniciar Trabajo',
            nextStatus: 'IN_PROGRESS',
            description: 'Marca esta orden como en progreso',
            variant: 'default',
          });
          break;
        case 'IN_PROGRESS':
          actions.push({
            label: 'Enviar a Revisión',
            nextStatus: 'UNDER_REVIEW',
            description: 'Marca el trabajo como terminado y envía para revisión del capataz',
            variant: 'default',
          });
          break;
      }
    }

    // Capataz o Admin
    if (isCapataz || isAdmin) {
      switch (workOrder.status) {
        case 'PENDING':
          actions.push(
            {
              label: 'Iniciar Trabajo',
              nextStatus: 'IN_PROGRESS',
              description: 'Marca esta orden como en progreso',
              variant: 'default',
            },
            {
              label: 'Cancelar Orden',
              nextStatus: 'CANCELLED',
              description: 'Cancela esta orden de trabajo',
              variant: 'destructive',
            }
          );
          break;
        case 'IN_PROGRESS':
          actions.push(
            {
              label: 'Enviar a Revisión',
              nextStatus: 'UNDER_REVIEW',
              description: 'Marca como terminado y listo para revisión',
              variant: 'default',
            },
            {
              label: 'Cancelar Orden',
              nextStatus: 'CANCELLED',
              description: 'Cancela esta orden de trabajo',
              variant: 'destructive',
            }
          );
          break;
        case 'UNDER_REVIEW':
          actions.push(
            {
              label: 'Reabrir (Agregar Actividades)',
              nextStatus: 'IN_PROGRESS',
              description: 'Devuelve la orden a progreso para agregar más actividades',
              variant: 'outline',
            },
            {
              label: 'Aprobar y Cerrar',
              nextStatus: 'COMPLETED',
              description: 'Aprueba el trabajo y cierra la orden',
              variant: 'default',
            },
            {
              label: 'Cancelar Orden',
              nextStatus: 'CANCELLED',
              description: 'Cancela esta orden de trabajo',
              variant: 'destructive',
            }
          );
          break;
      }
    }

    return actions;
  };

  const updateStatus = async (nextStatus: WorkOrderStatus) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/work-orders/${workOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el estado de la orden');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    availableActions: getAvailableActions(),
    updateStatus,
    loading,
    error,
    canModify: (isOperario && isAssigned) || isCapataz || isAdmin,
  };
}
