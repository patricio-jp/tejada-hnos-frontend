# Módulo de Actividades

Este módulo gestiona las actividades agrícolas para la producción de nueces en el sistema.

## Estructura

```
Activities/
├── components/           # Componentes reutilizables
│   ├── ActivityCard.tsx
│   ├── ActivityFilters.tsx
│   ├── ActivityFormDialog.tsx
│   └── ActivityStatsCards.tsx
├── data/                # Datos de prueba
│   └── mock-activities.ts
├── hooks/               # Hooks personalizados
│   ├── useActivities.ts
│   └── useActivityStats.ts
├── pages/               # Páginas del módulo
│   ├── ActivitiesDashboard.tsx
│   └── ActivitiesListPage.tsx
├── types/               # Definiciones de tipos
│   └── activity.ts
├── utils/               # Utilidades
│   └── activity-utils.ts
└── index.ts            # Exportaciones públicas
```

## Características

### Tipos de Actividad
- **Poda**: Mantenimiento y formación de árboles
- **Riego**: Gestión de sistemas de riego
- **Aplicación**: Fertilizantes, fungicidas, pesticidas
- **Cosecha**: Recolección de nueces
- **Otro**: Actividades diversas

### Estados
- **Pendiente**: Actividad programada
- **En Progreso**: Actividad en ejecución
- **Completada**: Actividad finalizada
- **Cancelada**: Actividad cancelada

## Páginas

### 1. Dashboard (`ActivitiesDashboard`)
Página principal con resumen y estadísticas:
- Tarjetas con métricas clave
- Distribución de actividades por tipo
- Lista de próximas 5 actividades
- Acceso rápido para crear nueva actividad

**Ruta recomendada**: `/activities/dashboard`

### 2. Listado Completo (`ActivitiesListPage`)
Vista de todas las actividades con filtrado avanzado:
- Búsqueda por texto
- Filtros por tipo, estado, fechas
- Vista en grid responsive
- Edición de actividades

**Ruta recomendada**: `/activities`

## Componentes

### ActivityCard
Tarjeta para mostrar información de una actividad.

```tsx
import { ActivityCard } from '@/modules/Activities';

<ActivityCard 
  activity={activity}
  onEdit={(act) => console.log('Edit', act)}
  onView={(act) => console.log('View', act)}
  compact={false}
/>
```

### ActivityFilters
Panel de filtros para actividades.

```tsx
import { ActivityFilters } from '@/modules/Activities';

<ActivityFilters 
  filters={filters}
  onFiltersChange={setFilters}
/>
```

### ActivityFormDialog
Dialog para crear/editar actividades.

```tsx
import { ActivityFormDialog } from '@/modules/Activities';

<ActivityFormDialog
  activity={activityToEdit}
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  onSave={handleSave}
/>
```

### ActivityStatsCards
Tarjetas de estadísticas.

```tsx
import { ActivityStatsCards } from '@/modules/Activities';

<ActivityStatsCards stats={stats} />
```

## Hooks

### useActivities
Hook principal para gestionar actividades.

```tsx
import { useActivities } from '@/modules/Activities';

function MyComponent() {
  const {
    activities,        // Actividades filtradas
    allActivities,     // Todas las actividades
    filters,           // Filtros actuales
    setFilters,        // Actualizar filtros
    addActivity,       // Agregar nueva actividad
    updateActivity,    // Actualizar actividad existente
    deleteActivity,    // Eliminar actividad
  } = useActivities();
  
  // ...
}
```

### useActivityStats
Hook para obtener estadísticas de actividades.

```tsx
import { useActivityStats } from '@/modules/Activities';

function Dashboard() {
  const { allActivities } = useActivities();
  const stats = useActivityStats(allActivities);
  
  console.log(stats.total, stats.pending, stats.upcomingThisWeek);
}
```

## Datos de Prueba

El módulo incluye 10 actividades de prueba en `data/mock-activities.ts`. Para producción, reemplaza las funciones del hook `useActivities` con llamadas a tu API.

## Integración con el Router

Para integrar estas páginas en tu aplicación, agrega las rutas en tu router:

```tsx
import { ActivitiesDashboard, ActivitiesListPage } from '@/modules/Activities';

// En tu configuración de rutas:
{
  path: '/activities',
  children: [
    {
      path: '',
      element: <ActivitiesListPage />
    },
    {
      path: 'dashboard',
      element: <ActivitiesDashboard />
    }
  ]
}
```

## Personalización

### Colores por Tipo
Edita en `utils/activity-utils.ts`:

```tsx
export function getActivityTypeColor(type: ActivityType): string {
  const colors: Record<ActivityType, string> = {
    poda: 'bg-blue-500',
    riego: 'bg-cyan-500',
    // ...
  };
  return colors[type];
}
```

### Agregar Campos Adicionales
1. Actualiza el tipo `Activity` en `types/activity.ts`
2. Modifica el formulario en `components/ActivityFormDialog.tsx`
3. Actualiza la visualización en `components/ActivityCard.tsx`

## Dependencias

Este módulo utiliza:
- **Shadcn UI**: Componentes de interfaz
- **Lucide React**: Iconos
- **React Router**: Navegación
- **date-fns** (opcional): Manejo de fechas mejorado

## Mejoras Futuras

- [ ] Integración con API real
- [ ] Notificaciones para actividades vencidas
- [ ] Calendario mensual de actividades
- [ ] Exportación a CSV/PDF
- [ ] Historial de cambios
- [ ] Asignación de responsables
- [ ] Imágenes/archivos adjuntos
- [ ] Comentarios en actividades
- [ ] Vista de mapa con parcelas
