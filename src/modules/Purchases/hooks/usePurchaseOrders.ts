// src/modules/Purchases/hooks/usePurchaseOrders.ts

import { useState, useEffect, useCallback } from 'react';
import type { PurchaseOrder, CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from '@/types';
import useAuth from '@/modules/Auth/hooks/useAuth';
import apiClient from '@/lib/api-client';

/**
 * Normaliza los datos de una orden de compra del backend
 * Convierte campos numéricos que pueden venir como strings a números
 */
function normalizePurchaseOrder(order: Record<string, unknown>): PurchaseOrder {
  const rawDetails = order.details;
  const detailsArray = Array.isArray(rawDetails) ? rawDetails : [];
  
  return {
    ...order,
    totalAmount: Number(order.totalAmount ?? 0),
    details: detailsArray.map((detail: Record<string, unknown>) => ({
      ...detail,
      quantity: Number(detail.quantity ?? 0),
      unitPrice: Number(detail.unitPrice ?? 0),
      quantityReceived: Number(detail.quantityReceived ?? 0),
      quantityPending: Number(detail.quantityPending ?? 0),
    })),
  } as PurchaseOrder;
}

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
      const data = await apiClient.get<PurchaseOrder[]>('/purchase-orders', { token: accessToken });
      // Normalizar cada orden para convertir strings a números
      const normalizedOrders = (data as unknown as Record<string, unknown>[]).map((order) => 
        normalizePurchaseOrder(order)
      );
      setPurchaseOrders(normalizedOrders);
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
      const rawOrder = await apiClient.post<PurchaseOrder>('/purchase-orders', dto, { token: accessToken });
      const newOrder = normalizePurchaseOrder(rawOrder as unknown as Record<string, unknown>);
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
      const rawOrder = await apiClient.put<PurchaseOrder>(`/purchase-orders/${id}`, dto, { token: accessToken });
      const updatedOrder = normalizePurchaseOrder(rawOrder as unknown as Record<string, unknown>);
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
      await apiClient.delete(`/purchase-orders/${id}`, { token: accessToken });
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
      const data = await apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`, { token: accessToken });
      return normalizePurchaseOrder(data as unknown as Record<string, unknown>);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching purchase order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const updatePurchaseOrderStatus = useCallback(async (
    id: string, 
    status: string,
    details?: Array<{ purchaseOrderDetailId: string; unitPrice: number }>
  ): Promise<PurchaseOrder | null> => {
    if (!accessToken) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const responseData = await apiClient.patch<PurchaseOrder>(
        `/purchase-orders/${id}/status`, 
        { status, details }, 
        { token: accessToken }
      );
      const updatedOrder = normalizePurchaseOrder(responseData as unknown as Record<string, unknown>);
      setPurchaseOrders(prev => prev.map(po => po.id === id ? updatedOrder : po));
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error updating purchase order status:', err);
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
    updatePurchaseOrderStatus,
    deletePurchaseOrder,
    getPurchaseOrderById,
  };
}
