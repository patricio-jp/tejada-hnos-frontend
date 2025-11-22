/**
 * Variety API - Obtener listado de variedades
 */

import { apiClient } from '@/lib/api-client';
import type { Variety } from '@/types/varieties';

const REQUEST_TIMEOUT = 30000;

/**
 * API de Variedades
 */
export const varietyApi = {
  /**
   * Obtener todas las variedades
   */
  async getAll(): Promise<Variety[]> {
    return Promise.race([
      apiClient.get<Variety[]>('/varieties'),
      new Promise<Variety[]>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
      ),
    ]);
  },
};
