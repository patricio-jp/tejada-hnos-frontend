# Migración de Leaflet a Deck.gl

## Resumen

Se ha migrado exitosamente de **Leaflet + react-leaflet-draw** a **Deck.gl + react-map-gl** para los componentes de mapas interactivos del proyecto.

## Componentes Actualizados

### 1. InteractiveMap (`src/common/components/InteractiveMap.tsx`)
- **Nuevo componente base** para todos los mapas del proyecto
- Implementado con Deck.gl v9 y MapLibre
- Características:
  - ✅ Dibujo de polígonos (click para agregar puntos)
  - ✅ Selección de features
  - ✅ Edición de geometrías arrastrando vértices
  - ✅ Eliminación de features
  - ✅ Modos: `view`, `drawPolygon`, `modify`
  - ✅ UI con Shadcn/ui components
  - ✅ Tooltips y feedback visual
  - ✅ Drag & drop de vértices para edición

### 2. FieldsEditor (`src/modules/Fields/components/FieldsEditor.tsx`)
**ANTES**: Usaba Leaflet + EditControl  
**AHORA**: Usa InteractiveMap

- Removidas dependencias:
  - `react-leaflet`
  - `react-leaflet-draw`
  - `leaflet`
  - `useFieldLayerSync` hook
  - `useFieldsEditorState` hook
  
- Agregadas utilidades:
  - `fieldsToFeatureCollection()` - Convierte Fields → GeoJSON
  - `featureCollectionToFields()` - Convierte GeoJSON → Fields
  - `calculateCenter()` - Calcula centro del mapa

### 3. PlotsEditor (`src/modules/Plots/components/PlotsEditor.tsx`)
**ANTES**: Usaba Leaflet + EditControl  
**AHORA**: Usa InteractiveMap

- Removidas dependencias:
  - `react-leaflet`
  - `react-leaflet-draw`
  - `leaflet`
  - `usePlotLayerSync` hook
  - Funciones de colores locales
  
- Agregadas utilidades:
  - `plotsToFeatureCollection()` - Convierte Plots → GeoJSON
  - `featureCollectionToPlots()` - Convierte GeoJSON → Plots

- Características especiales:
  - Muestra el field boundary como referencia (no editable)
  - Solo las parcelas son editables

## Archivos de Utilidades Creados

### 1. `src/common/utils/field-map-utils.ts`
```typescript
fieldsToFeatureCollection(fields: Field[]): FeatureCollection
featureCollectionToFields(featureCollection: FeatureCollection, existingFields: Field[]): Field[]
```

### 2. `src/common/utils/plot-map-utils.ts`
```typescript
plotsToFeatureCollection(plots: Plot[]): FeatureCollection
featureCollectionToPlots(featureCollection: FeatureCollection, existingPlots: Plot[]): Plot[]
```

### 3. `src/common/utils/map-utils.ts` (actualizado)
```typescript
calculateCenter(featureCollection: FeatureCollection): { longitude, latitude, zoom }
```

## Ventajas de Deck.gl

1. **Performance**: WebGL rendering, mucho más rápido con datasets grandes
2. **3D Ready**: Preparado para visualizaciones 3D futuras
3. **Mejor TypeScript**: Tipado completo y mejor DX
4. **Componentes Modernos**: React hooks, estado manejado con useState/useCallback
5. **Personalización**: Mayor control sobre la UI y comportamiento
6. **Sin dependencias obsoletas**: nebula.gl fue removido por incompatibilidad

## Diferencias Clave

| Aspecto | Leaflet (antes) | Deck.gl (ahora) |
|---------|----------------|----------------|
| Rendering | Canvas 2D | WebGL |
| Draw Control | react-leaflet-draw | Implementación custom |
| Eventos | Leaflet events | Deck.gl events (onClick, onDrag, etc) |
| Edición | EditControl automático | Drag de vértices manual |
| Estado | Hooks personalizados complejos | useState/useCallback simples |
| Bundle size | ~200KB | ~150KB (con tree-shaking) |

## Funcionalidades Mantenidas

✅ Dibujar nuevos polígonos  
✅ Seleccionar polígonos existentes  
✅ Editar geometrías  
✅ Eliminar polígonos  
✅ Visualizar fields y plots  
✅ Integración con modales de edición (FieldDetailsSheet, PlotDetailsSheet, etc)

## Próximos Pasos Sugeridos

1. [ ] Agregar snapping entre vértices
2. [ ] Agregar medición de área en tiempo real mientras se dibuja
3. [ ] Agregar undo/redo para ediciones
4. [ ] Agregar importación/exportación de GeoJSON
5. [ ] Agregar validación de geometrías (auto-intersección, etc)
6. [ ] Implementar selección múltiple
7. [ ] Agregar capas de información (satélite, clima, etc)

## Dependencias Actualizadas

```json
{
  "@deck.gl/core": "^9.2.2",
  "@deck.gl/layers": "^9.2.2",
  "@deck.gl/react": "^9.2.2",
  "react-map-gl": "^8.1.0",
  "maplibre-gl": "^5.9.0"
}
```

## Dependencias Removidas

```json
{
  "@nebula.gl/edit-modes": "❌ Removido",
  "@nebula.gl/layers": "❌ Removido",
  "@nebula.gl/overlays": "❌ Removido",
  "react-leaflet": "⚠️ Puede removerse si no se usa en otra parte",
  "react-leaflet-draw": "⚠️ Puede removerse si no se usa en otra parte",
  "leaflet": "⚠️ Puede removerse si no se usa en otra parte",
  "leaflet-draw": "⚠️ Puede removerse si no se usa en otra parte"
}
```

## Notas Técnicas

- El drag de vértices se implementa usando `onDragStart`, `onDrag`, y `onDragEnd` de Deck.gl
- El pan del mapa se deshabilita automáticamente mientras se arrastra un vértice
- Los colores de los features se preservan al convertir entre formatos
- El área de los plots se recalcula automáticamente al editar geometrías
