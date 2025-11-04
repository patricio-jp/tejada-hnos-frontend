import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

type AuthUser = {
  id?: string | number
  email?: string
  name?: string
  avatar?: string
  [key: string]: unknown
}

type LoginCredentials = {
  email: string
  password: string
}

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  clearError: () => void
}

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'auth_user'


function readStoredValue(key: string) {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(USER_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as AuthUser
    }
  } catch {
    return null
  }
  return null
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  const payload = parts[1]
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    if (typeof window === 'undefined' || typeof window.atob !== 'function') {
      return null
    }
    const json = window.atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

function inferUserFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token)
  if (!payload) return null

  const candidateId = payload.userId ?? payload.id ?? payload.sub
  const id =
    typeof candidateId === 'string' || typeof candidateId === 'number'
      ? candidateId
      : undefined

  const name = typeof payload.name === 'string' ? payload.name : undefined
  const email = typeof payload.email === 'string' ? payload.email : undefined
  const avatar = typeof payload.avatar === 'string' ? payload.avatar : undefined

  if (!id && !name && !email && !avatar) {
    return null
  }

  return {
    id,
    name,
    email,
    avatar,
  }
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialAccessToken = readStoredValue(ACCESS_TOKEN_KEY)
  const [accessToken, setAccessToken] = useState<string | null>(initialAccessToken)
  const [refreshToken, setRefreshToken] = useState<string | null>(readStoredValue(REFRESH_TOKEN_KEY))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = readStoredUser()
    if (storedUser) return storedUser
    if (initialAccessToken) return inferUserFromToken(initialAccessToken)
    return null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearSession = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY)
      window.localStorage.removeItem(REFRESH_TOKEN_KEY)
      window.localStorage.removeItem(USER_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const persistSession = useCallback(
    (token: string, nextRefreshToken: string | null, nextUser: AuthUser | null) => {
      const resolvedUser = nextUser ?? inferUserFromToken(token)

      setAccessToken(token)
      setRefreshToken(nextRefreshToken)
      setUser(resolvedUser)

      if (typeof window === 'undefined') return
      try {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
        if (nextRefreshToken) {
          window.localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken)
        } else {
          window.localStorage.removeItem(REFRESH_TOKEN_KEY)
        }
        if (resolvedUser) {
          window.localStorage.setItem(USER_KEY, JSON.stringify(resolvedUser))
        } else {
          window.localStorage.removeItem(USER_KEY)
        }
      } catch {
        /* ignore storage errors */
      }
    },
    [],
  )

  const login = useCallback(
    async ({ email, password }: LoginCredentials) => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/auth/login', { // ¡La ruta del Desvío!
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const payload = await response
          .json()
          .catch(() => ({} as Record<string, unknown>))

        if (!response.ok) {
          const message =
            (isPlainObject(payload) &&
              (payload.message || payload.error || payload.detail)) ||
            'No se pudo iniciar sesión. Verifica tus credenciales.'
          throw new Error(String(message))
        }

        if (!isPlainObject(payload)) {
          throw new Error('Respuesta inesperada del servidor.')
        }

        // --- ¡¡¡INICIO DEL ARREGLO FINAL!!! ---
        // El backend nos devuelve { message: '...', data: { ... } }
        // ¡El token está adentro de "data"!
        if (!isPlainObject(payload.data)) {
          throw new Error('La respuesta del servidor no tiene el formato esperado (falta "data").');
        }

        const data = payload.data as Record<string, unknown>; // ¡Usamos "data"!
        // --- FIN DEL ARREGLO ---

        const access = data.accessToken ?? data.access_token // ¡Buscamos en "data"!
        if (typeof access !== 'string' || access.length === 0) {
          throw new Error('La respuesta del servidor no incluye un token válido.')
        }

        const refreshValue =
          typeof data.refreshToken === 'string'
            ? data.refreshToken
            : typeof data.refresh_token === 'string'
              ? data.refresh_token
              : null

        const normalizedRefresh = refreshValue && refreshValue.length > 0 ? refreshValue : null

        const userValue =
          isPlainObject(data.user) || isPlainObject((data as Record<string, unknown>).profile)
            ? ((data.user ?? (data as Record<string, unknown>).profile) as AuthUser)
            : null

        persistSession(access, normalizedRefresh, userValue)
      } catch (err) {
        clearSession()
        const message = err instanceof Error ? err.message : 'No se pudo iniciar sesión.'
        setError(message)
        throw err instanceof Error ? err : new Error(message)
      } finally {
        setLoading(false)
      }
    },
    [persistSession, clearSession],
  )

  const logout = useCallback(() => {
    clearSession()
    setError(null)
  }, [clearSession])

  const clearError = useCallback(() => setError(null), [])

  const isAuthenticated = useMemo(() => Boolean(accessToken), [accessToken])

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      loading,
      error,
      login,
      logout,
      clearError,
    }),
    [user, accessToken, refreshToken, isAuthenticated, loading, error, login, logout, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider')
  }
  return context
}

export type { AuthUser, LoginCredentials, AuthContextValue }
