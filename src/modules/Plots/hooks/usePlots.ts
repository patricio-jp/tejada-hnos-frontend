/**
 * usePlots Hook - Gestión de estado para Plots
 * 
 * Hook personalizado que encapsula la lógica de comunicación con la API de Plots
 * y gestiona el estado local de las parcelas.
 */

import { useState, useEffect, useCallback } from 'react';
import { plotApi, type CreatePlotDto, type UpdatePlotDto, type PlotFilters } from '../utils/plot-api';
import type { Plot } from '@/types/plots';

export function usePlots(initialFilters?: PlotFilters) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PlotFilters | undefined>(initialFilters);

  /**
   * Obtener todas las parcelas con filtros
   */
  const fetchPlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await plotApi.getAll(filters);
      setPlots(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener plots:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Cargar plots al montar o cuando cambien los filtros
   */
  useEffect(() => {
    fetchPlots();
  }, [fetchPlots]);

  /**
   * Crear una nueva parcela en un campo específico (nested route)
   * Este es el método preferido cuando se crea desde el contexto de un field
   */
  const createPlotInField = useCallback(async (
    fieldId: string, 
    plotData: Omit<CreatePlotDto, 'fieldId'>
  ): Promise<Plot> => {
    try {
      setError(null);
      const newPlot = await plotApi.createInField(fieldId, plotData);
      
      // Agregar al estado local
      setPlots(prev => [newPlot, ...prev]);
      
      return newPlot;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err; // Re-lanzar para que el componente pueda manejarlo
    }
  }, []);

  /**
   * Crear una nueva parcela (método directo)
   */
  const createPlot = useCallback(async (plotData: CreatePlotDto): Promise<Plot> => {
    try {
      setError(null);
      const newPlot = await plotApi.create(plotData);
      
      // Agregar al estado local
      setPlots(prev => [newPlot, ...prev]);
      
      return newPlot;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Actualizar una parcela existente
   */
  const updatePlot = useCallback(async (id: string, plotData: UpdatePlotDto): Promise<Plot> => {
    try {
      setError(null);
      const updatedPlot = await plotApi.update(id, plotData);
      
      // Actualizar en el estado local
      setPlots(prev => prev.map(plot => 
        plot.id === id ? updatedPlot : plot
      ));
      
      return updatedPlot;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Eliminar una parcela (soft delete)
   */
  const deletePlot = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await plotApi.delete(id);
      
      // Remover del estado local
      setPlots(prev => prev.filter(plot => plot.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Restaurar una parcela eliminada
   */
  const restorePlot = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      const restoredPlot = await plotApi.restore(id);
      
      // Agregar de vuelta al estado local
      setPlots(prev => [restoredPlot, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Eliminar permanentemente una parcela (hard delete)
   * ⚠️ OPERACIÓN IRREVERSIBLE
   */
  const hardDeletePlot = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await plotApi.hardDelete(id);
      
      // Remover del estado local
      setPlots(prev => prev.filter(plot => plot.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Obtener una parcela por su ID
   */
  const getPlotById = useCallback(async (id: string): Promise<Plot> => {
    try {
      setError(null);
      return await plotApi.getById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Obtener parcelas de un campo específico
   */
  const getPlotsByFieldId = useCallback(async (fieldId: string): Promise<Plot[]> => {
    try {
      setError(null);
      return await plotApi.getByFieldId(fieldId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Actualizar filtros (dispara nuevo fetch)
   */
  const updateFilters = useCallback((newFilters: PlotFilters | undefined) => {
    setFilters(newFilters);
  }, []);

  return {
    // Estado
    plots,
    loading,
    error,
    filters,
    
    // Métodos
    fetchPlots,
    createPlot,
    createPlotInField,
    updatePlot,
    deletePlot,
    restorePlot,
    hardDeletePlot,
    getPlotById,
    getPlotsByFieldId,
    updateFilters,
  };
}
