# Pruebas del Sistema de Autenticación

## Cambios Realizados

### ✅ Archivos Modificados

1. **`src/components/login-form.tsx`**
   - Integrado con el hook `useAuth`
   - Manejo completo del formulario con estados
   - Conexión al endpoint de login
   - Manejo de errores y feedback visual
   - Estados de carga durante la autenticación

2. **`src/modules/Auth/hooks/useAuth.tsx`**
   - Actualizado el endpoint de refresh a `http://localhost:3000/auth/refresh`
   - Modificado el body del request de refresh para usar `refreshToken` en lugar de `refresh_token`
   - Ajustado el parseo de respuesta para soportar ambos formatos (`accessToken` y `access_token`)

3. **`src/App.tsx`**
   - Agregado ejemplo de uso del hook `useAuth` en el componente Home
   - Implementado botón de logout
   - Mostrar información del usuario autenticado
   - Actualizado el componente Protected con información del usuario

### ✅ Archivos Creados

1. **`src/lib/http-client.ts`**
   - Cliente HTTP con soporte para autenticación automática
   - Manejo de errores con clase `HttpError`
   - Métodos: GET, POST, PUT, PATCH, DELETE
   - Inclusión automática del token en headers

2. **`src/hooks/useApiClient.ts`**
   - Hook que combina el cliente HTTP con el sistema de autenticación
   - Manejo automático de errores 401 (redirige al login)
   - Cierre de sesión automático cuando el token es inválido

3. **`docs/sistema-autenticacion.md`**
   - Documentación completa del sistema de autenticación
   - Ejemplos de uso
   - Guía de configuración
   - Casos de uso comunes

4. **`docs/pruebas-autenticacion.md`** (este archivo)
   - Instrucciones para probar el sistema

## Cómo Probar

### Requisitos Previos

1. Backend corriendo en `http://localhost:3000`
2. Endpoint de login: `POST http://localhost:3000/auth/login`
3. Endpoint de refresh: `POST http://localhost:3000/auth/refresh`

### Paso 1: Iniciar la Aplicación

```bash
npm run dev
```

### Paso 2: Probar el Login

1. Navega a `http://localhost:5173/login`
2. Ingresa credenciales válidas:
   - Email: `tu@email.com`
   - Contraseña: `tu_password`
3. Haz clic en "Iniciar sesión"
4. Si las credenciales son correctas, serás redirigido a la página principal
5. Si hay un error, verás un mensaje de error en rojo

### Paso 3: Verificar Tokens

Abre las DevTools del navegador (F12):

```javascript
// Verificar tokens en localStorage
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')
```

### Paso 4: Verificar Estado de Autenticación

En la página Home verás:
- Mensaje de bienvenida
- Información del usuario (email)
- Botón para cerrar sesión

### Paso 5: Probar Logout

1. Haz clic en el botón "Cerrar Sesión"
2. Verifica que seas redirigido a `/login`
3. Verifica que los tokens fueron eliminados de localStorage

### Paso 6: Probar Rutas Protegidas

1. Sin estar autenticado, intenta acceder a: `http://localhost:5173/`
2. Deberías ser redirigido automáticamente a `/login`
3. Después de autenticarte, deberías poder acceder a todas las rutas

### Paso 7: Probar Refresco de Tokens

El sistema refresca automáticamente los tokens cada 30 segundos si están expirados.

Para probar manualmente:

```javascript
// En la consola del navegador
const auth = useAuth()
const success = await auth.refreshAccessToken()
console.log('Refresh exitoso:', success)
```

### Paso 8: Probar Cliente HTTP Autenticado

Puedes probar el cliente HTTP desde cualquier componente:

```typescript
import { useApiClient } from '@/hooks/useApiClient'

function MyComponent() {
  const api = useApiClient()
  
  const fetchData = async () => {
    try {
      // Ejemplo: obtener usuarios
      const users = await api.get('/users')
      console.log(users)
    } catch (error) {
      console.error('Error:', error)
    }
  }
  
  return <button onClick={fetchData}>Cargar Datos</button>
}
```

