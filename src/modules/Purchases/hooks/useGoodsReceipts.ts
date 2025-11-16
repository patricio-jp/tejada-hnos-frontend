// src/modules/Purchases/hooks/useGoodsReceipts.ts

import { useState, useCallback } from 'react';
import type { GoodReceipt, CreateGoodReceiptDto } from '@/types';
import useAuth from '@/modules/Auth/hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useGoodsReceipts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const createGoodReceipt = useCallback(async (dto: CreateGoodReceiptDto): Promise<GoodReceipt | null> => {
    if (!accessToken) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/goods-receipts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error('Error al registrar la recepción de mercancía');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error creating good receipt:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  return {
    loading,
    error,
    createGoodReceipt,
  };
}
