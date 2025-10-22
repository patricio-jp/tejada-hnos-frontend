# 🎨 Parametrización de InteractiveMap - Modos y Colores

## Resumen de Cambios

Se ha parametrizado el componente `InteractiveMap` para permitir:
1. ✅ **Configurar modos disponibles** - Mostrar solo los botones que necesites
2. ✅ **Modo por defecto** - Establecer el modo inicial del mapa
3. ✅ **Colores personalizados** - Asignar colores específicos a cada polígono

---

## 📋 Nuevas Props de InteractiveMap

### 1. `availableModes?: Mode[]`

**Descripción**: Array de modos que estarán disponibles en la UI.

**Tipo**: `('view' | 'drawPolygon' | 'select' | 'edit')[]`

**Por defecto**: `['view', 'drawPolygon', 'select', 'edit']` (todos)

**Ejemplo**:
```typescript
// Solo permitir visualización y selección
<InteractiveMap
  availableModes={['view', 'select']}
  {...otherProps}
/>

// Solo dibujo y edición
<InteractiveMap
  availableModes={['view', 'drawPolygon', 'edit']}
  {...otherProps}
/>
```

**Casos de uso**:
- **Modo solo lectura**: `['view']` - Solo ver el mapa
- **Modo básico**: `['view', 'select']` - Ver y seleccionar
- **Modo completo**: `['view', 'drawPolygon', 'select', 'edit']` - Todas las funciones

---

### 2. `defaultMode?: Mode`

**Descripción**: Modo inicial al cargar el mapa.

**Tipo**: `'view' | 'drawPolygon' | 'select' | 'edit'`

**Por defecto**: `'view'`

**Ejemplo**:
```typescript
// Iniciar en modo selección
<InteractiveMap
  defaultMode="select"
  {...otherProps}
/>

// Iniciar listo para dibujar
<InteractiveMap
  defaultMode="drawPolygon"
  {...otherProps}
/>
```

**Casos de uso**:
- Iniciar en modo `select` cuando hay datos precargados
- Iniciar en `drawPolygon` cuando el usuario debe crear su primer polígono
- Mantener `view` como predeterminado para exploración

---

### 3. `getPolygonColor?: (feature: Feature, isSelected: boolean) => [number, number, number, number]`

**Descripción**: Función que retorna el color RGBA de cada polígono.

**Tipo**: `(feature: Feature, isSelected: boolean) => [R, G, B, A]`

**Por defecto**: `undefined` (usa colores predeterminados azul/rojo)

**Parámetros**:
- `feature`: El feature GeoJSON del polígono
- `isSelected`: `true` si el polígono está seleccionado

**Retorno**: Array `[R, G, B, A]` donde cada valor es 0-255

**Ejemplo básico**:
```typescript
const getPolygonColor = (feature: Feature, isSelected: boolean) => {
  if (isSelected) {
    return [255, 100, 100, 120]; // Rojo semi-transparente
  }
  
  // Si el feature tiene color personalizado
  if (feature.properties?.color) {
    return hexToRGBA(feature.properties.color, 100);
  }
  
  // Color por defecto
  return [0, 100, 255, 100]; // Azul
};

<InteractiveMap
  getPolygonColor={getPolygonColor}
  {...otherProps}
/>
```

**Ejemplo avanzado** (colores por tipo):
```typescript
const getPolygonColor = (feature: Feature, isSelected: boolean) => {
  if (isSelected) return [255, 100, 100, 120];
  
  const type = feature.properties?.type;
  
  switch (type) {
    case 'field':
      return hexToRGBA('#00C853', 100); // Verde
    case 'plot':
      return hexToRGBA('#FFD600', 100); // Amarillo
    case 'zone':
      return hexToRGBA('#AA00FF', 100); // Púrpura
    default:
      return [0, 100, 255, 100]; // Azul
  }
};
```

---

## 🎨 Utilidades de Color

Se ha creado el archivo `src/common/utils/color-utils.ts` con funciones helper:

### `hexToRGBA(hex: string, alpha?: number): [number, number, number, number]`

Convierte un color hex a RGBA para deck.gl.

**Parámetros**:
- `hex`: Color en formato `#RRGGBB` o `#RGB`
- `alpha`: Opacidad 0-255 (por defecto 100)

**Ejemplo**:
```typescript
import { hexToRGBA } from '@/common/utils/color-utils';

hexToRGBA('#FF0000', 100);  // [255, 0, 0, 100] - Rojo
hexToRGBA('#0F0', 200);     // [0, 255, 0, 200] - Verde
hexToRGBA('#00F');          // [0, 0, 255, 100] - Azul
```

---

### `rgbaToHex(rgba: [number, number, number, number]): string`

Convierte RGBA a hex (útil para guardar en BD).

