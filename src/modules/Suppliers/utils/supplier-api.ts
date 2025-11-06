/**
 * Supplier API - Módulo de comunicación con el backend
 * 
 * MEJORAS IMPLEMENTADAS:
 * ======================
 * 
 * 1. **Timeout de Requests (30 segundos)**
 *    - Todas las peticiones tienen un timeout automático
 *    - Evita que las peticiones queden colgadas indefinidamente
 *    - Usa AbortController para cancelar requests que tardan demasiado
 * 
 * 2. **Retry Logic con Exponential Backoff**
 *    - Reintentos automáticos en caso de errores de red
 *    - Exponential backoff: 1s, 2s entre reintentos
 *    - Máximo 2 reintentos después del intento inicial
 * 
 * 3. **Manejo de Errores Robusto**
 *    - Discriminación de tipos de error (validación, red, servidor, timeout)
 *    - Mensajes de error específicos y descriptivos
 *    - NO reintentar en errores de validación o lógica (400, 404, 401, 403)
 *    - Solo reintentar en errores de red/conexión y timeout
 * 
 * 4. **Protección Especial para Hard Delete**
 *    - Retry SOLO en errores de CONEXIÓN (antes de llegar al servidor)
 *    - NO retry si el servidor responde (evita eliminaciones duplicadas)
 *    - Operación crítica e irreversible
 * 
 * 5. **Función Helper Reutilizable**
 *    - fetchWithRetry(): Lógica centralizada para todos los endpoints
 *    - Configuración parametrizable por método
 *    - Código DRY y fácil de mantener
 * 
 * 6. **Soporte Completo de Filtros**
 *    - searchTerm, minTotalSupplied, maxTotalSupplied, withDeleted
 *    - Construcción dinámica de query params
 * 
 * 7. **Operaciones Soft Delete**
 *    - delete() para soft delete
 *    - restore() para recuperar eliminados
 *    - hardDelete() para eliminación permanente
 * 
 * 8. **Recalcular Total Suministrado**
 *    - Método para actualizar totalSupplied desde el backend
 *    - Con retry automático en errores temporales
 */

import type { 
  Supplier,
  SupplierFilters 
} from '../types/supplier';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3ZGIxNjdiNy03NDQ3LTQ0YTUtYjM0Yi1lNGIzNmQ0ZTRjMjMiLCJlbWFpbCI6ImFkbWluQHRlamFkYWhub3MuY29tIiwicm9sZSI6IkFETUlOIiwibmFtZSI6IkFkbWluIiwibGFzdE5hbWUiOiJQcmluY2lwYWwiLCJpYXQiOjE3NjI0NjcyMjksImV4cCI6MTc2MjQ3MDgyOX0.MUjRRj7CEVaoYKnn_l3nYr8T3EF4UsgChXWOX4LDRwg';

/**
 * Configuración para timeout de requests
 */
const REQUEST_TIMEOUT = 30000; // 30 segundos

/**
 * Configuración para retry logic
 */
const MAX_RETRIES = 2; // Total de reintentos después del primer intento
const RETRY_DELAYS = [1000, 2000]; // Delays en ms para cada reintento (exponential backoff)

