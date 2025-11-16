/**
 * useFields Hook - Gestión de estado para Fields
 * 
 * Hook personalizado que encapsula la lógica de comunicación con la API de Fields
 * y gestiona el estado local de los campos.
 */

import { useState, useEffect, useCallback } from 'react';
import { fieldApi, type CreateFieldDto, type UpdateFieldDto, type FieldFilters } from '../utils/field-api';
import type { Field } from '@/types/fields';

export function useFields(initialFilters?: FieldFilters) {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FieldFilters | undefined>(initialFilters);

  /**
   * Obtener todos los campos con filtros
   */
  const fetchFields = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fieldApi.getAll(filters);
      setFields(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener fields:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Cargar fields al montar o cuando cambien los filtros
   */
  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  /**
   * Crear un nuevo campo
   */
  const createField = useCallback(async (fieldData: CreateFieldDto): Promise<Field> => {
    try {
      setError(null);
      const newField = await fieldApi.create(fieldData);
      
      // Agregar al estado local
      setFields(prev => [newField, ...prev]);
      
      return newField;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err; // Re-lanzar para que el componente pueda manejarlo
    }
  }, []);

  /**
   * Actualizar un campo existente
   */
  const updateField = useCallback(async (id: string, fieldData: UpdateFieldDto): Promise<Field> => {
    try {
      setError(null);
      const updatedField = await fieldApi.update(id, fieldData);
      
      // Actualizar en el estado local
      setFields(prev => prev.map(field => 
        field.id === id ? updatedField : field
      ));
      
      return updatedField;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Eliminar un campo (soft delete)
   */
  const deleteField = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await fieldApi.delete(id);
      
      // Remover del estado local
      setFields(prev => prev.filter(field => field.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Restaurar un campo eliminado
   */
  const restoreField = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      const restoredField = await fieldApi.restore(id);
      
      // Agregar de vuelta al estado local
      setFields(prev => [restoredField, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Eliminar permanentemente un campo (hard delete)
   * ⚠️ OPERACIÓN IRREVERSIBLE
   */
  const hardDeleteField = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await fieldApi.hardDelete(id);
      
      // Remover del estado local
      setFields(prev => prev.filter(field => field.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Obtener un campo por su ID
   */
  const getFieldById = useCallback(async (id: string): Promise<Field> => {
    try {
      setError(null);
      return await fieldApi.getById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Actualizar filtros (dispara nuevo fetch)
   */
  const updateFilters = useCallback((newFilters: FieldFilters | undefined) => {
    setFilters(newFilters);
  }, []);

  return {
    // Estado
    fields,
    loading,
    error,
    filters,
    
    // Métodos
    fetchFields,
    createField,
    updateField,
    deleteField,
    restoreField,
    hardDeleteField,
    getFieldById,
    updateFilters,
  };
}
