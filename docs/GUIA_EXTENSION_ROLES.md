# Guía para Extender el Sistema de Ruteo por Roles

## Agregar un Nuevo Rol

### 1. Actualizar el Backend
Primero, asegúrate de que el backend incluya el nuevo rol en el JWT:

```typescript
// Backend: Al generar el token
const payload = {
  userId: user.id,
  email: user.email,
  name: user.name,
  role: user.role, // ← Debe incluir el nuevo rol (ej: "SUPERVISOR")
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
};
```

### 2. Crear Componente de Protección (Opcional)

Si el nuevo rol necesita rutas exclusivas, crea un componente de protección:

```tsx
// /src/components/SupervisorRoute.tsx
import useAuth from "@/modules/Auth/hooks/useAuth";
import { Navigate } from "react-router";

interface SupervisorRouteProps {
  children: React.ReactElement;
}

export function SupervisorRoute({ children }: SupervisorRouteProps) {
  const auth = useAuth();
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = auth.accessPayload?.role;
  
  if (userRole !== 'SUPERVISOR') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
```

### 3. Crear Dashboard Específico (si aplica)

```tsx
// /src/modules/Dashboard/pages/SupervisorDashboard.tsx
export default function SupervisorDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Dashboard de Supervisor</h1>
      <p className="text-muted-foreground mt-2">
        Vista específica para supervisores
      </p>
      {/* Contenido específico del supervisor */}
    </div>
  );
}
```

### 4. Actualizar RoleBasedDashboard

```tsx
// /src/components/RoleBasedDashboard.tsx
import { SupervisorDashboard } from "@/modules/Dashboard";

export function RoleBasedDashboard() {
  const auth = useAuth();
  const userRole = auth.accessPayload?.role;

  switch (userRole) {
    case 'ADMIN':
      return <AdminDashboard />;
    
    case 'CAPATAZ':
      return <CapatazDashboard />;
    
    case 'SUPERVISOR':  // ← Nuevo rol
      return <SupervisorDashboard />;
    
    case 'OPERARIO':
      return <Navigate to="/my-tasks" replace />;
    
    default:
      return <Navigate to="/login" replace />;
  }
}
```

### 5. Proteger Rutas Nuevas en App.tsx

```tsx
// /src/App.tsx
import { SupervisorRoute } from '@/components/SupervisorRoute';

// Dentro de <Routes>
<Route 
  path="supervisor-tasks" 
  element={
    <SupervisorRoute>
      <SupervisorTasksPage />
    </SupervisorRoute>
  } 
/>
```

---

## Agregar una Nueva Ruta Protegida

### Ruta solo para ADMIN

```tsx
<Route 
  path="configuracion-avanzada" 
  element={
    <AdminRoute>
      <ConfiguracionAvanzadaPage />
    </AdminRoute>
  } 
/>
```

### Ruta para ADMIN y CAPATAZ

```tsx
<Route 
  path="gestion-personal" 
  element={
    <AdminCapatazRoute>
      <GestionPersonalPage />
    </AdminCapatazRoute>
  } 
/>
```

### Ruta para múltiples roles específicos

Si necesitas una combinación personalizada de roles, crea un componente:

```tsx
// /src/components/AdminSupervisorRoute.tsx
export function AdminSupervisorRoute({ children }: { children: React.ReactElement }) {
  const auth = useAuth();
  const userRole = auth.accessPayload?.role;
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== 'ADMIN' && userRole !== 'SUPERVISOR') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}
```

Luego úsalo:

```tsx
<Route 
  path="auditoria" 
  element={
    <AdminSupervisorRoute>
      <AuditoriaPage />
    </AdminSupervisorRoute>
  } 
/>
```

---

## Verificar Rol Dentro de un Componente

### Mostrar/Ocultar Elementos por Rol

```tsx
import useAuth from "@/modules/Auth/hooks/useAuth";

function MiComponente() {
  const auth = useAuth();
  const userRole = auth.accessPayload?.role;
  
  return (
    <div>
      {/* Solo ADMIN ve este botón */}
      {userRole === 'ADMIN' && (
        <Button onClick={handleDelete}>Eliminar Todo</Button>
      )}
      
      {/* ADMIN y CAPATAZ ven esta sección */}
      {(userRole === 'ADMIN' || userRole === 'CAPATAZ') && (
        <GestionSection />
      )}
      
      {/* Todos los usuarios autenticados ven esto */}
      <ContenidoGeneral />
    </div>
  );
}
```

### Usar Hook Personalizado

Puedes crear un hook para verificaciones más limpias:

```tsx
// /src/hooks/useUserRole.ts
import useAuth from "@/modules/Auth/hooks/useAuth";

export function useUserRole() {
  const auth = useAuth();
  const role = auth.accessPayload?.role;
  
  return {
    role,
    isAdmin: role === 'ADMIN',
    isCapataz: role === 'CAPATAZ',
    isOperario: role === 'OPERARIO',
    isSupervisor: role === 'SUPERVISOR',
    canManageFields: role === 'ADMIN' || role === 'CAPATAZ',
    canApprove: role === 'ADMIN',
  };
}
```

Luego úsalo:

```tsx
import { useUserRole } from "@/hooks/useUserRole";

function MiComponente() {
  const { isAdmin, canManageFields } = useUserRole();
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      {canManageFields && <FieldManagement />}
    </div>
  );
}
```

---

## Filtrar Datos por Rol

### En el Frontend (para UX)

