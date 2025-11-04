import { useState, useEffect, useCallback } from 'react';
import { supplierApi } from '../utils/supplier-api';
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from '../types/supplier';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierApi.getAll();
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const createSupplier = useCallback(async (supplier: CreateSupplierDto) => {
    try {
      setError(null);
      const newSupplier = await supplierApi.create(supplier);
      setSuppliers(prev => [...prev, newSupplier]);
      return newSupplier;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const updateSupplier = useCallback(async (id: string, supplier: UpdateSupplierDto) => {
    try {
      setError(null);
      const updatedSupplier = await supplierApi.update(id, supplier);
      setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s));
      return updatedSupplier;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  const deleteSupplier = useCallback(async (id: string) => {
    try {
      setError(null);
      await supplierApi.delete(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  }, []);

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
}