### Paso 9: Probar Sincronización entre Pestañas

1. Abre dos pestañas de la aplicación
2. Inicia sesión en una pestaña
3. Verifica que la otra pestaña también se actualice automáticamente
4. Cierra sesión en una pestaña
5. Verifica que ambas pestañas cierren sesión

## Casos de Prueba

### ✅ Login Exitoso
- **Entrada**: Email y contraseña válidos
- **Resultado esperado**: 
  - Redirigir a la página principal
  - Tokens guardados en localStorage
  - Usuario autenticado

### ✅ Login Fallido
- **Entrada**: Credenciales inválidas
- **Resultado esperado**: 
  - Mensaje de error mostrado
  - No redirigir
  - No guardar tokens

### ✅ Logout
- **Acción**: Hacer clic en "Cerrar Sesión"
- **Resultado esperado**: 
  - Tokens eliminados de localStorage
  - Redirigir a `/login`
  - Estado de autenticación actualizado

### ✅ Rutas Protegidas
- **Condición**: Usuario no autenticado
- **Resultado esperado**: 
  - Redirigir automáticamente a `/login`
  - Después de login, acceso a todas las rutas protegidas

### ✅ Refresco Automático de Tokens
- **Condición**: Token de acceso expirado pero refresh token válido
- **Resultado esperado**: 
  - Refresco automático del token
  - No cerrar sesión
  - Usuario continúa autenticado

### ✅ Token Inválido
- **Condición**: Token de acceso y refresh inválidos
- **Resultado esperado**: 
  - Cerrar sesión automáticamente
  - Redirigir a `/login`

### ✅ Cliente HTTP con Token
- **Acción**: Hacer petición HTTP autenticada
- **Resultado esperado**: 
  - Header `Authorization: Bearer <token>` incluido
  - Petición exitosa si el token es válido

### ✅ Cliente HTTP - Error 401
- **Acción**: Hacer petición con token inválido
- **Resultado esperado**: 
  - Error capturado
  - Logout automático
  - Redirigir a `/login`

## Debugging

### Ver Estado del Hook useAuth

```typescript
import useAuth from '@/modules/Auth/hooks/useAuth'

function DebugComponent() {
  const auth = useAuth()
  
  console.log('Is Authenticated:', auth.isAuthenticated)
  console.log('Access Token:', auth.accessToken)
  console.log('Refresh Token:', auth.refreshToken)
  console.log('Access Payload:', auth.accessPayload)
  
  return <pre>{JSON.stringify(auth, null, 2)}</pre>
}
```

### Ver Tokens Decodificados

```typescript
import { parseJwt } from '@/modules/Auth/hooks/useAuth'

const token = localStorage.getItem('access_token')
const payload = parseJwt(token)
console.log('Token Payload:', payload)
```

## Problemas Conocidos

### ⚠️ Validación de Tokens Deshabilitada

La validación de expiración de tokens está temporalmente deshabilitada:

```typescript
export function isTokenValid(token: string | null) {
  return true // TO-DO: temporarily disable token validation
}
```

Para habilitar la validación, comenta esa línea en `src/modules/Auth/hooks/useAuth.tsx`.

### 🔧 Configuración de CORS

Asegúrate de que el backend tenga configurado CORS para aceptar peticiones desde `http://localhost:5173`:

```javascript
// Ejemplo en Express.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
```

## Próximos Pasos

- [ ] Habilitar validación de expiración de tokens
- [ ] Agregar manejo de refresh token expirado
- [ ] Implementar "Recordarme" con cookies httpOnly
- [ ] Agregar rate limiting en el cliente
- [ ] Implementar retry automático en peticiones fallidas
- [ ] Agregar logs de auditoría de autenticación