```tsx
// Filtrar campos según el rol del usuario
function FieldsList() {
  const { role } = useUserRole();
  const { data: fields } = useFields();
  
  // Si es CAPATAZ, filtrar solo sus campos asignados
  const visibleFields = useMemo(() => {
    if (role === 'CAPATAZ') {
      // Aquí filtrarías según los campos asignados al capataz
      // (esta info debería venir del backend en el perfil del usuario)
      return fields?.filter(field => field.capatazId === auth.userId);
    }
    return fields; // ADMIN ve todos
  }, [fields, role]);
  
  return (
    <div>
      {visibleFields?.map(field => (
        <FieldCard key={field.id} field={field} />
      ))}
    </div>
  );
}
```

### En el Backend (CRÍTICO para seguridad)

```typescript
// Backend: Endpoint para obtener campos
async getFields(req: Request, res: Response) {
  const userRole = req.user.role;
  const userId = req.user.id;
  
  let fields;
  
  if (userRole === 'ADMIN') {
    // Admin ve todos los campos
    fields = await this.fieldService.findAll();
  } else if (userRole === 'CAPATAZ') {
    // Capataz solo ve sus campos asignados
    fields = await this.fieldService.findByCapatazId(userId);
  } else if (userRole === 'OPERARIO') {
    // Operario no debería acceder a este endpoint
    return res.status(403).json({ message: 'No autorizado' });
  }
  
  return res.json({ data: fields });
}
```

---

## Actualizar el Sidebar/Menú según Rol

```tsx
// /src/components/layout/Sidebar.tsx
import { useUserRole } from "@/hooks/useUserRole";

function Sidebar() {
  const { isAdmin, isCapataz, isOperario, canManageFields } = useUserRole();
  
  return (
    <nav>
      {/* Dashboard - todos excepto operario */}
      {!isOperario && (
        <NavLink to="/dashboard">Dashboard</NavLink>
      )}
      
      {/* Mis tareas - solo operario */}
      {isOperario && (
        <NavLink to="/my-tasks">Mis Tareas</NavLink>
      )}
      
      {/* Campos - Admin y Capataz */}
      {canManageFields && (
        <NavLink to="/fields">Campos</NavLink>
      )}
      
      {/* Aprobaciones - Solo Admin */}
      {isAdmin && (
        <NavLink to="/purchases/approvals">Aprobaciones</NavLink>
      )}
      
      {/* Catálogos - Admin y Capataz */}
      {canManageFields && (
        <NavSection title="Catálogos">
          <NavLink to="/suppliers">Proveedores</NavLink>
          <NavLink to="/customers">Clientes</NavLink>
          <NavLink to="/varieties">Variedades</NavLink>
        </NavSection>
      )}
    </nav>
  );
}
```

---

## Debugging y Testing

### Ver el rol actual en consola

```javascript
// En la consola del navegador
const token = localStorage.getItem('access_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Rol actual:', payload.role);
console.log('Payload completo:', payload);
```

### Simular diferentes roles en desarrollo

Para testing, puedes crear tokens de prueba con diferentes roles:

```typescript
// En el backend de desarrollo
// Crear usuarios de prueba con diferentes roles
const testUsers = [
  { email: 'admin@test.com', password: 'admin123', role: 'ADMIN' },
  { email: 'capataz@test.com', password: 'capataz123', role: 'CAPATAZ' },
  { email: 'operario@test.com', password: 'operario123', role: 'OPERARIO' },
];
```

### Test de protección de rutas

```tsx
// Prueba manual:
// 1. Loguear como OPERARIO
// 2. Abrir consola del navegador
// 3. Ejecutar:
window.location.href = '/suppliers';
// Debería redirigir automáticamente a /my-tasks
```

---

## Buenas Prácticas

### ✅ DO (Hacer)

1. **Siempre validar roles en el backend** - La protección del frontend es solo para UX
2. **Usar constantes para roles**:
   ```tsx
   export const ROLES = {
     ADMIN: 'ADMIN',
     CAPATAZ: 'CAPATAZ',
     OPERARIO: 'OPERARIO',
   } as const;
   
   // Uso:
   if (userRole === ROLES.ADMIN) { ... }
   ```

3. **Crear hooks reutilizables** para verificaciones de roles
4. **Documentar cambios** en la matriz de acceso
5. **Redireccionar automáticamente** roles no autorizados
6. **Mostrar mensajes claros** cuando se deniegue acceso

### ❌ DON'T (No hacer)

1. **No confiar solo en la protección del frontend** - Siempre validar en backend
2. **No duplicar lógica de roles** - Centralizarla en hooks o utils
3. **No hardcodear roles** - Usar constantes o enums
4. **No mostrar rutas inaccesibles** en el menú de navegación
5. **No permitir navegación silenciosa** a rutas no autorizadas sin feedback

---

## Checklist para Nuevas Funcionalidades

Cuando agregues una nueva funcionalidad con restricciones de roles:

- [ ] ¿El endpoint del backend valida el rol?
- [ ] ¿La ruta está protegida con el componente apropiado?
- [ ] ¿El menú de navegación refleja el acceso por rol?
- [ ] ¿Se muestran mensajes claros de acceso denegado?
- [ ] ¿Se documenta la nueva ruta en ROLE_BASED_ROUTING.md?
- [ ] ¿Se actualiza la matriz de acceso?
- [ ] ¿Se probó con todos los roles relevantes?

---

## Recursos

- **Documentación principal**: `/docs/ROLE_BASED_ROUTING.md`
- **Ejemplos visuales**: `/docs/ejemplo-visual-ruteo-roles.md`
- **Hook de autenticación**: `/src/modules/Auth/hooks/useAuth.tsx`
- **Componentes de protección**: `/src/components/*Route.tsx`
- **Dashboard por rol**: `/src/modules/Dashboard/pages/`