**Ejemplo**:
```typescript
import { rgbaToHex } from '@/common/utils/color-utils';

rgbaToHex([255, 0, 0, 100]);  // '#FF0000'
rgbaToHex([0, 255, 0, 200]);  // '#00FF00'
```

---

### `PRESET_COLORS`

Colores predefinidos listos para usar:

```typescript
import { PRESET_COLORS } from '@/common/utils/color-utils';

PRESET_COLORS.blue     // '#0064FF'
PRESET_COLORS.green    // '#00C853'
PRESET_COLORS.yellow   // '#FFD600'
PRESET_COLORS.orange   // '#FF6D00'
PRESET_COLORS.red      // '#D50000'
PRESET_COLORS.purple   // '#AA00FF'
PRESET_COLORS.pink     // '#E91E63'
PRESET_COLORS.teal     // '#00BFA5'
PRESET_COLORS.brown    // '#795548'
PRESET_COLORS.gray     // '#757575'
```

---

## 💡 Ejemplos de Uso Completos

### Ejemplo 1: FieldsEditor con Colores Personalizados

```typescript
import { hexToRGBA } from '@/common/utils/color-utils';

export function FieldsEditor({ fields, onFieldsChange }: FieldsEditorProps) {
  // ... estado y handlers ...

  const getFieldColor = useCallback((feature: Feature, isSelected: boolean) => {
    if (isSelected) {
      return [255, 100, 100, 120]; // Rojo al seleccionar
    }
    
    // Usar color del campo si existe
    if (feature.properties?.color) {
      return hexToRGBA(feature.properties.color, 100);
    }
    
    // Color por defecto
    return [0, 100, 255, 100];
  }, []);

  return (
    <InteractiveMap
      initialData={mapData}
      onDataChange={handleMapDataChange}
      onFeatureSelect={handleFeatureSelect}
      getPolygonColor={getFieldColor}  // ⭐ Color personalizado
      editable={true}
      initialViewState={initialViewState}
    />
  );
}
```

---

### Ejemplo 2: PlotsEditor con Modos Limitados

```typescript
export function PlotsEditor({ field }: PlotsEditorProps) {
  // ... estado y handlers ...

  const getPlotColor = useCallback((feature: Feature, isSelected: boolean) => {
    // Field boundary transparente
    if (feature.properties?.isFieldBoundary) {
      return [0, 0, 0, 0];
    }
    
    if (isSelected) {
      return [255, 100, 100, 120];
    }
    
    // Color personalizado de la parcela
    if (feature.properties?.color) {
      return hexToRGBA(feature.properties.color, 100);
    }
    
    return [0, 100, 255, 100];
  }, []);

  return (
    <InteractiveMap
      initialData={combinedData}
      onDataChange={handleMapDataChange}
      onFeatureSelect={handleFeatureSelect}
      getPolygonColor={getPlotColor}
      availableModes={['view', 'drawPolygon', 'select', 'edit']}  // ⭐ Todos los modos
      defaultMode="view"  // ⭐ Iniciar en modo vista
      editable={true}
      initialViewState={initialViewState}
    />
  );
}
```

---

### Ejemplo 3: Mapa de Solo Lectura

```typescript
<InteractiveMap
  initialData={data}
  availableModes={['view']}  // ⭐ Solo modo vista
  defaultMode="view"
  editable={false}
  initialViewState={viewState}
/>
```

---

### Ejemplo 4: Selector de Parcelas (sin edición)

```typescript
<InteractiveMap
  initialData={plots}
  onFeatureSelect={handleSelect}
  availableModes={['view', 'select']}  // ⭐ Solo ver y seleccionar
  defaultMode="select"  // ⭐ Listo para seleccionar
  editable={false}
  initialViewState={viewState}
/>
```

---

### Ejemplo 5: Modo Dibujo Directo

```typescript
<InteractiveMap
  initialData={emptyCollection}
  onDataChange={handleNewPolygon}
  availableModes={['drawPolygon', 'view']}  // ⭐ Solo dibujar
  defaultMode="drawPolygon"  // ⭐ Listo para dibujar
  editable={true}
  initialViewState={viewState}
/>
```

---

## 🎨 Integración con Base de Datos

### Guardar Color en Properties

```typescript
// Al crear o editar un campo/parcela
const field: Field = {
  id: '123',
  boundary: {
    type: 'Feature',
    geometry: { /* ... */ },
    properties: {
      name: 'Campo Norte',
      color: '#00C853',  // ⭐ Guardar color hex
      area: 125.5,
      // ... otras propiedades
    }
  },
  plots: []
};
```

### Leer Color desde Properties

```typescript
const getPolygonColor = (feature: Feature, isSelected: boolean) => {
  if (isSelected) return [255, 100, 100, 120];
  
  // Leer desde properties
  const hexColor = feature.properties?.color;
  if (hexColor) {
    return hexToRGBA(hexColor, 100);
  }
  
  return [0, 100, 255, 100];
};
```

