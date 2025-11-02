/**
 * HTTP Client con soporte para autenticación mediante tokens JWT
 */

const API_BASE_URL = 'http://localhost:3000'

export type HttpClientOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  token?: string | null
}

export class HttpError extends Error {
  status: number
  statusText: string
  data?: unknown

  constructor(status: number, statusText: string, data?: unknown) {
    super(`HTTP Error ${status}: ${statusText}`)
    this.name = 'HttpError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

/**
 * Cliente HTTP con soporte para autenticación
 * Automáticamente incluye el token de acceso en las peticiones si está disponible
 */
export async function httpClient<T = unknown>(
  endpoint: string,
  options: HttpClientOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Agregar token de autenticación si está disponible
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  }

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      errorData = await response.text()
    }
    throw new HttpError(response.status, response.statusText, errorData)
  }

  // Si la respuesta es 204 No Content, retornar undefined
  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()
  return data as T
}

/**
 * Hook para crear un cliente HTTP autenticado
 * Usa el token del localStorage automáticamente
 * 
 * @param onUnauthorized - Callback opcional para manejar errores 401 (token expirado)
 */
export function createAuthenticatedClient(onUnauthorized?: () => void) {
  const getToken = () => {
    try {
      return localStorage.getItem('access_token')
    } catch {
      return null
    }
  }

  const handleRequest = async <T>(
    endpoint: string,
    options: HttpClientOptions,
  ): Promise<T> => {
    try {
      return await httpClient<T>(endpoint, { ...options, token: getToken() })
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        // Token expirado o inválido
        if (onUnauthorized) {
          onUnauthorized()
        }
      }
      throw error
    }
  }

  return {
    get: <T = unknown>(endpoint: string, options?: Omit<HttpClientOptions, 'method'>) =>
      handleRequest<T>(endpoint, { ...options, method: 'GET' }),

    post: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<HttpClientOptions, 'method' | 'body'>) =>
      handleRequest<T>(endpoint, { ...options, method: 'POST', body }),

    put: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<HttpClientOptions, 'method' | 'body'>) =>
      handleRequest<T>(endpoint, { ...options, method: 'PUT', body }),

    patch: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<HttpClientOptions, 'method' | 'body'>) =>
      handleRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

    delete: <T = unknown>(endpoint: string, options?: Omit<HttpClientOptions, 'method'>) =>
      handleRequest<T>(endpoint, { ...options, method: 'DELETE' }),
  }
}

/**
 * Cliente HTTP autenticado singleton
 * Uso: authClient.get('/users'), authClient.post('/users', data), etc.
 */
export const authClient = createAuthenticatedClient()
