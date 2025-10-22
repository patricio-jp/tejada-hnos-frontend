# InteractiveMap - Componente de Mapa Interactivo

Componente de React para visualizar y editar polígonos geográficos usando deck.gl y MapLibre.

## 🚀 Características

- ✅ **Visualización de polígonos** en formato GeoJSON
- ✅ **Dibujo de polígonos** haciendo clic punto por punto
- ✅ **Selección de polígonos** existentes
- ✅ **Edición de vértices** arrastrando puntos
- ✅ **Feedback visual** durante la edición (vértices amarillos)
- ✅ **Eliminación de polígonos**
- ✅ **Modo solo lectura** opcional
- ✅ **Callback de cambios** para sincronizar datos
- ✅ **Centrado automático** basado en los datos

## 📦 Instalación

Los paquetes necesarios ya están instalados:
- `@deck.gl/react`
- `@deck.gl/layers`
- `react-map-gl`
- `maplibre-gl`

## 🎯 Uso Básico

### 1. Con datos iniciales (desde mock-data.ts)

```tsx
import InteractiveMap from '@/common/components/InteractiveMap';
import { MOCK_FIELDS } from '@/lib/mock-data';
import { fieldsToFeatureCollection, calculateCenter } from '@/common/utils/map-utils';

function MyMapComponent() {
  const initialData = fieldsToFeatureCollection(MOCK_FIELDS);
  const viewState = calculateCenter(initialData);

  return (
    <InteractiveMap
      initialData={initialData}
      initialViewState={viewState}
      editable={true}
    />
  );
}
```

### 2. Modo solo lectura

```tsx
<InteractiveMap
  initialData={myData}
  editable={false}
/>
```

### 3. Escuchar cambios

```tsx
function MyMapComponent() {
  const handleDataChange = (newData: FeatureCollection) => {
    console.log('Datos actualizados:', newData);
    // Guardar en backend, actualizar estado global, etc.
  };

  return (
    <InteractiveMap
      initialData={initialData}
      onDataChange={handleDataChange}
      editable={true}
    />
  );
}
```

### 4. Mapa vacío para crear polígonos

```tsx
<InteractiveMap
  onDataChange={handleDataChange}
  editable={true}
/>
```

## 📚 API Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `initialData` | `FeatureCollection` | `{ type: 'FeatureCollection', features: [] }` | Datos iniciales en formato GeoJSON |
| `onDataChange` | `(data: FeatureCollection) => void` | `undefined` | Callback que se llama cuando los datos cambian |
| `editable` | `boolean` | `true` | Si es `false`, deshabilita la edición |
| `initialViewState` | `{ longitude: number, latitude: number, zoom: number }` | `{ longitude: -65.207, latitude: -26.832, zoom: 13 }` | Vista inicial del mapa |

## 🛠️ Utilidades

### `fieldsToFeatureCollection(fields: Field[]): FeatureCollection`

Convierte un array de campos (tipo `Field` de tu modelo) a un `FeatureCollection` que el mapa puede usar.

```tsx
import { MOCK_FIELDS } from '@/lib/mock-data';
import { fieldsToFeatureCollection } from '@/common/utils/map-utils';

const featureCollection = fieldsToFeatureCollection(MOCK_FIELDS);
```

### `featureCollectionToFields(fc: FeatureCollection): Field[]`

Convierte un `FeatureCollection` de vuelta a la estructura de campos.

```tsx
import { featureCollectionToFields } from '@/common/utils/map-utils';

const fields = featureCollectionToFields(myFeatureCollection);
```

### `calculateCenter(fc: FeatureCollection): ViewState`

Calcula el centro geográfico y zoom apropiado para los datos.

```tsx
import { calculateCenter } from '@/common/utils/map-utils';

const viewState = calculateCenter(myFeatureCollection);
// { longitude: -65.2, latitude: -26.83, zoom: 14 }
```

## 🎮 Controles

### Modo Dibujo
1. Clic en "Crear Polígono"
2. Haz clic en el mapa para añadir puntos (mínimo 3)
3. Verás puntos rojos aparecer en cada clic
4. Clic en "Finalizar Polígono"

### Modo Selección/Edición
1. Clic en "Seleccionar/Editar"
2. Haz clic sobre un polígono para seleccionarlo
3. El polígono seleccionado se mostrará en rojo
4. Verás círculos rojos con borde blanco en cada vértice
5. **Arrastra los vértices** para modificar la forma del polígono
6. Los vértices se vuelven amarillos mientras los arrastras
7. El polígono se actualiza en tiempo real

