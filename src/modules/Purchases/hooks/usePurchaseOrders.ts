// src/modules/Purchases/hooks/usePurchaseOrders.ts

import { useState, useEffect, useCallback } from 'react';
import type { PurchaseOrder, CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from '../types';
import useAuth from '@/modules/Auth/hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function usePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const fetchPurchaseOrders = useCallback(async () => {
    if (!accessToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar las órdenes de compra');
      }

      const { data } = await response.json();
      setPurchaseOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching purchase orders:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const createPurchaseOrder = useCallback(async (dto: CreatePurchaseOrderDto): Promise<PurchaseOrder | null> => {
    if (!accessToken) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error('Error al crear la orden de compra');
      }

      const newOrder = await response.json();
      setPurchaseOrders(prev => [...prev, newOrder]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error creating purchase order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const updatePurchaseOrder = useCallback(async (id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder | null> => {
    if (!accessToken) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la orden de compra');
      }

      const updatedOrder = await response.json();
      setPurchaseOrders(prev => prev.map(po => po.id === id ? updatedOrder : po));
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error updating purchase order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const deletePurchaseOrder = useCallback(async (id: string): Promise<boolean> => {
    if (!accessToken) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la orden de compra');
      }

      setPurchaseOrders(prev => prev.filter(po => po.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error deleting purchase order:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const getPurchaseOrderById = useCallback(async (id: string): Promise<PurchaseOrder | null> => {
    if (!accessToken) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar la orden de compra');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching purchase order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  return {
    purchaseOrders,
    loading,
    error,
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPurchaseOrderById,
  };
}
