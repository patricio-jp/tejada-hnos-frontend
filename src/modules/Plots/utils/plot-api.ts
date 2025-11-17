/**
 * Plot API - Módulo de comunicación con el backend
 * 
 * CARACTERÍSTICAS:
 * - Timeout de 30 segundos
 * - Retry logic con exponential backoff
 * - Manejo robusto de errores
 * - Integración con apiClient centralizado
 */

import { apiClient } from '@/lib/api-client';
import type { Plot } from '@/types/plots';

/**
 * Configuración
 */
const REQUEST_TIMEOUT = 30000; // 30 segundos
const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 2000]; // ms

/**
 * DTOs para crear y actualizar Plots
 */
export interface CreatePlotDto {
  name: string;
  area: number;
  location: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  varietyId?: string;
  datePlanted?: string; // ISO 8601
  fieldId: string; // Del URL params
}

export interface UpdatePlotDto {
  name?: string;
  area?: number;
  location?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  varietyId?: string | null;
  datePlanted?: string | null;
}

/**
 * Helper para reintentar con exponential backoff
 */
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
        ),
      ]);
    } catch (error) {
      lastError = error;

      // Si es el último intento, lanzar el error
      if (attempt === retries) {
        throw lastError;
      }

      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
    }
  }

  throw lastError || new Error('Error desconocido en fetchWithRetry');
}

/**
 * API de Plots
 */
export const plotApi = {
  /**
   * Obtener todos los plots de un campo
   */
  async getAllByField(fieldId: string): Promise<Plot[]> {
    return fetchWithRetry(async () => {
      return apiClient.get<Plot[]>(`/fields/${fieldId}/plots`);
    });
  },

  /**
   * Obtener un plot por su ID (endpoint directo sin fieldId)
   */
  async getById(plotId: string): Promise<Plot> {
    return fetchWithRetry(async () => {
      return apiClient.get<Plot>(`/plots/${plotId}`);
    });
  },

  /**
   * Crear un nuevo plot
   */
  async create(fieldId: string, data: CreatePlotDto): Promise<Plot> {
    return fetchWithRetry(async () => {
      return apiClient.post<Plot>(`/fields/${fieldId}/plots`, {
        ...data,
        fieldId, // Asegurar que fieldId esté en el body
      });
    }, 1); // Solo 1 reintento para operaciones de escritura
  },

  /**
   * Actualizar un plot existente (usando endpoint directo /plots/:plotId)
   */
  async update(plotId: string, data: UpdatePlotDto): Promise<Plot> {
    return fetchWithRetry(async () => {
      const url = `/plots/${plotId}`;
      console.log('Haciendo PUT a:', url, 'con data:', data);
      return apiClient.put<Plot>(url, data);
    }, 1);
  },

  /**
   * Eliminar un plot permanentemente (hard delete)
   */
  async delete(plotId: string): Promise<void> {
    return apiClient.delete<void>(`/plots/${plotId}/permanent`);
  },

  /**
   * Restaurar un plot eliminado
   */
  async restore(plotId: string): Promise<Plot> {
    return fetchWithRetry(async () => {
      return apiClient.patch<Plot>(`/plots/${plotId}/restore`, {});
    }, 1);
  },
};
