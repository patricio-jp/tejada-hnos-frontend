import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Tokens = {
  accessToken: string | null
  refreshToken: string | null
}

export type UseAuthOptions = {
  accessTokenKey?: string
  refreshTokenKey?: string
  // Optional function to call when logout is triggered (e.g. to notify server)
  onLogout?: () => void
  // URL to POST the refresh token to. Expect JSON response with at least { access_token: string }
  refreshUrl?: string
}

function readTokens(accessKey: string, refreshKey: string): Tokens {
  try {
    const access = localStorage.getItem(accessKey)
    const refresh = localStorage.getItem(refreshKey)
    return { accessToken: access, refreshToken: refresh }
  } catch {
    return { accessToken: null, refreshToken: null }
  }
}

function base64UrlDecode(str: string) {
  // base64url -> base64
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  // pad with '='
  const pad = str.length % 4
  if (pad === 2) str += '=='
  else if (pad === 3) str += '='
  else if (pad !== 0) {
    // invalid string
  }
  try {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join(''),
    )
  } catch {
    return null
  }
}

export function parseJwt(token: string | null) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const decoded = base64UrlDecode(payload)
    if (!decoded) return null
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function isTokenValid(token: string | null) {
  //return true // TO-DO: temporarily disable token validation
  if (!token) return false
  const payload = parseJwt(token)
  if (!payload) return false
  // exp could be in seconds
  const exp = payload.exp
  if (typeof exp !== 'number') return false
  const now = Math.floor(Date.now() / 1000)
  return exp > now
}

export default function useAuth(options?: UseAuthOptions) {
  const accessKey = options?.accessTokenKey ?? 'access_token'
  const refreshKey = options?.refreshTokenKey ?? 'refresh_token'
  const refreshUrl = options?.refreshUrl ?? 'http://localhost:3000/auth/refresh-token'

  const [tokens, setTokens] = useState<Tokens>(() =>
    readTokens(accessKey, refreshKey),
  )

  const accessPayload = useMemo(() => parseJwt(tokens.accessToken), [tokens.accessToken])

  const isAuthenticated = useMemo(() => isTokenValid(tokens.accessToken), [tokens.accessToken])

  const checkAuth = useCallback(() => {
    const current = readTokens(accessKey, refreshKey)
    setTokens(current)
    return isTokenValid(current.accessToken)
  }, [accessKey, refreshKey])

  const login = useCallback((accessToken: string, refreshToken?: string) => {
    try {
      localStorage.setItem(accessKey, accessToken)
      if (refreshToken) localStorage.setItem(refreshKey, refreshToken)
    } catch {
      // ignore storage errors
    }
    setTokens({ accessToken, refreshToken: refreshToken ?? null })
  }, [accessKey, refreshKey])
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(accessKey)
      localStorage.removeItem(refreshKey)
    } catch {
      // ignore
    }
    setTokens({ accessToken: null, refreshToken: null })
    if (options?.onLogout) options.onLogout()
  }, [accessKey, refreshKey, options])

  // Avoid concurrent refresh requests using a ref
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null)

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const currentRefresh = readTokens(accessKey, refreshKey).refreshToken
    if (!currentRefresh) return false

    if (refreshPromiseRef.current) return refreshPromiseRef.current

    const p = (async () => {
      try {
        const res = await fetch(refreshUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentRefresh }),
        })
        if (!res.ok) {
          // refresh failed
          logout()
          return false
        }
        const { data } = await res.json()
        // expect at least accessToken in response
        const newAccess = data.accessToken ?? data.access_token ?? data.accessTokenString
        const newRefresh = data.refreshToken ?? data.refresh_token ?? null
        if (typeof newAccess === 'string') {
          try {
            localStorage.setItem(accessKey, newAccess)
            if (newRefresh) localStorage.setItem(refreshKey, newRefresh)
          } catch {
            // ignore storage errors
          }
          setTokens({ accessToken: newAccess, refreshToken: newRefresh ?? currentRefresh })
          return true
        }
        logout()
        return false
      } catch {
        logout()
        return false
      } finally {
        refreshPromiseRef.current = null
      }
    })()

    refreshPromiseRef.current = p
    return p
  }, [accessKey, refreshKey, refreshUrl, logout])

  useEffect(() => {
    // Listen to storage events to sync auth across tabs/windows
    function onStorage(e: StorageEvent) {
      if (e.key === accessKey || e.key === refreshKey || e.key === null) {
        const current = readTokens(accessKey, refreshKey)
        setTokens(current)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [accessKey, refreshKey])

  useEffect(() => {
    // Re-check token periodically in background in case it expires while the app is open
    const id = setInterval(() => {
      const ok = isTokenValid(tokens.accessToken)
      if (!ok && tokens.accessToken) {
        // token expired: try to refresh using refresh token before marking unauthenticated
        ;(async () => {
          const refreshed = await refreshAccessToken()
          if (!refreshed) {
            setTokens((prev) => ({ ...prev, accessToken: null }))
          }
        })()
      }
    }, 30_000) // check every 30s
    return () => clearInterval(id)
  }, [tokens.accessToken, refreshAccessToken])

  // On mount, if access token invalid but refresh token exists, try to refresh once
  useEffect(() => {
    ;(async () => {
      const ok = isTokenValid(tokens.accessToken)
      if (!ok && tokens.refreshToken) {
        await refreshAccessToken()
      }
    })()
  }, [tokens.accessToken, tokens.refreshToken, refreshAccessToken])

  return {
    isAuthenticated,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessPayload,
    login,
    logout,
    checkAuth,
    refreshAccessToken,
  } as const
}