---

## 📊 Comparación: Antes vs Ahora

### Antes (No Parametrizable)

```typescript
// ❌ Siempre los mismos modos
// ❌ Siempre color azul/rojo
// ❌ Siempre inicia en 'view'

<InteractiveMap
  initialData={data}
  onDataChange={handleChange}
/>
```

### Ahora (Totalmente Parametrizable)

```typescript
// ✅ Modos personalizables
// ✅ Colores por polígono
// ✅ Modo inicial configurable

<InteractiveMap
  initialData={data}
  onDataChange={handleChange}
  availableModes={['view', 'select', 'edit']}
  defaultMode="select"
  getPolygonColor={(f, s) => hexToRGBA(f.properties.color || '#0064FF', 100)}
/>
```

---

## 🔧 Estructura de Colores en deck.gl

### Formato RGBA

```typescript
type RGBAColor = [
  number,  // Red (0-255)
  number,  // Green (0-255)
  number,  // Blue (0-255)
  number   // Alpha/Opacity (0-255)
];
```

### Ejemplos de Colores

```typescript
// Colores sólidos
[255, 0, 0, 255]      // Rojo opaco
[0, 255, 0, 255]      // Verde opaco
[0, 0, 255, 255]      // Azul opaco

// Colores semi-transparentes
[255, 0, 0, 100]      // Rojo semi-transparente
[0, 255, 0, 120]      // Verde semi-transparente
[0, 0, 255, 80]       // Azul muy transparente

// Colores especiales
[0, 0, 0, 0]          // Totalmente transparente (invisible)
[128, 128, 128, 150]  // Gris semi-transparente
```

---

## ✅ Checklist de Implementación

- [x] Agregar props `availableModes`, `defaultMode`, `getPolygonColor` a InteractiveMap
- [x] Crear función `isModeAvailable` para filtrar botones
- [x] Actualizar renderizado de botones con condicionales
- [x] Modificar `polygonLayer` para usar `getPolygonColor`
- [x] Crear `color-utils.ts` con funciones helper
- [x] Implementar `getFieldColor` en FieldsEditor
- [x] Implementar `getPlotColor` en PlotsEditor
- [x] Agregar ejemplo de uso de `availableModes` en PlotsEditor
- [x] Probar compilación
- [x] Crear documentación

---

## 📁 Archivos Modificados

1. **`src/common/components/InteractiveMap.tsx`**
   - Nuevas props: `availableModes`, `defaultMode`, `getPolygonColor`
   - Función `isModeAvailable` para filtrar modos
   - Renderizado condicional de botones
   - `polygonLayer` usa `getPolygonColor`

2. **`src/common/utils/color-utils.ts`** ⭐ NUEVO
   - `hexToRGBA()` - Conversión hex a RGBA
   - `rgbaToHex()` - Conversión RGBA a hex
   - `PRESET_COLORS` - Colores predefinidos

3. **`src/modules/Fields/components/FieldsEditor.tsx`**
   - Importa `hexToRGBA`
   - Implementa `getFieldColor`
   - Pasa `getPolygonColor` a InteractiveMap

4. **`src/modules/Plots/components/PlotsEditor.tsx`**
   - Importa `hexToRGBA`
   - Implementa `getPlotColor`
   - Usa `availableModes` y `defaultMode`
   - Pasa `getPolygonColor` a InteractiveMap

---

## 🚀 Próximos Pasos Sugeridos

### UI para Selector de Color
```typescript
// Agregar color picker en FieldDetailsSheet
<ColorPicker
  value={field.boundary.properties?.color || '#0064FF'}
  onChange={(color) => {
    updateField({
      ...field,
      boundary: {
        ...field.boundary,
        properties: {
          ...field.boundary.properties,
          color: color
        }
      }
    });
  }}
/>
```

### Paleta de Colores Predefinida
```typescript
// Mostrar paleta de colores comunes
{Object.entries(PRESET_COLORS).map(([name, hex]) => (
  <button
    key={name}
    style={{ backgroundColor: hex }}
    onClick={() => setColor(hex)}
  >
    {name}
  </button>
))}
```

### Guardar en Backend
```typescript
// Al guardar campo/parcela
const payload = {
  id: field.id,
  name: field.boundary.properties.name,
  color: field.boundary.properties.color,  // ⭐ Incluir color
  geometry: field.boundary.geometry
};

await api.post('/fields', payload);
```

---

**Fecha**: 21 de octubre de 2025  
**Estado**: ✅ Completado y funcionando  
**Build**: ✅ Sin errores  

🎉 ¡InteractiveMap ahora es completamente parametrizable!
