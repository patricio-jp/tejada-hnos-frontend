/**
 * usePlots Hook - Gestión de estado para Plots
 * * Hook personalizado que encapsula la lógica de comunicación con la API de Plots
 * y gestiona el estado local de los plots.
 */

import { useState, useEffect, useCallback } from 'react';
import { plotApi, type CreatePlotDto, type UpdatePlotDto, type PlotFilters } from '../utils/plot-api';
import type { Plot } from '@/types/plots';

// Hacemos fieldId opcional para poder usar el hook de forma global
export function usePlots(fieldId?: string) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch por Campo (Comportamiento original - Editor)
  const fetchPlots = useCallback(async () => {
    if (!fieldId) return; // Si no hay ID, no hacemos nada automático
    
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

  // 2. NUEVO: Fetch Global con Filtros (Para la lista general)
  const fetchAllPlots = useCallback(async (filters?: PlotFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await plotApi.getAll(filters);
      setPlots(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar solo si hay fieldId (comportamiento para editores específicos)
  useEffect(() => {
    if (fieldId && fieldId !== 'dummy-id') {
      fetchPlots();
    } else {
      // Si no hay fieldId o es dummy, dejamos de cargar inicialmente
      // para que el componente pueda llamar a fetchAllPlots manualmente
      setLoading(false);
    }
  }, [fetchPlots, fieldId]);

  /**
   * Crear un nuevo plot
   */
  const createPlot = useCallback(async (plotData: CreatePlotDto): Promise<Plot> => {
    // Validamos que tengamos un fieldId ya sea del hook o del DTO
    if (!fieldId && !plotData.fieldId) throw new Error('fieldId es requerido');
    const targetFieldId = fieldId || plotData.fieldId;
    
    try {
      setError(null);
      const newPlot = await plotApi.create(targetFieldId, plotData);
      
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
    try {
      setError(null);
      console.log('🔧 [usePlots] Antes de update - Plots actuales:', plots);
      
      const updatedPlot = await plotApi.update(plotId, plotData);
      console.log('🔧 [usePlots] Respuesta del update:', JSON.stringify(updatedPlot, null, 2));
      
      // Actualizar en el estado local
      const newPlots = plots.map(plot => {
          if (plot.id === plotId) {
            return updatedPlot;
          }
          return plot;
      });
      
      setPlots(newPlots);
      return updatedPlot;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, [plots]);

  /**
   * Eliminar un plot permanentemente (hard delete)
   */
  const deletePlot = useCallback(async (plotId: string): Promise<void> => {
    try {
      setError(null);
      await plotApi.delete(plotId);
      setPlots(prev => prev.filter(plot => plot.id !== plotId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Eliminar un plot (soft delete - puede ser restaurado)
   */
  const softDeletePlot = useCallback(async (plotId: string): Promise<void> => {
    try {
      setError(null);
      await plotApi.softDelete(plotId);
      setPlots(prev => prev.filter(plot => plot.id !== plotId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Restaurar un plot eliminado
   */
  const restorePlot = useCallback(async (plotId: string): Promise<void> => {
    try {
      setError(null);
      const restoredPlot = await plotApi.restore(plotId);
      setPlots(prev => [restoredPlot, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Obtener un plot por su ID
   */
  const getPlotById = useCallback(async (plotId: string): Promise<Plot> => {
    try {
      setError(null);
      return await plotApi.getById(plotId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    // Estado
    plots,
    loading,
    error,
    fieldId,
    
    // Métodos
    fetchPlots,
    fetchAllPlots, // <--- Exportamos la nueva función para listados globales
    createPlot,
    updatePlot,
    deletePlot,
    softDeletePlot,
    restorePlot,
    getPlotById,
    setPlots, // Exponer setPlots para actualizaciones locales
  };
}