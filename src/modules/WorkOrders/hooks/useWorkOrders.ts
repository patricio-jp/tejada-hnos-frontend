import { useCallback, useEffect, useState } from 'react';
import { workOrderApi } from '../utils/api';
import type { CreateWorkOrderInput, WorkOrder } from '../types';

type WorkOrdersState = {
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
};

type CreateWorkOrderStatus = {
  loading: boolean;
  error: Error | null;
};

export function useWorkOrders() {
  const [state, setState] = useState<WorkOrdersState>({
    workOrders: [],
    loading: true,
    error: null,
  });

  const [createStatus, setCreateStatus] = useState<CreateWorkOrderStatus>({
    loading: false,
    error: null,
  });

  const fetchWorkOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await workOrderApi.getAll();
      setState({ workOrders: data, loading: false, error: null });
    } catch (error) {
      setState({
        workOrders: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido al cargar OTs',
      });
    }
  }, []);

  const createWorkOrder = useCallback(
    async (payload: CreateWorkOrderInput) => {
      setCreateStatus({ loading: true, error: null });
      try {
        const created = await workOrderApi.create(payload);
        setState((prev) => ({
          ...prev,
          workOrders: [created, ...prev.workOrders],
        }));
        setCreateStatus({ loading: false, error: null });
        return created;
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error('No se pudo crear la orden de trabajo');
        setCreateStatus({ loading: false, error: normalizedError });
        throw normalizedError;
      }
    },
    [],
  );

  useEffect(() => {
    void fetchWorkOrders();
  }, [fetchWorkOrders]);

  return {
    workOrders: state.workOrders,
    loading: state.loading,
    error: state.error,
    refetch: fetchWorkOrders,
    createWorkOrder,
    createWorkOrderStatus: createStatus,
  };
}

export default useWorkOrders;
