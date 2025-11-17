// src/modules/Purchases/hooks/useSuppliers.ts

import { useState, useEffect, useCallback } from 'react';
import type { Supplier } from '@/types';
import useAuth from '@/modules/Auth/hooks/useAuth';
import apiClient from '@/lib/api-client';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const fetchSuppliers = useCallback(async () => {
    if (!accessToken) {
      console.log('useSuppliers: No access token available, skipping fetch');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.get<Supplier[]>('/suppliers', { token: accessToken });
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchSuppliers();
    }
  }, [accessToken, fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
  };
}
