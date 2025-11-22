/**
 * useVarieties Hook - Obtener listado de variedades
 */

import { useState, useEffect, useCallback } from 'react';
import { varietyApi } from '../utils/variety-api';
import type { Variety } from '@/types/varieties';

export function useVarieties() {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener todas las variedades
   */
  const fetchVarieties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await varietyApi.getAll();
      setVarieties(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener variedades:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar variedades al montar
   */
  useEffect(() => {
    fetchVarieties();
  }, [fetchVarieties]);

  return {
    varieties,
    loading,
    error,
    fetchVarieties,
  };
}
