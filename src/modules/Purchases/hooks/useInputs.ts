// src/modules/Purchases/hooks/useInputs.ts

import { useState, useEffect, useCallback } from 'react';
import type { Input } from '@/types';
import useAuth from '@/modules/Auth/hooks/useAuth';
import apiClient from '@/lib/api-client';

export function useInputs() {
  const [inputs, setInputs] = useState<Input[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const fetchInputs = useCallback(async () => {
    if (!accessToken) {
      console.log('useInputs: No access token available, skipping fetch');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.get<Input[]>('/inputs', { token: accessToken });
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
    fetchInputs,
  };
}
