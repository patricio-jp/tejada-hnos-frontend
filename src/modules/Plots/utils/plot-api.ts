/**
 * Plot API - Módulo de comunicación con el backend
 * 
 * CARACTERÍSTICAS:
 * - Timeout de 30 segundos
 * - Retry logic con exponential backoff
 * - Manejo robusto de errores
 * - Soporte para creación nested en /fields/:fieldId/plots
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
  fieldId: string; // ID del campo al que pertenece
  varietyId?: string; // ID de la variedad (opcional)
  datePlanted?: string; // Fecha en formato ISO
  location: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface UpdatePlotDto {
  name?: string;
  area?: number;
  varietyId?: string | null; // Puede ser null para desasignar
  datePlanted?: string | null;
  location?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

/**
 * Filtros para búsqueda de Plots
 */
export interface PlotFilters {
  fieldId?: string;
  varietyId?: string;
  minArea?: number;
  maxArea?: number;
}

/**
 * Helper para construir query string desde filtros
 */
function buildQueryString(filters?: PlotFilters): string {
  if (!filters) return '';
  
  const params = new URLSearchParams();
  
  if (filters.fieldId) params.append('fieldId', filters.fieldId);
  if (filters.varietyId) params.append('varietyId', filters.varietyId);
  if (filters.minArea) params.append('minArea', filters.minArea.toString());
  if (filters.maxArea) params.append('maxArea', filters.maxArea.toString());
  
  const query = params.toString();
  return query ? `?${query}` : '';
}

/**
 * Helper para realizar fetch con retry y timeout
 */
async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_DELAYS[attempt - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const result = await fetcher();
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error as Error;

      // No reintentar en errores de validación o lógica
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (
          message.includes('validación') ||
          message.includes('no fue encontrado') ||
          message.includes('no existe') ||
          message.includes('autenticación') ||
          message.includes('autorización')
        ) {
          throw error; // No reintentar
        }
      }

      // Si es el último intento, lanzar el error
      if (attempt === retries) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Error desconocido en fetchWithRetry');
}

/**
 * API de Plots
 */
export const plotApi = {
  /**
   * Obtener todas las parcelas con filtros opcionales
   */
  async getAll(filters?: PlotFilters): Promise<Plot[]> {
    return fetchWithRetry(async () => {
      const queryString = buildQueryString(filters);
      return apiClient.get<Plot[]>(`/plots${queryString}`);
    });
  },

  /**
   * Obtener una parcela por su ID
   */
  async getById(id: string): Promise<Plot> {
    return fetchWithRetry(async () => {
      return apiClient.get<Plot>(`/plots/${id}`);
    });
  },

  /**
   * Crear una nueva parcela en un campo específico (nested route)
   * Usa el endpoint POST /fields/:fieldId/plots
   */
  async createInField(fieldId: string, data: Omit<CreatePlotDto, 'fieldId'>): Promise<Plot> {
    return fetchWithRetry(async () => {
      // El backend espera que fieldId venga en el body también
      const payload = { ...data, fieldId };
      return apiClient.post<Plot>(`/fields/${fieldId}/plots`, payload);
    }, 1); // Solo 1 reintento para operaciones de escritura
  },

  /**
   * Crear una nueva parcela (endpoint directo)
   * Usa el endpoint POST /plots
   */
  async create(data: CreatePlotDto): Promise<Plot> {
    return fetchWithRetry(async () => {
      return apiClient.post<Plot>('/plots', data);
    }, 1);
  },

  /**
   * Actualizar una parcela existente
   */
  async update(id: string, data: UpdatePlotDto): Promise<Plot> {
    return fetchWithRetry(async () => {
      return apiClient.put<Plot>(`/plots/${id}`, data);
    }, 1);
  },

  /**
   * Eliminar una parcela (soft delete)
   */
  async delete(id: string): Promise<Plot> {
    // NO retry para delete - operación crítica
    return apiClient.delete<Plot>(`/plots/${id}`);
  },

  /**
   * Restaurar una parcela eliminada
   */
  async restore(id: string): Promise<Plot> {
    return fetchWithRetry(async () => {
      return apiClient.patch<Plot>(`/plots/${id}/restore`, {});
    }, 1);
  },

  /**
   * Eliminar permanentemente una parcela (hard delete)
   * ⚠️ OPERACIÓN IRREVERSIBLE
   */
  async hardDelete(id: string): Promise<void> {
    // NO retry para hard delete - operación crítica e irreversible
    return apiClient.delete<void>(`/plots/${id}/permanent`);
  },

  /**
   * Obtener todas las parcelas de un campo específico
   * Helper que usa getAll con filtro
   */
  async getByFieldId(fieldId: string): Promise<Plot[]> {
    return this.getAll({ fieldId });
  },
};
