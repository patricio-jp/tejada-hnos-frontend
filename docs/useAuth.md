# useAuth Hook

## Resumen

`useAuth` es un hook React que centraliza la lógica de autenticación de la aplicación basada en JWT (access_token + refresh_token). Proporciona utilidades para:

- Leer y mantener tokens (`access_token`, `refresh_token`) desde `localStorage`.
- Validar la validez del `access_token` (claim `exp`).
- Iniciar sesión (`login`) y cerrar sesión (`logout`).
- Detectar estado de autenticación (`isAuthenticated`) y exponer el payload del token (`accessPayload`).
- Refrescar automáticamente el `access_token` usando un endpoint de refresh (POST con `{ refresh_token }` en el body).
- Sincronizar estado entre pestañas mediante el evento `storage`.


## ¿Por qué usar este hook?

- Centraliza la comprobación y renovación de tokens, evitando duplicar lógica.
- Minimiza la probabilidad de que el usuario experimente 401s inesperados al intentar refrescar tokens automáticamente.
- Facilita integrarlo con componentes y rutas protegidas (ej. `ProtectedRoute`).


## Contrato (inputs / outputs)

- Inputs (opcional, a través de `useAuth(options)`):
  - `accessTokenKey?: string` — clave de `localStorage` para `access_token` (por defecto `access_token`).
  - `refreshTokenKey?: string` — clave de `localStorage` para `refresh_token` (por defecto `refresh_token`).
  - `refreshUrl?: string` — URL del endpoint de refresh (por defecto `/api/auth/refresh`).
  - `onLogout?: () => void` — callback opcional que se ejecuta al hacer `logout()`.

- Outputs (objetos/funciones devueltas por el hook):
  - `isAuthenticated: boolean` — true si el `access_token` es válido (no expirado).
  - `accessToken: string | null` — token de acceso actual.
  - `refreshToken: string | null` — refresh token actual.
  - `accessPayload: any | null` — payload decodificado del JWT (si existe).
  - `login(accessToken: string, refreshToken?: string)` — guarda tokens en `localStorage` y actualiza estado.
  - `logout()` — elimina tokens y actualiza estado; ejecuta `onLogout` si se proporcionó.
  - `checkAuth(): boolean` — fuerza la lectura de tokens desde `localStorage` y devuelve si el access token es válido.
  - `refreshAccessToken(): Promise<boolean>` — intenta obtener un nuevo `access_token` desde `refreshUrl`. Devuelve `true` si tuvo éxito.


## Cómo está implementado (alto nivel)

- Lectura/escritura de tokens: usa `localStorage` con claves configurables.
- Decodificación de token: `parseJwt` realiza un decode base64url del payload y parsea JSON.
- Validación: `isTokenValid` comprueba la claim `exp` (segundos desde epoch) contra `Date.now()`.
- Refresco de token:
  - `refreshAccessToken` hace un `fetch` POST a `refreshUrl` con body `{ refresh_token }`.
  - Evita llamadas concurrentes con una promesa almacenada en un ref.
  - Si la respuesta contiene `access_token` (o `accessToken`) lo guarda en `localStorage` y actualiza estado; si devuelve también `refresh_token` lo actualiza.
  - Si la petición falla, llama a `logout()`.
- Sincronización entre pestañas: `window.addEventListener('storage', ...)` actualiza el estado cuando cambian las claves relevantes en otras pestañas.
- Comprobación periódica: un `setInterval` revisa cada 30s si el `access_token` sigue siendo válido; si ha expirado intenta `refreshAccessToken()` antes de marcar al usuario como no autenticado.
- Uso de `useEffect` en montaje: si al iniciar la app el `access_token` está expirado pero hay `refresh_token`, intenta un `refreshAccessToken()` inmediato.


## Flujo de refresco (paso a paso)

