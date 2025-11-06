import { useState, useEffect, useCallback } from 'react';
import { customerApi } from '../utils/customer-api';
import type { 
  Customer, 
  CreateCustomerDto, 
  UpdateCustomerDto,
  CustomerFilters 
} from '../types/customer';

export function useCustomers(initialFilters?: CustomerFilters) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>(initialFilters || {});

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerApi.getAll(filters);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = async (data: CreateCustomerDto) => {
    try {
      await customerApi.create(data);
      await fetchCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente');
      throw err;
    }
  };

  const updateCustomer = async (id: string, data: UpdateCustomerDto) => {
    try {
      await customerApi.update(id, data);
      await fetchCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cliente');
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await customerApi.delete(id);
      await fetchCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cliente');
      throw err;
    }
  };

  const restoreCustomer = async (id: string) => {
    try {
      await customerApi.restore(id);
      await fetchCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restaurar cliente');
      throw err;
    }
  };

  const hardDeleteCustomer = async (id: string) => {
    try {
      await customerApi.hardDelete(id);
      await fetchCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar permanentemente');
      throw err;
    }
  };

  const recalculateTotalSpent = async (id: string) => {
    try {
      const updatedCustomer = await customerApi.recalculateTotalSpent(id);
      setCustomers(prev => 
        prev.map(c => c.id === id ? updatedCustomer : c)
      );
      return updatedCustomer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al recalcular total';
      setError(errorMessage);
      throw err;
    }
  };

  const updateFilters = (newFilters: CustomerFilters) => {
    setFilters(newFilters);
  };

  const toggleDeletedView = () => {
    setFilters(prev => ({
      ...prev,
      withDeleted: !prev.withDeleted
    }));
  };

  return {
    customers,
    loading,
    error,
    filters,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    restoreCustomer,
    hardDeleteCustomer,
    recalculateTotalSpent,
    updateFilters,
    toggleDeletedView,
    refetch: fetchCustomers,
  };
}
