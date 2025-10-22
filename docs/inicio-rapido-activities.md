# 🚀 Inicio Rápido - Módulo de Actividades

## Ver el Módulo en Acción

### 1. Iniciar la aplicación

```bash
cd /home/pato/Proyectos/tejada-front
npm run dev
# o
yarn dev
```

### 2. Navegar a las páginas

Una vez la aplicación esté corriendo:

- **Lista de Actividades**: http://localhost:5173/activities
- **Dashboard**: http://localhost:5173/activities/dashboard

### 3. Probar funcionalidades

#### En el Dashboard (`/activities/dashboard`)
1. ✅ Ver 4 tarjetas de estadísticas en la parte superior
2. ✅ Ver distribución de actividades por tipo
3. ✅ Ver lista de próximas 5 actividades
4. ✅ Hacer clic en "Nueva Actividad" para crear una
5. ✅ Hacer clic en "Ver todas" para ir a la lista completa

#### En la Lista (`/activities`)
1. ✅ Ver todas las actividades en formato de tarjetas
2. ✅ Hacer clic en "Filtros" para abrir el panel de filtrado
3. ✅ Buscar por texto en el campo de búsqueda
4. ✅ Filtrar por tipo de actividad (poda, riego, etc.)
5. ✅ Filtrar por estado (pendiente, completada, etc.)
6. ✅ Filtrar por rango de fechas
7. ✅ Hacer clic en "Limpiar" para remover todos los filtros
8. ✅ Hacer clic en "Editar" en cualquier tarjeta para modificar
9. ✅ Hacer clic en "Nueva Actividad" para crear una nueva

#### Crear/Editar Actividad
1. ✅ Seleccionar tipo de actividad
2. ✅ Escribir descripción detallada
3. ✅ Seleccionar una parcela del dropdown
4. ✅ Elegir fecha de ejecución
5. ✅ Cambiar estado si es necesario
6. ✅ Guardar cambios

## Datos de Prueba Incluidos

El módulo incluye **10 actividades de ejemplo** con:
- 2 actividades de riego
- 2 actividades de poda
- 2 actividades de aplicación
- 2 actividades de cosecha
- 2 actividades de tipo "otro"

Estados variados:
- 4 pendientes
- 1 en progreso
- 4 completadas
- 1 cancelada

## Estructura de Archivos Creados

```
src/modules/Activities/
├── components/                     # Componentes reutilizables
│   ├── ActivityCard.tsx           # Tarjeta de actividad
│   ├── ActivityFilters.tsx        # Panel de filtros
│   ├── ActivityFormDialog.tsx     # Dialog crear/editar
│   └── ActivityStatsCards.tsx     # Tarjetas de estadísticas
│
├── data/                          # Datos de prueba
│   └── mock-activities.ts         # 10 actividades mock
│
├── hooks/                         # Hooks personalizados
│   ├── useActivities.ts          # Hook principal
│   └── useActivityStats.ts       # Hook de estadísticas
│
├── pages/                         # Páginas del módulo
│   ├── ActivitiesDashboard.tsx   # Dashboard
│   └── ActivitiesListPage.tsx    # Lista completa
│
├── types/                         # Tipos TypeScript
│   └── activity.ts               # Interfaces y tipos
│
├── utils/                         # Utilidades
│   └── activity-utils.ts         # Funciones helper
│
├── index.ts                       # Exportaciones públicas
└── README.md                      # Documentación del módulo
```

## Integración en el Menú

Para agregar enlaces en tu sidebar/menú de navegación:

```tsx
// En tu componente de sidebar
import { Calendar, LayoutDashboard } from 'lucide-react';

<nav>
  <a href="/activities/dashboard">
    <LayoutDashboard className="mr-2 h-4 w-4" />
    Dashboard Actividades
  </a>
  <a href="/activities">
    <Calendar className="mr-2 h-4 w-4" />
    Ver Actividades
  </a>
</nav>
```

## Personalizar Datos de Prueba

Edita el archivo `src/modules/Activities/data/mock-activities.ts`:

```typescript
export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    type: 'riego',  // 'poda' | 'riego' | 'aplicacion' | 'cosecha' | 'otro'
    description: 'Tu descripción aquí',
    createdAt: new Date('2025-10-15'),
    executionDate: new Date('2025-10-23'),
    createdBy: 'Tu nombre',
    plotId: 'p1',  // ID de una parcela existente
    plotName: 'Nombre de la parcela',
    status: 'pendiente',  // 'pendiente' | 'en-progreso' | 'completada' | 'cancelada'
  },
  // ... más actividades
];
```

## Usar en Otros Componentes

```tsx
import { useActivities } from '@/modules/Activities';

function MyComponent() {
  const { activities, addActivity, updateActivity } = useActivities();
  
  // Usar las actividades
  console.log(`Tienes ${activities.length} actividades`);
}
```

## Conectar con tu API

Cuando estés listo para conectar con tu backend, modifica el hook `useActivities`:

```tsx
// En src/modules/Activities/hooks/useActivities.ts

import { useState, useEffect } from 'react';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar actividades desde tu API
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => setActivities(data))
      .finally(() => setLoading(false));
  }, []);

  const addActivity = async (activity: Activity) => {
    const response = await fetch('/api/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    });
    const newActivity = await response.json();
    setActivities(prev => [...prev, newActivity]);
  };

  // ... resto de las funciones
}
```

## Checklist de Verificación

Después de iniciar la app, verifica:

- [ ] ¿Se ve el dashboard en `/activities/dashboard`?
- [ ] ¿Se ven las 4 tarjetas de estadísticas?
- [ ] ¿Se muestra la distribución por tipo?
- [ ] ¿Se ven las próximas actividades?
- [ ] ¿Funciona el botón "Nueva Actividad"?
- [ ] ¿Se abre el dialog de crear actividad?
- [ ] ¿Se pueden seleccionar parcelas del dropdown?
- [ ] ¿Se guarda correctamente la nueva actividad?
- [ ] ¿Se ve la lista completa en `/activities`?
- [ ] ¿Funcionan todos los filtros?
- [ ] ¿Se pueden editar actividades existentes?
- [ ] ¿Los colores de los badges son correctos?
- [ ] ¿Se marcan las actividades vencidas en rojo?
- [ ] ¿Es responsive en móvil?

## Troubleshooting

### Las parcelas no aparecen en el dropdown
- Verifica que `MOCK_FIELDS` esté importado correctamente en `ActivityFormDialog.tsx`
- Asegúrate que las parcelas tengan IDs

### Los filtros no funcionan
- Abre la consola del navegador para ver errores
- Verifica que el hook `useActivities` esté funcionando correctamente

### Las estadísticas no se actualizan
- El hook `useActivityStats` necesita recibir `allActivities`, no `activities`

## Soporte

Para más información:
- 📖 Lee el `README.md` del módulo
- 💡 Revisa los ejemplos en `docs/ejemplos-activities.md`
- 📝 Consulta el resumen en `docs/resumen-modulo-activities.md`

## ¡Todo Listo! 🎉

Tu módulo de actividades está completamente configurado y listo para usar. Ahora puedes:

1. ✅ Ver y gestionar actividades agrícolas
2. ✅ Filtrar por tipo, estado y fechas
3. ✅ Crear nuevas actividades
4. ✅ Editar actividades existentes
5. ✅ Ver estadísticas y métricas
6. ✅ Identificar actividades vencidas

**¡Disfruta gestionando tus actividades agrícolas!** 🌾🥜
