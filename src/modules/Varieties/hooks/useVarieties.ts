import { useState, useEffect, useCallback } from 'react';
import { varietyApi } from '../utils/variety-api';
import type { Variety, CreateVarietyDto, UpdateVarietyDto } from '../types/variety';

export function useVarieties() {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVarieties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await varietyApi.getAll();
      setVarieties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVarieties();
  }, [fetchVarieties]);

  const createVariety = useCallback(async (variety: CreateVarietyDto) => {
    try {
      setError(null);
      const newVariety = await varietyApi.create(variety);
      setVarieties(prev => [...prev, newVariety]);
      return newVariety;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const updateVariety = useCallback(async (id: string, variety: UpdateVarietyDto) => {
    try {
      setError(null);
      const updatedVariety = await varietyApi.update(id, variety);
      setVarieties(prev => prev.map(v => v.id === id ? updatedVariety : v));
      return updatedVariety;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const deleteVariety = useCallback(async (id: string) => {
    try {
      setError(null);
      await varietyApi.delete(id);
      setVarieties(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  return {
    varieties,
    loading,
    error,
    fetchVarieties,
    createVariety,
    updateVariety,
    deleteVariety,
  };
}
