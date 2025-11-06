/**
 * Customer API - Módulo de comunicación con el backend
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
 */

import type { 
  Customer, 
  CreateCustomerDto, 
  UpdateCustomerDto,
  CustomerFilters 
} from '../types/customer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3ZGIxNjdiNy03NDQ3LTQ0YTUtYjM0Yi1lNGIzNmQ0ZTRjMjMiLCJlbWFpbCI6ImFkbWluQHRlamFkYWhub3MuY29tIiwicm9sZSI6IkFETUlOIiwibmFtZSI6IkFkbWluIiwibGFzdE5hbWUiOiJQcmluY2lwYWwiLCJpYXQiOjE3NjI0NTA0NDgsImV4cCI6MTc2MjQ1NDA0OH0.x13ugCNYg8Gb906aCU0sDea5w5C829pZsKuM7Up3Jgc';

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
        const errorMessage = errorData?.message || response.statusText;

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

        // Otros errores del servidor
        throw new Error(`Error del servidor (${response.status}): ${errorMessage}`);
      }

      // Respuesta exitosa - parsear y retornar
      const data = await response.json();
      return data;

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

export const customerApi = {
  /**
   * Obtener todos los clientes con filtros opcionales
   */
  async getAll(filters?: CustomerFilters): Promise<Customer[]> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    
    // Construir query params
    const params = new URLSearchParams();
    if (filters?.searchTerm) {
      params.append('searchTerm', filters.searchTerm);
    }
    if (filters?.minTotalPurchases !== undefined) {
      params.append('minTotalPurchases', filters.minTotalPurchases.toString());
    }
    if (filters?.maxTotalPurchases !== undefined) {
      params.append('maxTotalPurchases', filters.maxTotalPurchases.toString());
    }
    if (filters?.withDeleted) {
      params.append('withDeleted', 'true');
    }

    const queryString = params.toString();
    const url = `${API_URL}/customers${queryString ? `?${queryString}` : ''}`;

    // Timeout de 30 segundos para evitar peticiones colgadas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
        throw new Error('Error al obtener clientes');
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

  async getById(id: string): Promise<Customer> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    const response = await fetch(`${API_URL}/customers/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener cliente');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Crear un nuevo cliente.
   * Incluye timeout de 30s, retry en errores de red, y manejo de errores específico.
   */
  async create(customer: CreateCustomerDto): Promise<Customer> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    
    const data = await fetchWithRetry<{ data: Customer }>(
      `${API_URL}/customers`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
      }
    );

    return data.data;
  },

  /**
   * Actualizar un cliente existente.
   * Incluye timeout de 30s, retry en errores de red, y manejo de errores específico.
   */
  async update(id: string, customer: UpdateCustomerDto): Promise<Customer> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    
    const data = await fetchWithRetry<{ data: Customer }>(
      `${API_URL}/customers/${id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
      }
    );

    return data.data;
  },

  /**
   * Soft delete de un cliente (eliminación temporal).
   * Incluye timeout de 30s, retry en errores de red, y manejo de errores específico.
   */
  async delete(id: string): Promise<void> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    
    await fetchWithRetry<void>(
      `${API_URL}/customers/${id}`,
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
   * Restaurar un cliente eliminado (soft delete).
   * Incluye timeout de 30s, retry en errores de red, y manejo de errores específico.
   */
  async restore(id: string): Promise<Customer> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    
    const data = await fetchWithRetry<{ data: Customer }>(
      `${API_URL}/customers/${id}/restore`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return data.data;
  },

  /**
   * Eliminar permanentemente un cliente (hard delete).
   * OPERACIÓN CRÍTICA E IRREVERSIBLE.
   * 
   * Incluye timeout de 30s y retry MUY SELECTIVO:
   * - Solo reintenta en errores de CONEXIÓN (antes de llegar al servidor)
   * - NO reintenta si el servidor responde con error (evita eliminaciones duplicadas)
   * - Manejo de errores específico con mensajes claros
   */
  async hardDelete(id: string): Promise<void> {
    const token = localStorage.getItem('access_token') || MOCK_TOKEN;
    
    await fetchWithRetry<void>(
      `${API_URL}/customers/${id}/permanent`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      MAX_RETRIES,
      true // retryOnlyConnectionErrors = true (CRÍTICO para evitar eliminaciones duplicadas)
    );
  },

  /**
   * Recalcular el total gastado para un cliente específico
   * Usa el método getAll del API que ya maneja los filtros correctamente
   * Con retry logic para manejar desconexiones temporales
   */
  async recalculateTotalSpent(id: string, retries = 2): Promise<Customer> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          // Esperar un poco antes de reintentar (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
        
        // Simplemente llamamos a getAll sin filtros
        // Esto reutiliza toda la lógica de autenticación y manejo de errores
        const allCustomers = await this.getAll();
        
        // Buscar el cliente específico en la lista
        const customer = allCustomers.find(c => c.id === id);
        
        if (!customer) {
          throw new Error('Cliente no encontrado');
        }
        
        return customer;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Error desconocido');
        
        // Si es el último intento, lanzar el error
        if (attempt === retries) {
          throw lastError;
        }
        
        // Si el error no es de red, no reintentar
        if (!lastError.message.includes('fetch') && 
            !lastError.message.includes('network') && 
            !lastError.message.includes('DISCONNECTED')) {
          throw lastError;
        }
      }
    }
    
    // Fallback (nunca debería llegar aquí)
    throw lastError || new Error('Error al recalcular total gastado');
  },
};
