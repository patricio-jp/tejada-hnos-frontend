import { useCallback, useEffect, useState } from 'react';
import { workOrderApi } from '../utils/api';
import type { WorkOrder } from '../types';

type WorkOrdersState = {
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
};

export function useWorkOrders() {
  const [state, setState] = useState<WorkOrdersState>({
    workOrders: [],
    loading: true,
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

  useEffect(() => {
    void fetchWorkOrders();
  }, [fetchWorkOrders]);

  return {
    workOrders: state.workOrders,
    loading: state.loading,
    error: state.error,
    refetch: fetchWorkOrders,
  };
}

export default useWorkOrders;
