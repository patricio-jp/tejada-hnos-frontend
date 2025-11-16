/**
 * Tipos e interfaces para el módulo de Auth
 */

/**
 * Tokens de autenticación
 */
export type Tokens = {
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * Opciones para el hook useAuth
 */
export type UseAuthOptions = {
  accessTokenKey?: string;
  refreshTokenKey?: string;
  // Optional function to call when logout is triggered (e.g. to notify server)
  onLogout?: () => void;
  // URL to POST the refresh token to. Expect JSON response with at least { access_token: string }
  refreshUrl?: string;
}
