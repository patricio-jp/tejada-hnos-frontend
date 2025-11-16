/**
 * useUsers Hook - Gestión de estado para Users
 * 
 * Hook personalizado para obtener usuarios, especialmente útil para
 * seleccionar Capataces en los dropdowns de Fields.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/types/user';

/**
 * Filtros para usuarios
 */
export interface UserFilters {
  role?: 'ADMIN' | 'CAPATAZ' | 'OPERARIO';
}

export function useUsers(initialFilters?: UserFilters) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters | undefined>(initialFilters);

  /**
   * Obtener todos los usuarios con filtros opcionales
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir query string
      let queryString = '';
      if (filters?.role) {
        queryString = `?role=${filters.role}`;
      }
      
      const data = await apiClient.get<User[]>(`/users${queryString}`);
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Cargar users al montar o cuando cambien los filtros
   */
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Obtener solo los capataces (helper)
   */
  const getCapataces = useCallback(async (): Promise<User[]> => {
    try {
      setError(null);
      const allUsers = await apiClient.get<User[]>('/users');
      return allUsers.filter(user => user.role === 'CAPATAZ');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Actualizar filtros (dispara nuevo fetch)
   */
  const updateFilters = useCallback((newFilters: UserFilters | undefined) => {
    setFilters(newFilters);
  }, []);

  return {
    // Estado
    users,
    loading,
    error,
    filters,
    
    // Métodos
    fetchUsers,
    getCapataces,
    updateFilters,
  };
}

/**
 * Hook especializado para obtener solo Capataces
 * Útil para dropdowns de manager en Fields
 */
export function useCapataces() {
  const [capataces, setCapataces] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCapataces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allUsers = await apiClient.get<User[]>('/users');
      const filteredCapataces = allUsers.filter(user => user.role === 'CAPATAZ');
      setCapataces(filteredCapataces);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener capataces:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCapataces();
  }, [fetchCapataces]);

  return {
    capataces,
    loading,
    error,
    refetch: fetchCapataces,
  };
}