1. `refreshAccessToken()` lee `refresh_token` desde `localStorage`.
2. Hace POST a `refreshUrl` con body JSON { refresh_token }.
3. Si la respuesta HTTP es 2xx y contiene `access_token`, guarda el nuevo `access_token` (y opcionalmente `refresh_token`) en `localStorage` y actualiza estado.
4. Si falla (HTTP error, respuesta sin `access_token` o excepción), se ejecuta `logout()`.
5. `refreshAccessToken()` devuelve `true` si el refresh fue exitoso, `false` en caso contrario.


## Ejemplos de uso

- Uso básico en un componente:

```tsx
import useAuth from '@/modules/Auth/hooks/useAuth'

function Example() {
  const { isAuthenticated, login, logout, accessPayload } = useAuth()

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome back!</p>
          <button onClick={() => logout()}>Logout</button>
        </>
      ) : (
        <p>Please login</p>
      )}
    </div>
  )
}
```

- Forzar refresco manualmente (por ejemplo si capturas un 401 globalmente):

```tsx
const auth = useAuth()

async function handle401() {
  const ok = await auth.refreshAccessToken()
  if (ok) {
    // reintenta la petición fallida
  } else {
    // redirige al login
  }
}
```

- Proteger rutas con `ProtectedRoute` (ya hay un ejemplo en `src/App.tsx`):

```tsx
import { Navigate } from 'react-router-dom'
import useAuth from '@/modules/Auth/hooks/useAuth'

function ProtectedRoute({ children }) {
  const auth = useAuth()
  if (!auth.isAuthenticated) return <Navigate to="/login" replace />
  return children
}
```


## Consideraciones de seguridad

- El hook usa `localStorage` para simplicidad. Esto hace que los tokens sean accesibles desde JavaScript y, por tanto, susceptibles a XSS. Si tu política de seguridad lo permite, considera usar cookies httpOnly para el `refresh_token` y mantener el `access_token` en memoria.
- Si usas `localStorage`, asegúrate de mitigar XSS con Content Security Policy (CSP), escaping y revisiones de librerías de terceros.
- El `refresh_token` normalmente debe tener más vida que el `access_token` y el backend debería permitir revocarlos.


## Edge cases y comportamientos esperados

- Si `refreshUrl` responde con un nuevo `refresh_token`, el hook lo sobrescribirá en `localStorage`.
- Si el servidor responde con error o el `refresh_token` está caducado, el hook hace `logout()`.
- Si el usuario tiene varias pestañas abiertas, la sincronización por `storage` mantiene el estado consistente.
- El hook evita refrescos concurrentes; múltiples intentos de refresco esperarán la misma promesa.


## Pruebas recomendadas

- Unit tests para `parseJwt` y `isTokenValid` (casos: token válido, token expirado, malformed token).
- Test para `refreshAccessToken` con fetch mocked: flujo exitoso (devuelve new access_token y opcional refresh_token) y fallos (HTTP 401/400 y excepciones de red).
- Integración: simular expiración de access token y verificar que `refreshAccessToken` actualiza el estado y `localStorage`.


## Personalización

- Cambiar `refreshUrl` al endpoint real pasando la opción al hook: `useAuth({ refreshUrl: '/auth/refresh' })`.
- Si el backend devuelve campos con nombres distintos, actualiza la parte donde el hook busca `data.access_token`.


## Preguntas frecuentes

- ¿Por qué no se usa `axios` o un interceptor automático?
  - El hook es intencionalmente pequeño y framework-agnóstico. Puedes crear un wrapper (fetch/axios) que consulte `useAuth().refreshAccessToken()` en caso de 401 y reintente petición.

- ¿Qué pasa si el refresh está en curso y el usuario cierra la pestaña?
  - La promesa del refresh se cancelará implícitamente (no hay cancelación explícita). Si el refresh fue exitoso en el servidor, la otra pestaña que inicie leerá los tokens actualizados desde `localStorage`.


---

Documentación generada automáticamente por asistente. Si quieres que incluya ejemplos reales del endpoint de refresh (por ejemplo cuerpo/respuesta exacta), pásame la especificación JSON y adapto la sección correspondiente.