### Eliminar
1. Selecciona un polígono primero
2. Clic en "Eliminar Selección"

### Modo Vista
- Solo permite navegar por el mapa (zoom, pan)
- No permite editar ni seleccionar

## 🎨 Personalización de Colores

Los polígonos y vértices usan estos colores por defecto:
- **Polígono normal**: Azul semitransparente `[0, 100, 255, 100]`
- **Polígono seleccionado**: Rojo semitransparente `[255, 100, 100, 100]`
- **Línea mientras dibujas**: Roja `[255, 0, 0, 255]`
- **Puntos mientras dibujas**: Rojos `[255, 0, 0, 255]`
- **Vértices editables**: Rojos con borde blanco
- **Vértice arrastrándose**: Amarillo `[255, 255, 0, 255]`

Para personalizarlos, modifica las propiedades `getFillColor` y `getLineColor` en las capas del componente.

## 🗺️ Configuración de Maptiler

El componente usa MapTiler para el mapa base. La API key está configurada en:

```tsx
const MAPTILER_API_KEY = '905AeAMAGxEbxDPflAwf';
```

**⚠️ Importante**: Reemplaza esta clave por tu propia API key de MapTiler en producción.

## 📝 Formato de Datos

El componente trabaja con GeoJSON `FeatureCollection`:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "p1",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-65.20, -26.83],
            [-65.19, -26.83],
            [-65.19, -26.82],
            [-65.20, -26.82],
            [-65.20, -26.83]
          ]
        ]
      },
      "properties": {
        "name": "Parcela A",
        "variety": "Soja",
        "area": 120.5
      }
    }
  ]
}
```

## 🔄 Integración con tu modelo de datos

Si tienes la estructura `Field` con `boundary` y `plots`, usa las utilidades:

```tsx
import { MOCK_FIELDS } from '@/lib/mock-data';
import { fieldsToFeatureCollection, calculateCenter } from '@/common/utils/map-utils';
import type { FeatureCollection } from 'geojson';

function FieldsMap() {
  // Convertir tus datos
  const featureCollection = fieldsToFeatureCollection(MOCK_FIELDS);
  const viewState = calculateCenter(featureCollection);

  // Manejar cambios
  const handleSave = (updatedData: FeatureCollection) => {
    // Convertir de vuelta si necesitas
    const fields = featureCollectionToFields(updatedData);
    // Guardar en tu backend
    saveToBackend(fields);
  };

  return (
    <InteractiveMap
      initialData={featureCollection}
      initialViewState={viewState}
      onDataChange={handleSave}
    />
  );
}
```

## 🐛 Solución de Problemas

### El mapa no se muestra
- Verifica que el contenedor tenga altura definida (`height: '100vh'` o similar)
- Asegúrate de que la API key de MapTiler sea válida

### Los polígonos no aparecen
- Verifica que el formato GeoJSON sea correcto
- Asegúrate de que las coordenadas estén en formato `[longitude, latitude]`

### Errores al dibujar
- Necesitas mínimo 3 puntos para crear un polígono
- El polígono se cierra automáticamente al finalizar

### La edición de vértices no funciona
- Asegúrate de estar en modo "Seleccionar/Editar"
- Primero selecciona un polígono haciendo clic sobre él
- Los vértices editables aparecerán como puntos rojos
- Haz clic y arrastra los puntos rojos (no solo hagas clic)
- El cursor debería cambiar a "grab" al pasar sobre un vértice

## 📂 Archivos Relacionados

- `src/common/components/InteractiveMap.tsx` - Componente principal
- `src/common/utils/map-utils.ts` - Utilidades de conversión
- `src/common/components/MapExample.tsx` - Ejemplos de uso
- `src/lib/mock-data.ts` - Datos de ejemplo
- `src/lib/map-types.ts` - Tipos TypeScript

## 🚀 Siguiente Pasos

- [x] Implementar edición de vértices de polígonos existentes ✅
- [ ] Añadir soporte para múltiples selecciones
- [ ] Implementar herramientas de medición de área
- [ ] Añadir capas adicionales (satélite, terreno, etc.)
- [ ] Exportar/importar archivos GeoJSON
- [ ] Deshacer/Rehacer cambios (undo/redo)
