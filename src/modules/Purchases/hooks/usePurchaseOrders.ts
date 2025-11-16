// src/modules/Purchases/hooks/usePurchaseOrders.ts

import { useState, useEffect, useCallback } from 'react';
import type { PurchaseOrder, CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from '@/types';
import useAuth from '@/modules/Auth/hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
      // Normalizar cada orden para convertir strings a números
      const normalizedOrders = data.map((order: Record<string, unknown>) => 
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

      const responseData = await response.json();
      // Backend returns { data: order, message: ... }
      const rawOrder = responseData.data || responseData;
      const newOrder = normalizePurchaseOrder(rawOrder);
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

      const responseData = await response.json();
      // Backend returns { data: order, message: ... }
      const rawOrder = responseData.data || responseData;
      const updatedOrder = normalizePurchaseOrder(rawOrder);
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

      const { data } = await response.json();
      return normalizePurchaseOrder(data);
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
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, details }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la orden');
      }

      const responseData = await response.json();
      const updatedOrder = normalizePurchaseOrder(responseData.data || responseData);
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
