import { useState, useEffect, useCallback } from 'react';
import type { WorkOrder } from '@/modules/WorkOrders/types/work-orders';
import useAuth from '@/modules/Auth/hooks/useAuth';
import { workOrdersApi } from '../services/work-orders-api';

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const fetchWorkOrders = useCallback(async () => {
    if (!accessToken) {
      console.log('useWorkOrders: No access token available, skipping fetch');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await workOrdersApi.getMyWorkOrders(accessToken);
      setWorkOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching work orders:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchWorkOrders();
    }
  }, [accessToken, fetchWorkOrders]);

  return {
    workOrders,
    loading,
    error,
    refetch: fetchWorkOrders,
  };
}
