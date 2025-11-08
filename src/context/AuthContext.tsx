import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import useAuthHook from '@/modules/Auth/hooks/useAuth'

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
  checkSession: () => Promise<boolean>
  refreshAccessToken: () => Promise<boolean>
}

const USER_KEY = 'auth_user'

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

function inferUserFromPayload(payload: Record<string, unknown> | null): AuthUser | null {
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Callback para limpiar usuario cuando el hook cierre sesión
  const handleLogout = useCallback(() => {
    try {
      window.localStorage.removeItem(USER_KEY)
    } catch {
      // ignore
    }
  }, [])

  // Usar el hook useAuth para la gestión de tokens
  const auth = useAuthHook({
    accessTokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
    refreshUrl: '/api/auth/refresh-token',
    onLogout: handleLogout,
  })

  // Recuperar usuario del localStorage o del token
  const user = useMemo(() => {
    const storedUser = readStoredUser()
    if (storedUser) return storedUser
    if (auth.accessPayload) return inferUserFromPayload(auth.accessPayload)
    return null
  }, [auth.accessPayload])

  // Sincronizar usuario con localStorage
  useEffect(() => {
    if (user) {
      try {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user))
      } catch {
        // ignore
      }
    } else {
      try {
        window.localStorage.removeItem(USER_KEY)
      } catch {
        // ignore
      }
    }
  }, [user])

  const login = useCallback(
    async ({ email, password }: LoginCredentials) => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/auth/login', {
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

        if (!isPlainObject(payload.data)) {
          throw new Error('La respuesta del servidor no tiene el formato esperado (falta "data").')
        }

        const data = payload.data as Record<string, unknown>

        const access = data.accessToken ?? data.access_token
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

        // Guardar usuario en localStorage
        if (userValue) {
          try {
            window.localStorage.setItem(USER_KEY, JSON.stringify(userValue))
          } catch {
            // ignore
          }
        }

        // Usar el método login del hook para guardar los tokens
        auth.login(access, normalizedRefresh ?? undefined)
      } catch (err) {
        auth.logout()
        try {
          window.localStorage.removeItem(USER_KEY)
        } catch {
          // ignore
        }
        const message = err instanceof Error ? err.message : 'No se pudo iniciar sesión.'
        setError(message)
        throw err instanceof Error ? err : new Error(message)
      } finally {
        setLoading(false)
      }
    },
    [auth]
  )

  const logout = useCallback(() => {
    auth.logout()
    setError(null)
    try {
      window.localStorage.removeItem(USER_KEY)
    } catch {
      // ignore
    }
  }, [auth])

  const clearError = useCallback(() => setError(null), [])

  // Wrapper estable para checkSession
  const checkSessionRef = useRef(async (): Promise<boolean> => {
    const isValid = auth.checkAuth()
    if (isValid) return true
    if (auth.refreshToken) {
      return await auth.refreshAccessToken()
    }
    return false
  })

  // Actualizar la referencia cuando auth cambie
  useEffect(() => {
    checkSessionRef.current = async (): Promise<boolean> => {
      const isValid = auth.checkAuth()
      if (isValid) return true
      if (auth.refreshToken) {
        return await auth.refreshAccessToken()
      }
      return false
    }
  }, [auth])

  const checkSession = useCallback(async (): Promise<boolean> => {
    return checkSessionRef.current()
  }, [])

  const value = useMemo(
    () => ({
      user,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      isAuthenticated: auth.isAuthenticated,
      loading,
      error,
      login,
      logout,
      clearError,
      checkSession,
      refreshAccessToken: auth.refreshAccessToken,
    }),
    [
      user,
      auth.accessToken,
      auth.refreshToken,
      auth.isAuthenticated,
      auth.refreshAccessToken,
      loading,
      error,
      login,
      logout,
      clearError,
      checkSession,
    ]
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
