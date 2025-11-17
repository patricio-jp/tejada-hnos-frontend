# Ruteo por Roles - Lógica de Autorización

## Descripción General

El sistema implementa una lógica de ruteo basada en roles (RBAC - Role-Based Access Control) que determina qué vistas puede acceder cada tipo de usuario y a dónde se redirige al iniciar sesión.

## Roles del Sistema

### 1. ADMIN (Administrador)
- Acceso completo a todas las funcionalidades del sistema
- Dashboard con métricas globales de toda la operación
- Acceso a información de:
  - Todos los campos
  - Órdenes de trabajo
  - Compras y aprobaciones
  - Ventas
  - Catálogos (proveedores, clientes, variedades)
  - Configuraciones y usuarios

### 2. CAPATAZ
- Dashboard con métricas limitadas a sus campos asignados
- Acceso a:
  - Solo los campos que administra
  - Órdenes de trabajo de sus campos
  - Creación y edición de órdenes de compra
  - Catálogos (proveedores, clientes, variedades)
- **NO** tiene acceso a:
  - Información de ventas
  - Aprobación/cierre de órdenes de compra
  - Métricas globales de otros campos

### 3. OPERARIO
- Acceso mínimo y específico
- Solo puede ver:
  - `/my-tasks`: Lista de órdenes de trabajo asignadas
- **NO** puede acceder manualmente a otras rutas como:
  - Campos, actividades, compras, catálogos, etc.
  - Es redirigido automáticamente a `/my-tasks`

## Lógica de Redirección Post-Login

Al iniciar sesión, el sistema redirige automáticamente según el rol:

```
Usuario loguea → Sistema verifica rol del token JWT
                 ↓
           ┌─────┴─────┐
           │           │
    ADMIN/CAPATAZ   OPERARIO
           │           │
           ↓           ↓
      /dashboard   /my-tasks
```

## Componentes de Protección de Rutas

### `RoleBasedDashboard`
Componente inteligente que renderiza el dashboard apropiado según el rol:

- **ADMIN** → `AdminDashboard` (métricas globales)
- **CAPATAZ** → `CapatazDashboard` (métricas de sus campos)
- **OPERARIO** → Redirige a `/my-tasks`
- **Sin rol válido** → Redirige a `/login`

**Ubicación:** `/src/components/RoleBasedDashboard.tsx`

### `AdminCapatazRoute`
Protege rutas que solo ADMIN y CAPATAZ pueden acceder.

**Comportamiento:**
- Usuario no autenticado → Redirige a `/login`
- Usuario OPERARIO → Redirige a `/my-tasks`
- Usuario sin rol válido → Muestra mensaje "Acceso Denegado"
- Usuario ADMIN/CAPATAZ → Permite acceso

**Rutas protegidas:**
- `/fields/*` - Gestión de campos y parcelas
- `/activities/*` - Actividades agrícolas
- `/suppliers` - Catálogo de proveedores
- `/customers` - Catálogo de clientes
- `/varieties` - Catálogo de variedades
- `/purchases/*` - Órdenes de compra (crear/editar)
- `/reports` - Reportes
- `/users` - Gestión de usuarios
- `/settings` - Configuraciones

**Ubicación:** `/src/components/AdminCapatazRoute.tsx`

### `AdminRoute`
Protege rutas exclusivas para ADMIN (funcionalidades críticas).

**Comportamiento:**
- Usuario no autenticado → Redirige a `/login`
- Usuario no ADMIN → Muestra mensaje "Acceso Denegado"
- Usuario ADMIN → Permite acceso

**Rutas protegidas:**
- `/purchases/approvals` - Aprobación de órdenes de compra
- `/purchases/closure` - Cierre administrativo de órdenes

**Ubicación:** `/src/components/AdminRoute.tsx`

### `OperarioRoute`
Protege rutas exclusivas para OPERARIO.

**Comportamiento:**
- Usuario no autenticado → Redirige a `/login`
- Usuario no OPERARIO → Redirige a `/dashboard`
- Usuario OPERARIO → Permite acceso

**Rutas protegidas:**
- `/my-tasks` - Lista de tareas asignadas

**Ubicación:** `/src/components/OperarioRoute.tsx`

## Extracción del Rol del Usuario

El rol del usuario se obtiene del payload del JWT (access token) almacenado en localStorage:

```typescript
const auth = useAuth();
const userRole = auth.accessPayload?.role; // 'ADMIN' | 'CAPATAZ' | 'OPERARIO'
```

El token JWT debe incluir el campo `role` en su payload:

```json
{
  "userId": "123",
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "ADMIN",
  "exp": 1699999999
}
```

## Flujo de Autorización

### 1. Inicio de Sesión
```
POST /api/auth/login
  ↓
Respuesta: { accessToken, refreshToken, user }
  ↓
Token guardado en localStorage
  ↓
Payload decodificado (contiene rol)
  ↓
Redirige según rol
```

### 2. Navegación Manual (escribir URL)
```
Usuario intenta acceder a /suppliers
  ↓
ProtectedRoute: ¿Autenticado?
  ├─ No → Redirige a /login
  └─ Sí → AdminCapatazRoute: ¿Rol válido?
      ├─ OPERARIO → Redirige a /my-tasks
      ├─ ADMIN/CAPATAZ → Permite acceso
      └─ Otro → Mensaje "Acceso Denegado"
```

