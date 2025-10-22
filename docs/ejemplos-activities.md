# Ejemplo de Uso del Módulo de Actividades

## Configuración Inicial

El módulo ya está integrado en el router de la aplicación. Las rutas disponibles son:

- `/activities` - Lista completa de actividades con filtros
- `/activities/dashboard` - Dashboard con estadísticas y resumen

## Ejemplo 1: Uso Básico del Hook useActivities

```tsx
import { useActivities } from '@/modules/Activities';

function MyComponent() {
  const { 
    activities,      // Lista filtrada de actividades
    allActivities,   // Todas las actividades sin filtrar
    filters,         // Filtros actuales
    setFilters,      // Función para actualizar filtros
    addActivity,     // Agregar nueva actividad
    updateActivity,  // Actualizar actividad
    deleteActivity   // Eliminar actividad
  } = useActivities();

  // Filtrar solo actividades pendientes
  const handleFilterPending = () => {
    setFilters({ status: 'pendiente' });
  };

  // Agregar una nueva actividad
  const handleAddActivity = () => {
    addActivity({
      id: `act-${Date.now()}`,
      type: 'riego',
      description: 'Riego matutino en parcela norte',
      createdAt: new Date(),
      executionDate: new Date('2025-10-25'),
      createdBy: 'Juan Pérez',
      plotId: 'p1',
      plotName: 'Parcela A',
      status: 'pendiente',
    });
  };

  return (
    <div>
      <button onClick={handleFilterPending}>
        Ver pendientes
      </button>
      <button onClick={handleAddActivity}>
        Agregar actividad
      </button>
      <p>Actividades encontradas: {activities.length}</p>
    </div>
  );
}
```

## Ejemplo 2: Mostrar Estadísticas

```tsx
import { useActivities } from '@/modules/Activities';
import { useActivityStats } from '@/modules/Activities';
import { ActivityStatsCards } from '@/modules/Activities';

function StatsExample() {
  const { allActivities } = useActivities();
  const stats = useActivityStats(allActivities);

  return (
    <div>
      <ActivityStatsCards stats={stats} />
      
      <div className="mt-4">
        <h3>Detalle de Estadísticas</h3>
        <ul>
          <li>Total: {stats.total}</li>
          <li>Pendientes: {stats.pending}</li>
          <li>En progreso: {stats.inProgress}</li>
          <li>Completadas: {stats.completed}</li>
          <li>Próximas esta semana: {stats.upcomingThisWeek}</li>
        </ul>
        
        <h4>Por Tipo:</h4>
        <ul>
          {Object.entries(stats.byType).map(([type, count]) => (
            <li key={type}>{type}: {count}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## Ejemplo 3: Dialog de Crear/Editar Actividad

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ActivityFormDialog } from '@/modules/Activities';
import { useActivities } from '@/modules/Activities';
import type { Activity } from '@/modules/Activities';

function ActivityManager() {
  const { addActivity, updateActivity } = useActivities();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const handleSave = (activity: Activity) => {
    if (editingActivity) {
      // Actualizando actividad existente
      updateActivity(activity.id, activity);
    } else {
      // Creando nueva actividad
      addActivity(activity);
    }
    setEditingActivity(null);
  };

  const handleNew = () => {
    setEditingActivity(null);
    setDialogOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setDialogOpen(true);
  };

  return (
    <div>
      <Button onClick={handleNew}>
        Nueva Actividad
      </Button>

      <ActivityFormDialog
        activity={editingActivity}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
}
```

## Ejemplo 4: Lista de Actividades con Tarjetas

```tsx
import { useActivities } from '@/modules/Activities';
import { ActivityCard } from '@/modules/Activities';
import type { Activity } from '@/modules/Activities';

function ActivityList() {
  const { activities, updateActivity } = useActivities();

  const handleEdit = (activity: Activity) => {
    console.log('Editar:', activity);
    // Aquí abres el dialog de edición
  };

  const handleView = (activity: Activity) => {
    console.log('Ver detalles:', activity);
    // Aquí puedes abrir un modal con más detalles
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onEdit={handleEdit}
          onView={handleView}
          compact={false}
        />
      ))}
    </div>
  );
}
```

