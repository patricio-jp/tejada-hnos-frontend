import { useState, useEffect, useCallback } from 'react';
import type { Input } from '@/types';
import useAuth from '@/modules/Auth/hooks/useAuth';
import { workOrdersApi } from '../services/work-orders-api';

export function useInputs() {
  const [inputs, setInputs] = useState<Input[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const fetchInputs = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await workOrdersApi.getInputs(accessToken);
      setInputs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching inputs:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchInputs();
    }
  }, [accessToken, fetchInputs]);

  return {
    inputs,
    loading,
    error,
    refetch: fetchInputs,
  };
}