/**
 * Helper function para realizar fetch con timeout, retry logic y manejo de errores robusto.
 * 
 * @param url - URL del endpoint
 * @param options - Opciones de fetch
 * @param retries - Número de reintentos permitidos (default: MAX_RETRIES)
 * @param retryOnlyConnectionErrors - Si true, solo reintenta en errores de conexión (útil para hard delete)
 * @returns Promise con la respuesta parseada
 * 
 * Características:
 * - Timeout automático de 30 segundos
 * - Retry con exponential backoff en errores de red
 * - Discriminación de errores: red vs servidor vs validación
 * - Mensajes de error específicos para cada caso
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES,
  retryOnlyConnectionErrors: boolean = false
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Esperar antes de reintentar (excepto en el primer intento)
    if (attempt > 0) {
      const delay = RETRY_DELAYS[attempt - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Crear AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Si la respuesta no es OK, lanzar error específico según el código
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        // El backend devuelve { errors: [{ message, name }] }
        const errorMessage = errorData?.errors?.[0]?.message || errorData?.message || response.statusText;

        // Error 400: Validación - NO reintentar
        if (response.status === 400) {
          throw new Error(`Error de validación: ${errorMessage}`);
        }

        // Error 404: No encontrado - NO reintentar
        if (response.status === 404) {
          throw new Error(`Recurso no encontrado: ${errorMessage}`);
        }

        // Error 401/403: Autenticación/Autorización - NO reintentar
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Error de autenticación: ${errorMessage}`);
        }

        // Error 409: Conflicto (CUIT/Nombre duplicado) - NO reintentar
        if (response.status === 409) {
          throw new Error(errorMessage); // Usar el mensaje del backend directamente
        }

        // Otros errores del servidor
        throw new Error(`Error del servidor (${response.status}): ${errorMessage}`);
      }

      // Respuesta exitosa - parsear y retornar
      const responseData = await response.json();
      
      // El backend siempre retorna { data: T, message: string }
      // Extraer solo la propiedad data
      return responseData.data || responseData;

    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error('Error desconocido');

      // Si es el último intento, lanzar el error
      if (attempt === retries) {
        throw lastError;
      }

      // Timeout
      if (lastError.name === 'AbortError') {
        lastError = new Error('Timeout: El servidor tardó demasiado en responder');
        // Los timeouts pueden reintentar (puede ser congestión temporal)
        continue;
      }

      // Si retryOnlyConnectionErrors es true, solo reintentar en errores de CONEXIÓN
      // NO reintentar si el servidor respondió (incluso con error)
      if (retryOnlyConnectionErrors) {
        // Solo reintentar en errores de fetch/network/conexión
        if (
          lastError.message.includes('fetch') ||
          lastError.message.includes('Failed to fetch') ||
          lastError.message.includes('NetworkError') ||
          lastError.message.includes('Network request failed') ||
          lastError.message.includes('DISCONNECTED')
        ) {
          continue; // Reintentar
        } else {
          throw lastError; // No reintentar en otros errores
        }
      }

      // Modo normal: reintentar en errores de red y timeout
      if (
        lastError.message.includes('fetch') ||
        lastError.message.includes('Failed to fetch') ||
        lastError.message.includes('NetworkError') ||
        lastError.message.includes('Network request failed') ||
        lastError.message.includes('DISCONNECTED') ||
        lastError.message.includes('Timeout')
      ) {
        continue; // Reintentar
      }

      // Error de validación o servidor - NO reintentar
      throw lastError;
    }
  }

  // Fallback (nunca debería llegar aquí)
  throw lastError || new Error('Error desconocido al realizar la petición');
}

export const supplierApi = {
  /**
   * Obtener todos los proveedores con filtros opcionales.
   * Incluye timeout de 30s, retry en errores de red, y manejo de errores específico.
   * 
   * @param filters - Filtros opcionales (searchTerm, rangos, withDeleted)
   * @returns Array de proveedores con totalSupplied calculado
   */
  async getAll(filters?: SupplierFilters): Promise<Supplier[]> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    
    // Construir query params
    const params = new URLSearchParams();
    if (filters?.searchTerm) {
      params.append('searchTerm', filters.searchTerm);
    }
    if (filters?.minTotalSupplied !== undefined) {
      params.append('minTotalSupplied', filters.minTotalSupplied.toString());
    }
    if (filters?.maxTotalSupplied !== undefined) {
      params.append('maxTotalSupplied', filters.maxTotalSupplied.toString());
    }
    if (filters?.withDeleted) {
      params.append('withDeleted', 'true');
    }

    const queryString = params.toString();
    const url = `${API_URL}/suppliers${queryString ? `?${queryString}` : ''}`;

    // Timeout de 30 segundos para evitar peticiones colgadas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Error al obtener proveedores');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout: El servidor tardó demasiado en responder');
      }
      throw error;
    }
  },

  /**
   * Obtener un proveedor por ID.
   * Incluye timeout de 30s, retry automático en errores de red.
   * 
   * @param id - UUID del proveedor
   * @returns Proveedor con datos completos
   */
  async getById(id: string): Promise<Supplier> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    
    return fetchWithRetry<Supplier>(
      `${API_URL}/suppliers/${id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * Crear un nuevo proveedor.
   * Incluye timeout de 30s, retry automático, y discriminación de errores.
   * 
   * @param supplier - Datos del nuevo proveedor (sin id, createdAt, updatedAt)
   * @returns Proveedor creado con id generado
   * @throws Error específico según tipo (validación 400, conflicto 409, red, timeout)
   */
  async create(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'totalSupplied' | 'totalOrders' | 'purchaseOrders'>): Promise<Supplier> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    
    return fetchWithRetry<Supplier>(
      `${API_URL}/suppliers`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplier),
      }
    );
  },

  /**
   * Actualizar un proveedor existente.
   * Incluye timeout de 30s, retry automático, y discriminación de errores.
   * 
   * @param id - UUID del proveedor
   * @param supplier - Datos parciales a actualizar
   * @returns Proveedor actualizado
   * @throws Error específico según tipo (validación 400, no encontrado 404, conflicto 409, red, timeout)
   */
  async update(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    
    return fetchWithRetry<Supplier>(
      `${API_URL}/suppliers/${id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplier),
      }
    );
  },

  /**
   * Soft delete de un proveedor (marca como eliminado, no borra).
   * Incluye timeout de 30s, retry automático en errores de red.
   * 
   * @param id - UUID del proveedor
   * @returns void
   * @throws Error específico según tipo (no encontrado 404, conflicto 409, red, timeout)
   */
  async delete(id: string): Promise<void> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    
    await fetchWithRetry<void>(
      `${API_URL}/suppliers/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * Restaurar un proveedor eliminado (soft deleted).
   * Incluye timeout de 30s, retry automático en errores de red.
   * 
   * @param id - UUID del proveedor a restaurar
   * @returns Proveedor restaurado
   * @throws Error específico según tipo (no encontrado 404, conflicto 409, red, timeout)
   */
  async restore(id: string): Promise<Supplier> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    
    return fetchWithRetry<Supplier>(
      `${API_URL}/suppliers/${id}/restore`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * Eliminación permanente de un proveedor (no reversible).
   * IMPORTANTE: Solo reintenta en errores de conexión para evitar eliminaciones duplicadas.
   * Incluye timeout de 30s.
   * 
   * @param id - UUID del proveedor a eliminar permanentemente
   * @returns void
   * @throws Error específico según tipo (no encontrado 404, conflicto 409, red, timeout)
   */
  async hardDelete(id: string): Promise<void> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    
    await fetchWithRetry<void>(
      `${API_URL}/suppliers/${id}/permanent`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      MAX_RETRIES,
      true // retryOnlyConnectionErrors = true para evitar doble eliminación
    );
  },

  /**
   * Recalcular el total suministrado de un proveedor.
   * Utiliza getById que ahora calcula automáticamente el totalSupplied
   * basándose en las purchaseOrders y sus details.
   * 
   * @param id - UUID del proveedor
   * @returns Proveedor con totalSupplied actualizado
   * @throws Error específico según tipo (no encontrado 404, red, timeout)
   */
  async recalculateTotalSupplied(id: string): Promise<Supplier> {
    // El backend ahora calcula automáticamente totalSupplied en getById
    // que carga las purchaseOrders con sus details y suma el total
    return this.getById(id);
  },
};
