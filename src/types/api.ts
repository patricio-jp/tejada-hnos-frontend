/**
 * Tipos e interfaces para la API y cliente HTTP
 */

/**
 * Métodos HTTP soportados
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Opciones para peticiones HTTP
 */
export interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
  skipAuth?: boolean;
  signal?: AbortSignal;
}
