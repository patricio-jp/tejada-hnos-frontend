/**
 * usePlots Hook - Gestión de estado para Plots
 * 
 * Hook personalizado que encapsula la lógica de comunicación con la API de Plots
 * y gestiona el estado local de los plots.
 */

import { useState, useEffect, useCallback } from 'react';
import { plotApi, type CreatePlotDto, type UpdatePlotDto } from '../utils/plot-api';
import type { Plot } from '@/types/plots';

export function usePlots(fieldId: string) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener todos los plots del campo
   */
  const fetchPlots = useCallback(async () => {
    if (!fieldId) {
      setPlots([]); // Limpiar plots si no hay fieldId
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await plotApi.getAllByField(fieldId);
      setPlots(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener plots:', err);
    } finally {
      setLoading(false);
    }
  }, [fieldId]);

  /**
   * Cargar plots al montar o cuando cambie fieldId
   */
  useEffect(() => {
    fetchPlots();
  }, [fetchPlots]);

  /**
   * Crear un nuevo plot
   */
  const createPlot = useCallback(async (plotData: CreatePlotDto): Promise<Plot> => {
    if (!fieldId) throw new Error('fieldId es requerido');
    
    try {
      setError(null);
      const newPlot = await plotApi.create(fieldId, plotData);
      
      // Agregar al estado local
      setPlots(prev => [newPlot, ...prev]);
      
      return newPlot;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, [fieldId]);

  /**
   * Actualizar un plot existente
   */
  const updatePlot = useCallback(async (plotId: string, plotData: UpdatePlotDto): Promise<Plot> => {
    if (!fieldId) throw new Error('fieldId es requerido');
    
    try {
      setError(null);
      const updatedPlot = await plotApi.update(fieldId, plotId, plotData);
      
      // Actualizar en el estado local
      setPlots(prev => prev.map(plot => 
        plot.id === plotId ? updatedPlot : plot
      ));
      
      return updatedPlot;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, [fieldId]);

  /**
   * Eliminar un plot permanentemente (hard delete)
   */
  const deletePlot = useCallback(async (plotId: string): Promise<void> => {
    if (!fieldId) throw new Error('fieldId es requerido');
    
    try {
      setError(null);
      await plotApi.delete(fieldId, plotId);
      
      // Remover del estado local
      setPlots(prev => prev.filter(plot => plot.id !== plotId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, [fieldId]);

  /**
   * Restaurar un plot eliminado
   */
  const restorePlot = useCallback(async (plotId: string): Promise<void> => {
    if (!fieldId) throw new Error('fieldId es requerido');
    
    try {
      setError(null);
      const restoredPlot = await plotApi.restore(fieldId, plotId);
      
      // Agregar de vuelta al estado local
      setPlots(prev => [restoredPlot, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, [fieldId]);

  /**
   * Obtener un plot por su ID
   */
  const getPlotById = useCallback(async (plotId: string): Promise<Plot> => {
    if (!fieldId) throw new Error('fieldId es requerido');
    
    try {
      setError(null);
      return await plotApi.getById(fieldId, plotId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, [fieldId]);

  return {
    // Estado
    plots,
    loading,
    error,
    fieldId,
    
    // Métodos
    fetchPlots,
    createPlot,
    updatePlot,
    deletePlot,
    restorePlot,
    getPlotById,
    setPlots, // Exponer setPlots para actualizaciones locales
  };
}
