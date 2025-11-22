import { useState, useEffect, useCallback } from 'react';
import type { Input, CreateInputDto, UpdateInputDto } from '@/types';
import useAuth from '@/modules/Auth/hooks/useAuth';
import { inputsApi } from '../services/inputs-api';

export function useInputs() {
  const [inputs, setInputs] = useState<Input[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const fetch = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);

    try {
      const data = await inputsApi.getAll(accessToken);
      setInputs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching inputs:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) fetch();
  }, [accessToken, fetch]);

  const createInput = useCallback(
    async (payload: CreateInputDto) => {
      if (!accessToken) throw new Error('No autorizado');
      try {
        const created = await inputsApi.create(payload, accessToken);
        setInputs((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error creando insumo';
        // Do not set global fetch error for operation-level errors; let caller handle it
        throw new Error(msg);
      }
    },
    [accessToken]
  );

  const updateInput = useCallback(
    async (id: string, payload: UpdateInputDto) => {
      if (!accessToken) throw new Error('No autorizado');
      try {
        const updated = await inputsApi.update(id, payload, accessToken);
        setInputs((prev) => prev.map((i) => (i.id === id ? updated : i)));
        return updated;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error actualizando insumo';
        throw new Error(msg);
      }
    },
    [accessToken]
  );

  const deleteInput = useCallback(
    async (id: string) => {
      if (!accessToken) throw new Error('No autorizado');
      try {
        await inputsApi.remove(id, accessToken);
        setInputs((prev) => prev.filter((i) => i.id !== id));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error eliminando insumo';
        throw new Error(msg);
      }
    },
    [accessToken]
  );

  return {
    inputs,
    loading,
    error,
    refetch: fetch,
    createInput,
    updateInput,
    deleteInput,
  };
}

export default useInputs;
