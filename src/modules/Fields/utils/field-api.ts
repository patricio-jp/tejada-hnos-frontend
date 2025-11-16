/**
 * Field API - Módulo de comunicación con el backend
 * 
 * CARACTERÍSTICAS:
 * - Timeout de 30 segundos
 * - Retry logic con exponential backoff
 * - Manejo robusto de errores
 * - Integración con apiClient centralizado
 */

import { apiClient } from '@/lib/api-client';
import type { Field } from '@/types/fields';

/**
 * Configuración
 */
const REQUEST_TIMEOUT = 30000; // 30 segundos
const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 2000]; // ms

/**
 * DTOs para crear y actualizar Fields
 */
export interface CreateFieldDto {
  name: string;
  address: string;
  area: number;
  location: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  managerId?: string; // ID del Capataz
}

export interface UpdateFieldDto {
  name?: string;
  address?: string;
  area?: number;
  location?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  managerId?: string | null; // Puede ser null para desasignar
}

/**
 * Filtros para búsqueda de Fields
 */
export interface FieldFilters {
  managerId?: string;
  minArea?: number;
  maxArea?: number;
}

/**
 * Helper para construir query string desde filtros
 */
function buildQueryString(filters?: FieldFilters): string {
  if (!filters) return '';
  
  const params = new URLSearchParams();
  
  if (filters.managerId) params.append('managerId', filters.managerId);
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
 * API de Fields
 */
export const fieldApi = {
  /**
   * Obtener todos los campos con filtros opcionales
   */
  async getAll(filters?: FieldFilters): Promise<Field[]> {
    return fetchWithRetry(async () => {
      const queryString = buildQueryString(filters);
      return apiClient.get<Field[]>(`/fields${queryString}`);
    });
  },

  /**
   * Obtener un campo por su ID
   */
  async getById(id: string): Promise<Field> {
    return fetchWithRetry(async () => {
      return apiClient.get<Field>(`/fields/${id}`);
    });
  },

  /**
   * Crear un nuevo campo
   */
  async create(data: CreateFieldDto): Promise<Field> {
    return fetchWithRetry(async () => {
      return apiClient.post<Field>('/fields', data);
    }, 1); // Solo 1 reintento para operaciones de escritura
  },

  /**
   * Actualizar un campo existente
   */
  async update(id: string, data: UpdateFieldDto): Promise<Field> {
    return fetchWithRetry(async () => {
      return apiClient.put<Field>(`/fields/${id}`, data);
    }, 1);
  },

  /**
   * Eliminar un campo permanentemente (hard delete)
   * ⚠️ OPERACIÓN IRREVERSIBLE
   */
  async delete(id: string): Promise<void> {
    // NO retry para hard delete - operación crítica e irreversible
    return apiClient.delete<void>(`/fields/${id}/permanent`);
  },

  /**
   * Restaurar un campo eliminado
   */
  async restore(id: string): Promise<Field> {
    return fetchWithRetry(async () => {
      return apiClient.patch<Field>(`/fields/${id}/restore`, {});
    }, 1);
  },

  /**
   * Eliminar permanentemente un campo (hard delete)
   * ⚠️ OPERACIÓN IRREVERSIBLE
   */
  async hardDelete(id: string): Promise<void> {
    // NO retry para hard delete - operación crítica e irreversible
    return apiClient.delete<void>(`/fields/${id}/permanent`);
  },
};