### 3. Protección en Cascada
Las rutas están protegidas en dos niveles:

1. **Nivel 1 - Autenticación:** `ProtectedRoute` envuelve toda la aplicación
2. **Nivel 2 - Autorización:** Componentes específicos por rol

```tsx
<ProtectedRoute>               {/* ← Nivel 1: Usuario autenticado */}
  <Layout>
    <Routes>
      <Route 
        path="suppliers" 
        element={
          <AdminCapatazRoute>  {/* ← Nivel 2: Rol ADMIN/CAPATAZ */}
            <SuppliersPage />
          </AdminCapatazRoute>
        } 
      />
    </Routes>
  </Layout>
</ProtectedRoute>
```

## Ejemplos de Uso

### Proteger una ruta nueva solo para Admin/Capataz
```tsx
<Route 
  path="nueva-funcionalidad" 
  element={
    <AdminCapatazRoute>
      <NuevaFuncionalidadPage />
    </AdminCapatazRoute>
  } 
/>
```

### Proteger una ruta nueva solo para Admin
```tsx
<Route 
  path="funcionalidad-critica" 
  element={
    <AdminRoute>
      <FuncionalidadCriticaPage />
    </AdminRoute>
  } 
/>
```

### Verificar rol dentro de un componente
```tsx
import useAuth from "@/modules/Auth/hooks/useAuth";

function MiComponente() {
  const auth = useAuth();
  const userRole = auth.accessPayload?.role;
  
  return (
    <div>
      {userRole === 'ADMIN' && <BotonAdmin />}
      {(userRole === 'ADMIN' || userRole === 'CAPATAZ') && <SeccionGestion />}
      <ContenidoGeneral />
    </div>
  );
}
```

## Estructura de Módulos

### Módulo Dashboard (`/src/modules/Dashboard/`)
- `AdminDashboard.tsx` - Dashboard para administradores
- `CapatazDashboard.tsx` - Dashboard para capataces

### Módulo WorkOrders (`/src/modules/WorkOrders/`)
- `MyTasksPage.tsx` - Lista de tareas para operarios

## Consideraciones de Seguridad

1. **Validación en el backend:** La protección del frontend es solo para UX. **SIEMPRE** validar roles en el backend.

2. **Token expirado:** Si el token expira, el usuario es redirigido a `/login` automáticamente.

3. **Sincronización entre tabs:** Los cambios en localStorage (logout/login) se sincronizan entre pestañas del navegador.

4. **Refresh token:** Si el access token expira pero hay refresh token válido, se renueva automáticamente.

## Mantenimiento y Extensión

Para agregar un nuevo rol:

1. Actualizar el backend para incluir el nuevo rol en el JWT
2. Crear un nuevo componente de protección si es necesario (ej: `NuevoRolRoute`)
3. Actualizar `RoleBasedDashboard` para manejar el nuevo rol
4. Crear el dashboard específico del nuevo rol
5. Proteger las rutas correspondientes

## Debugging

Para verificar el rol actual en la consola del navegador:

```javascript
// Obtener el token
const token = localStorage.getItem('access_token');

// Decodificar el payload
const payload = JSON.parse(atob(token.split('.')[1]));

// Ver el rol
console.log('Rol actual:', payload.role);
```

## Diagrama de Rutas por Rol

```
┌─────────────────────────────────────────────────────────┐
│                    RUTAS DEL SISTEMA                    │
└─────────────────────────────────────────────────────────┘

ADMIN:
  ✓ /dashboard (AdminDashboard - métricas globales)
  ✓ /fields/* (todos los campos)
  ✓ /activities/* (todas las actividades)
  ✓ /purchases/* (todas las operaciones)
  ✓ /purchases/approvals (aprobar órdenes)
  ✓ /purchases/closure (cerrar órdenes)
  ✓ /suppliers, /customers, /varieties
  ✓ /reports, /users, /settings
  ✗ /my-tasks (redirige a /dashboard)

CAPATAZ:
  ✓ /dashboard (CapatazDashboard - solo sus campos)
  ✓ /fields/* (solo sus campos asignados)
  ✓ /activities/* (solo de sus campos)
  ✓ /purchases (crear/editar órdenes)
  ✗ /purchases/approvals (acceso denegado)
  ✗ /purchases/closure (acceso denegado)
  ✓ /suppliers, /customers, /varieties
  ✓ /reports, /users, /settings
  ✗ /my-tasks (redirige a /dashboard)

OPERARIO:
  ✗ /dashboard (redirige a /my-tasks)
  ✓ /my-tasks (sus tareas asignadas)
  ✗ /fields/* (redirige a /my-tasks)
  ✗ /activities/* (redirige a /my-tasks)
  ✗ /purchases/* (redirige a /my-tasks)
  ✗ /suppliers, /customers, /varieties (redirige a /my-tasks)
  ✗ /reports, /users, /settings (redirige a /my-tasks)
```

## Notas Adicionales

- Los dashboards de Admin y Capataz están vacíos por ahora, listos para implementar métricas y gráficos
- La página `/my-tasks` mostrará órdenes de trabajo cuando se implemente la funcionalidad completa
- La diferencia entre Admin y Capataz en el dashboard será implementada mediante filtros de datos por campo asignado
