# Sistema de Autenticación - Guía de Uso

## Descripción General

El sistema de autenticación implementado utiliza JWT (JSON Web Tokens) con tokens de acceso y refresh. El hook `useAuth` gestiona automáticamente:

- ✅ Login y logout
- ✅ Almacenamiento de tokens en localStorage
- ✅ Refresco automático de tokens expirados
- ✅ Sincronización entre pestañas/ventanas
- ✅ Validación de tokens

## Endpoints del Backend

### Login
```typescript
POST http://localhost:3000/auth/login
Body: { email: string, password: string }
Response: {
  accessToken: string,
  refreshToken: string,
  user: { id, name, email, ... }
}
```

### Refresh Token
```typescript
POST http://localhost:3000/auth/refresh
Body: { refreshToken: string }
Response: {
  accessToken: string,
  refreshToken?: string
}
```

## Uso del Hook useAuth

### Importación
```typescript
import useAuth from '@/modules/Auth/hooks/useAuth'
```

### En un Componente

```typescript
function MyComponent() {
  const { 
    isAuthenticated,    // boolean - si el usuario está autenticado
    accessToken,        // string | null - token de acceso actual
    refreshToken,       // string | null - token de refresh actual
    accessPayload,      // objeto con los datos decodificados del JWT
    login,              // (accessToken, refreshToken?) => void
    logout,             // () => void
    checkAuth,          // () => boolean - verifica el estado actual
    refreshAccessToken  // () => Promise<boolean> - refresca el token manualmente
  } = useAuth()

  // Ejemplo de uso
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return (
    <div>
      <p>Bienvenido, {accessPayload?.name}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  )
}
```

## Cliente HTTP Autenticado

Para hacer peticiones HTTP autenticadas, usa el cliente `authClient`:

```typescript
import { authClient } from '@/lib/http-client'

// GET request
const users = await authClient.get('/users')

// POST request
const newUser = await authClient.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// PUT request
const updated = await authClient.put(`/users/${id}`, { name: 'Jane' })

// PATCH request
const patched = await authClient.patch(`/users/${id}`, { email: 'new@email.com' })

// DELETE request
await authClient.delete(`/users/${id}`)
```

El cliente HTTP automáticamente:
- Incluye el token de acceso en el header `Authorization: Bearer <token>`
- Parsea respuestas JSON
- Lanza errores `HttpError` en caso de error

### Manejo de Errores

```typescript
import { authClient, HttpError } from '@/lib/http-client'

try {
  const data = await authClient.get('/api/protected')
  console.log(data)
} catch (error) {
  if (error instanceof HttpError) {
    console.error(`Error ${error.status}: ${error.statusText}`)
    console.error('Data:', error.data)
    
    // Si es 401 Unauthorized, redirigir al login
    if (error.status === 401) {
      // El hook useAuth maneja esto automáticamente
      // pero puedes agregar lógica adicional aquí
    }
  }
}
```

## Formulario de Login

El componente `LoginForm` ya está integrado con el sistema de autenticación:

```typescript
import { LoginForm } from '@/components/login-form'

// En tu página de login
function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm />
    </div>
  )
}
```

## Rutas Protegidas

Usa el componente `ProtectedRoute` para proteger rutas que requieren autenticación:

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Routes, Route } from 'react-router'

function App() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rutas protegidas */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}
```

## Configuración Personalizada

Puedes personalizar el comportamiento del hook useAuth:

```typescript
const auth = useAuth({
  accessTokenKey: 'custom_access_token',      // default: 'access_token'
  refreshTokenKey: 'custom_refresh_token',    // default: 'refresh_token'
  refreshUrl: 'https://api.example.com/auth/refresh', // default: 'http://localhost:3000/auth/refresh'
  onLogout: () => {
    // Ejecutar lógica adicional al hacer logout
    console.log('User logged out')
    // Ejemplo: notificar al servidor
    fetch('/api/auth/logout', { method: 'POST' })
  }
})
```

## Acceso al Payload del Token

El hook decodifica automáticamente el JWT y expone su contenido:

```typescript
const { accessPayload } = useAuth()

// accessPayload contiene todos los datos del JWT, por ejemplo:
// {
//   sub: "user-id",
//   email: "user@example.com",
//   name: "John Doe",
//   iat: 1234567890,
//   exp: 1234567890
// }

console.log('User ID:', accessPayload?.sub)
console.log('Email:', accessPayload?.email)
```

## Refresco Automático de Tokens

El hook maneja automáticamente:

1. **Verificación periódica**: Cada 30 segundos verifica si el token ha expirado
2. **Refresco automático**: Si el token expira, intenta refrescarlo automáticamente usando el refresh token
3. **Logout automático**: Si el refresco falla, cierra la sesión automáticamente
4. **Refresco al montar**: Al cargar la aplicación, si el access token está expirado pero hay un refresh token, intenta refrescar

También puedes refrescar manualmente:

```typescript
const { refreshAccessToken } = useAuth()

// Refrescar manualmente
const success = await refreshAccessToken()
if (success) {
  console.log('Token refrescado exitosamente')
} else {
  console.log('Falló el refresco, sesión cerrada')
}
```

## Sincronización entre Pestañas

El sistema sincroniza automáticamente el estado de autenticación entre todas las pestañas/ventanas del navegador:

- Si inicias sesión en una pestaña, todas las demás se actualizan automáticamente
- Si cierras sesión en una pestaña, todas las demás cierran sesión también
- Usa el evento `storage` de localStorage para la sincronización

## Notas Importantes

⚠️ **Validación de Tokens**: Actualmente la validación de expiración está deshabilitada temporalmente:
```typescript
export function isTokenValid(token: string | null) {
  return true // TO-DO: temporarily disable token validation
}
```

Para habilitar la validación, elimina ese return y permite que el código verifique la expiración del token.

🔒 **Seguridad**: 
- Los tokens se almacenan en localStorage
- No se recomienda para aplicaciones de máxima seguridad (usar httpOnly cookies en su lugar)
- Asegúrate de usar HTTPS en producción

📝 **Typescript**: Todo el sistema está completamente tipado para mejor experiencia de desarrollo.