## Ejemplo 5: Filtros Personalizados

```tsx
import { useState } from 'react';
import { useActivities } from '@/modules/Activities';
import { ActivityFilters } from '@/modules/Activities';
import type { ActivityFiltersType } from '@/modules/Activities';

function FilteredActivities() {
  const { activities, filters, setFilters } = useActivities();
  const [showFilters, setShowFilters] = useState(true);

  // Filtrar actividades de esta semana
  const handleThisWeek = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    setFilters({
      dateFrom: now,
      dateTo: nextWeek,
      status: 'pendiente',
    });
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
        </button>
        <button onClick={handleThisWeek}>
          Ver actividades de esta semana
        </button>
        <button onClick={handleClearFilters}>
          Limpiar filtros
        </button>
      </div>

      {showFilters && (
        <ActivityFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      <div className="mt-4">
        <p>Resultados: {activities.length} actividades</p>
        {/* Aquí renderizas las actividades */}
      </div>
    </div>
  );
}
```

## Ejemplo 6: Integración con otras partes del sistema

```tsx
import { useActivities } from '@/modules/Activities';
import { MOCK_FIELDS } from '@/lib/mock-data';

function FieldActivities({ fieldId }: { fieldId: string }) {
  const { activities, setFilters } = useActivities();
  
  // Obtener el campo
  const field = MOCK_FIELDS.find(f => f.id === fieldId);
  
  // Obtener IDs de todas las parcelas de este campo
  const plotIds = field?.plots.map(p => p.id as string) || [];
  
  // Filtrar actividades de este campo
  const fieldActivities = activities.filter(act => 
    plotIds.includes(act.plotId)
  );

  return (
    <div>
      <h2>Actividades del Campo: {field?.boundary.properties.name}</h2>
      <p>Total: {fieldActivities.length} actividades</p>
      
      {/* Mostrar actividades del campo */}
      {fieldActivities.map(activity => (
        <div key={activity.id}>
          {activity.description} - {activity.plotName}
        </div>
      ))}
    </div>
  );
}
```

## Ejemplo 7: Notificación de Actividades Vencidas

```tsx
import { useEffect } from 'react';
import { useActivities } from '@/modules/Activities';
import { isOverdue } from '@/modules/Activities/utils/activity-utils';

function OverdueNotifications() {
  const { allActivities } = useActivities();

  useEffect(() => {
    // Buscar actividades vencidas
    const overdue = allActivities.filter(act => 
      isOverdue(act.executionDate, act.status)
    );

    if (overdue.length > 0) {
      console.warn(`⚠️ Tienes ${overdue.length} actividades vencidas!`);
      // Aquí puedes mostrar una notificación toast
    }
  }, [allActivities]);

  const overdueActivities = allActivities.filter(act => 
    isOverdue(act.executionDate, act.status)
  );

  if (overdueActivities.length === 0) {
    return <div>✅ No hay actividades vencidas</div>;
  }

  return (
    <div className="border-red-500 border-2 rounded p-4">
      <h3 className="text-red-600 font-bold">
        ⚠️ Actividades Vencidas ({overdueActivities.length})
      </h3>
      <ul>
        {overdueActivities.map(act => (
          <li key={act.id}>
            {act.description} - Vencida desde {act.executionDate.toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Navegación desde el Menú

Para agregar enlaces a las páginas de actividades en tu menú lateral:

```tsx
// En tu componente de navegación
import { Link } from 'react-router';

<nav>
  <Link to="/activities">Actividades</Link>
  <Link to="/activities/dashboard">Dashboard de Actividades</Link>
</nav>
```

## Testing

Ejemplo de cómo testear el hook:

```tsx
import { renderHook, act } from '@testing-library/react';
import { useActivities } from '@/modules/Activities';

test('should add activity', () => {
  const { result } = renderHook(() => useActivities());

  act(() => {
    result.current.addActivity({
      id: 'test-1',
      type: 'poda',
      description: 'Test activity',
      createdAt: new Date(),
      executionDate: new Date(),
      createdBy: 'Test User',
      plotId: 'p1',
      status: 'pendiente',
    });
  });

  expect(result.current.allActivities).toHaveLength(11); // 10 mock + 1 nueva
});
```
