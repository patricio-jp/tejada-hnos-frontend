type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
  skipAuth?: boolean;
  signal?: AbortSignal;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(path: string, method: HttpMethod, options: RequestOptions = {}): Promise<T> {
  const { body, headers = {}, token, skipAuth, signal } = options;
  const authToken = skipAuth ? null : token ?? (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);

  const requestHeaders: Record<string, string> = { ...headers };

  if (body !== undefined && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    const message = errorPayload?.errors?.[0]?.message || errorPayload?.message || response.statusText;
    throw new Error(message || 'Error en la solicitud');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);
  return (payload?.data ?? payload) as T;
}

export const apiClient = {
  get<T>(path: string, options?: Omit<RequestOptions, 'body'>) {
    return request<T>(path, 'GET', options);
  },
  post<T>(path: string, body: unknown, options?: Omit<RequestOptions, 'body'>) {
    return request<T>(path, 'POST', { ...options, body });
  },
  put<T>(path: string, body: unknown, options?: Omit<RequestOptions, 'body'>) {
    return request<T>(path, 'PUT', { ...options, body });
  },
  patch<T>(path: string, body: unknown, options?: Omit<RequestOptions, 'body'>) {
    return request<T>(path, 'PATCH', { ...options, body });
  },
  delete<T>(path: string, options?: Omit<RequestOptions, 'body'>) {
    return request<T>(path, 'DELETE', options);
  },
};

export type { RequestOptions };
export default apiClient;
