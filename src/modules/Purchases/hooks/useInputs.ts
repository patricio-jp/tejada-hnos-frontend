// src/modules/Purchases/hooks/useInputs.ts

import { useState, useEffect, useCallback } from 'react';
import type { Input } from '../types';
import useAuth from '@/modules/Auth/hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
      const response = await fetch(`${API_BASE_URL}/inputs`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('useInputs: Error response', errorText);
        throw new Error('Error al cargar los insumos');
      }

      const { data } = await response.json();
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
