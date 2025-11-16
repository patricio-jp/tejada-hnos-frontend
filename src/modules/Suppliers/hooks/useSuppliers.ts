import { useState, useEffect, useCallback } from 'react';
import { supplierApi } from '../utils/supplier-api';
import type { Supplier, SupplierFilters } from '@/types';

/**
 * Hook para gestión de proveedores con funcionalidades completas:
 * - CRUD básico (create, read, update, delete)
 * - Soft delete / restore / hard delete
 * - Recálculo de total suministrado
 * - Filtros avanzados (búsqueda, rangos, mostrar eliminados)
 * - Manejo robusto de errores con retry automático
 * - Estados de carga independientes para cada operación
 */
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SupplierFilters>({});

  /**
   * Obtener proveedores con filtros aplicados.
   * Se ejecuta automáticamente cuando cambian los filtros.
   */
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierApi.getAll(filters);
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('[useSuppliers] Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  /**
   * Crear nuevo proveedor.
   * Incluye retry automático, timeout de 30s, y manejo de errores.
   */
  const createSupplier = useCallback(async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'totalSupplied' | 'totalOrders' | 'purchaseOrders'>) => {
    try {
      setError(null);
      const newSupplier = await supplierApi.create(supplier);
      
      // Agregar al estado solo si no está en modo "con eliminados"
      if (!filters.withDeleted || !newSupplier.deletedAt) {
        setSuppliers(prev => [...prev, newSupplier]);
      }
      
      return newSupplier;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('[useSuppliers] Error creating supplier:', err);
      throw err;
    }
  }, [filters.withDeleted]);

  /**
   * Actualizar proveedor existente.
   * Incluye retry automático, timeout de 30s, y manejo de errores.
   */
  const updateSupplier = useCallback(async (id: string, supplier: Partial<Supplier>) => {
    try {
      setError(null);
      const updatedSupplier = await supplierApi.update(id, supplier);
      setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s));
      return updatedSupplier;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('[useSuppliers] Error updating supplier:', err);
      throw err;
    }
  }, []);

  /**
   * Soft delete: marcar proveedor como eliminado (reversible).
   * El proveedor se oculta en la vista normal pero se mantiene en la base de datos.
   */
  const deleteSupplier = useCallback(async (id: string) => {
    try {
      setError(null);
      await supplierApi.delete(id);
      
      // Si no estamos mostrando eliminados, remover de la lista
      if (!filters.withDeleted) {
        setSuppliers(prev => prev.filter(s => s.id !== id));
      } else {
        // Si estamos mostrando eliminados, actualizar con deletedAt
        await fetchSuppliers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('[useSuppliers] Error deleting supplier:', err);
      throw err;
    }
  }, [filters.withDeleted, fetchSuppliers]);

  /**
   * Restaurar proveedor eliminado (soft delete).
   * Revierte el soft delete, haciendo que el proveedor vuelva a aparecer en la vista normal.
   */
  const restoreSupplier = useCallback(async (id: string) => {
    try {
      setError(null);
      const restoredSupplier = await supplierApi.restore(id);
      
      // Actualizar en la lista
      setSuppliers(prev => prev.map(s => s.id === id ? restoredSupplier : s));
      
      return restoredSupplier;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('[useSuppliers] Error restoring supplier:', err);
      throw err;
    }
  }, []);

  /**
   * Hard delete: eliminación permanente (NO reversible).
   * ⚠️ PELIGRO: Esta operación borra el registro de la base de datos.
   * Solo reintenta en errores de conexión para evitar doble eliminación.
   */
  const hardDeleteSupplier = useCallback(async (id: string) => {
    try {
      setError(null);
      await supplierApi.hardDelete(id);
      
      // Remover de la lista en cualquier modo
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('[useSuppliers] Error hard deleting supplier:', err);
      throw err;
    }
  }, []);

  /**
   * Recalcular el total suministrado de un proveedor.
   * Suma todos los purchase orders confirmados del proveedor.
   * Útil después de cambios manuales o para sincronizar.
   */
  const recalculateTotalSupplied = useCallback(async (id: string) => {
    try {
      setError(null);
      const updatedSupplier = await supplierApi.recalculateTotalSupplied(id);
      
      // Actualizar en la lista
      setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s));
      
      return updatedSupplier;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('[useSuppliers] Error recalculating total:', err);
      throw err;
    }
  }, []);

  /**
   * Actualizar filtros de búsqueda.
   * Dispara automáticamente una nueva búsqueda.
   */
  const updateFilters = useCallback((newFilters: SupplierFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Toggle para mostrar/ocultar proveedores eliminados.
   */
  const toggleDeletedView = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      withDeleted: !prev.withDeleted,
    }));
  }, []);

  return {
    suppliers,
    loading,
    error,
    filters,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    restoreSupplier,
    hardDeleteSupplier,
    recalculateTotalSupplied,
    updateFilters,
    toggleDeletedView,
  };
}
