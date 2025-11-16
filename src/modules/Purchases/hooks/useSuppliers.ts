// src/modules/Purchases/hooks/useSuppliers.ts

import { useState, useEffect, useCallback } from 'react';
import type { Supplier } from '@/types';
import useAuth from '@/modules/Auth/hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
      const response = await fetch(`${API_BASE_URL}/suppliers`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('useSuppliers: Error response', errorText);
        throw new Error('Error al cargar los proveedores');
      }

      const { data } = await response.json();
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
