# InteractiveMap - Guía de Modos de Operación

## 📋 Resumen de Cambios

El componente `InteractiveMap` ahora separa la **selección** y la **edición** en dos pasos distintos, proporcionando un flujo de trabajo más claro y controlado.

---

## 🎯 Modos de Operación

### 1. **Modo Ver** (`view`)
- **Descripción**: Modo de solo lectura
- **Acciones**: Navegar por el mapa, hacer zoom
- **UI**: Botón "Modo Ver" resaltado
- **Cursor**: Default

### 2. **Modo Dibujar** (`drawPolygon`)
- **Descripción**: Crear nuevos polígonos
- **Acciones**: 
  - Clic en el mapa para añadir puntos
  - Botón "Finalizar Polígono" cuando hay ≥3 puntos
  - Botón "Cancelar" para abortar
- **Resultado**: Al finalizar, cambia automáticamente a modo `select`
- **Cursor**: Crosshair

### 3. **Modo Seleccionar** (`select`) ⭐ NUEVO
- **Descripción**: Seleccionar polígonos existentes
- **Acciones**:
  - Clic en un polígono para seleccionarlo
  - El polígono se resalta en rojo
  - Se ejecuta el callback `onFeatureSelect`
- **UI**: Botón "Seleccionar" resaltado
- **Cursor**: Pointer (cuando hay hover)
- **Nota**: NO muestra vértices editables

### 4. **Modo Editar** (`edit`) ⭐ NUEVO
- **Descripción**: Editar vértices del polígono seleccionado
- **Requisito**: Debe haber un polígono seleccionado
- **Acciones**:
  - Muestra vértices rojos editables
  - Arrastra los vértices para modificar la geometría
  - Los cambios se aplican en tiempo real
- **UI**: Botón "Editar Vértices" habilitado solo si hay selección
- **Cursor**: Grab (hover en vértices), Grabbing (arrastrando)

---

## 🔄 Flujo de Trabajo

### Crear un nuevo polígono:
```
1. Clic en "Crear Polígono" → Modo drawPolygon
2. Añadir puntos en el mapa (mínimo 3)
3. Clic en "Finalizar Polígono" → Automáticamente a modo select
```

### Editar un polígono existente:
```
1. Clic en "Seleccionar" → Modo select
2. Clic en un polígono → Se selecciona (evento onFeatureSelect)
3. Clic en "Editar Vértices" → Modo edit
4. Arrastrar vértices rojos para modificar
5. Clic en "Modo Ver" para terminar
```

### Eliminar un polígono:
```
1. Modo select → Seleccionar polígono
2. Clic en "Eliminar Selección"
```

---

## 📝 API del Componente

### Props

```typescript
interface InteractiveMapProps {
  // Datos GeoJSON iniciales
  initialData?: FeatureCollection;
  
  // Callback cuando cambian los datos (crear, editar, eliminar)
  onDataChange?: (data: FeatureCollection) => void;
  
  // ⭐ NUEVO: Callback cuando se selecciona un feature
  onFeatureSelect?: (feature: Feature | null, index: number | null) => void;
  
  // Si el mapa es editable
  editable?: boolean;
  
  // Vista inicial del mapa
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}
```

### Ejemplo de Uso

```tsx
import InteractiveMap from '@/common/components/InteractiveMap';
import { useState } from 'react';

function MyComponent() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <InteractiveMap
      initialData={myGeoJsonData}
      onDataChange={(newData) => {
        console.log('Datos actualizados:', newData);
        // Guardar en tu estado/backend
      }}
      onFeatureSelect={(feature, index) => {
        console.log('Feature seleccionado:', feature, 'en índice:', index);
        setSelectedFeature(feature);
        // Aquí puedes ejecutar cualquier acción adicional:
        // - Mostrar información en un panel lateral
        // - Cargar datos relacionados
        // - Actualizar otro componente
      }}
      editable={true}
      initialViewState={{
        longitude: -65.207,
        latitude: -26.832,
        zoom: 13
      }}
    />
  );
}
```

---

## 🎨 Indicadores Visuales

### Polígonos
- **Normal**: Azul translúcido
- **Seleccionado**: Rojo translúcido

### Puntos
- **Dibujando**: Rojos (puntos temporales)
- **Vértices editables**: Rojos con borde blanco
- **Vértice arrastrándose**: Amarillo

### Botones
- **Activo**: Variante `default` (azul)
- **Inactivo**: Variante `outline`
- **Eliminar con selección**: Variante `destructive` (rojo)

---

## 🔐 Estados de los Botones

| Botón | Habilitado cuando... | Modo resultante |
|-------|---------------------|-----------------|
| Crear Polígono | `editable=true` | `drawPolygon` |
| Seleccionar | Hay polígonos | `select` |
| Editar Vértices | Hay selección | `edit` |
| Eliminar | Hay selección | - (mantiene modo) |
| Modo Ver | Siempre | `view` |

---

## 💡 Beneficios del Nuevo Diseño

### ✅ Antes (modo `modify` unificado):
- Un solo botón "Seleccionar/Editar"
- Al seleccionar un polígono, se mostraban inmediatamente los vértices
- Difícil distinguir entre "solo quiero ver qué seleccioné" vs "quiero editar"

### ✨ Ahora (modos `select` + `edit` separados):
- Dos pasos claros: primero seleccionar, luego editar
- Puedes seleccionar sin entrar a edición
- El callback `onFeatureSelect` te permite ejecutar acciones al seleccionar
- Más control sobre el flujo de trabajo
- UX más intuitiva y predecible

---

## 🚀 Casos de Uso

### 1. Panel de Información
```tsx
onFeatureSelect={(feature, index) => {
  if (feature) {
    // Mostrar panel con detalles del polígono
    showSidebar({
      name: feature.properties.name,
      area: calculateArea(feature),
      // ... más info
    });
  }
}
```

### 2. Carga de Datos Relacionados
```tsx
onFeatureSelect={async (feature, index) => {
  if (feature && feature.properties.id) {
    // Cargar datos del backend
    const details = await fetchFieldDetails(feature.properties.id);
    setFieldDetails(details);
  }
}
```

### 3. Validación Antes de Editar
```tsx
onFeatureSelect={(feature, index) => {
  if (feature && !canEdit(feature)) {
    alert('No tienes permisos para editar este polígono');
    // No permitir cambiar a modo edit
  }
}
```

---

## 📊 Diagrama de Estados

```
┌─────────┐
│  view   │◄─────────────────┐
└────┬────┘                  │
     │                       │
     ├──► drawPolygon ───────┤
     │                       │
     ├──► select ◄───────────┤
     │      │                │
     │      └──► edit ────────┘
     │
     └──────────────────────►│
```

---

## 🔧 Personalización

Si necesitas un comportamiento diferente, puedes:

1. **Saltar al modo edit directamente**: En `onFeatureSelect`, cambiar manualmente el modo
2. **Deseleccionar al cambiar de modo**: Agregar lógica en los botones
3. **Múltiple selección**: Modificar `selectedFeatureIndexes` para aceptar múltiples índices

---

¿Necesitas más detalles o ejemplos? 🚀
