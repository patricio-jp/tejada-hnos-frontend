import { useState, useEffect, useCallback } from 'react';
import type { WorkOrder } from '@/types';
import useAuth from '@/modules/Auth/hooks/useAuth';
import { workOrdersApi } from '../services/work-orders-api';

export function useWorkOrder(id: string) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const fetchWorkOrder = useCallback(async () => {
    if (!accessToken || !id) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await workOrdersApi.getWorkOrderById(id, accessToken);
      setWorkOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching work order:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => {
    if (accessToken && id) {
      fetchWorkOrder();
    }
  }, [accessToken, id, fetchWorkOrder]);

  return {
    workOrder,
    loading,
    error,
    refetch: fetchWorkOrder,
  };
}
