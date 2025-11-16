// src/modules/Purchases/hooks/useGoodsReceipts.ts

import { useState, useCallback } from 'react';
import type { GoodReceipt, CreateGoodReceiptDto } from '@/types';
import useAuth from '@/modules/Auth/hooks/useAuth';
import apiClient from '@/lib/api-client';

export function useGoodsReceipts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const createGoodReceipt = useCallback(async (dto: CreateGoodReceiptDto): Promise<GoodReceipt | null> => {
    if (!accessToken) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const receipt = await apiClient.post<GoodReceipt>('/goods-receipts', dto, { token: accessToken });
      return receipt;
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
