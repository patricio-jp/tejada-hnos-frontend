# 🔄 Guía Rápida de Migración - InteractiveMap

## Para desarrolladores que ya usan InteractiveMap

---

## ⚡ TL;DR

Si ya estás usando `InteractiveMap`, estos son los cambios:

### ❌ Antes:
```typescript
<InteractiveMap
  initialData={data}
  onDataChange={handleChange}
/>
```

### ✅ Ahora:
```typescript
<InteractiveMap
  initialData={data}
  onDataChange={handleChange}
  onFeatureSelect={(feature, index) => {
    // ✨ Nuevo: Se ejecuta al seleccionar un polígono
    console.log('Seleccionado:', feature);
  }}
/>
```

**La prop `onFeatureSelect` es OPCIONAL**. Si no la usas, todo funciona igual que antes (pero con mejor UX).

---

## 📋 Cambios en los Modos

### Modo Eliminado:
- ❌ `modify` - Ya NO existe

### Modos Nuevos:
- ✅ `select` - Seleccionar polígonos
- ✅ `edit` - Editar vértices

### Lo que NO cambia:
- ✅ `view` - Sigue igual
- ✅ `drawPolygon` - Sigue igual

---

## 🔧 Cambios en la UI

### Botón Eliminado:
```typescript
// ❌ Este botón ya NO existe
<Button>Seleccionar/Editar</Button>
```

### Botones Nuevos:
```typescript
// ✅ Ahora son dos botones separados
<Button>Seleccionar</Button>        // Modo: select
<Button>Editar Vértices</Button>     // Modo: edit
```

---

## 📝 Cómo Migrar tu Código

### Paso 1: Agregar el callback (opcional pero recomendado)

```typescript
// Antes
export function MyEditor() {
  const [data, setData] = useState<FeatureCollection>({...});
  
  return (
    <InteractiveMap
      initialData={data}
      onDataChange={setData}
    />
  );
}

// Después
export function MyEditor() {
  const [data, setData] = useState<FeatureCollection>({...});
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  
  return (
    <InteractiveMap
      initialData={data}
      onDataChange={setData}
      onFeatureSelect={(feature, index) => {
        setSelectedFeature(feature);
        // Aquí puedes hacer lo que quieras
      }}
    />
  );
}
```

### Paso 2: Aprovechar la selección

```typescript
// Ejemplo: Abrir un panel al seleccionar
const handleFeatureSelect = (feature: Feature | null, index: number | null) => {
  if (feature) {
    // Abrir modal/sheet/panel con detalles
    setDetailsOpen(true);
    setSelectedData(feature.properties);
  } else {
    setDetailsOpen(false);
  }
};
```

---

## 🎯 Casos Comunes de Migración

### Caso 1: Solo quiero que funcione (cambios mínimos)

```typescript
// No cambies nada, sigue funcionando
<InteractiveMap
  initialData={data}
  onDataChange={handleChange}
  editable={true}
/>
```

**Resultado**: El mapa funciona igual, pero ahora el usuario tiene que:
1. Clic en "Seleccionar"
2. Clic en polígono
3. Clic en "Editar Vértices"
4. Editar

---

### Caso 2: Quiero abrir un panel al seleccionar

```typescript
const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

return (
  <>
    <InteractiveMap
      initialData={data}
      onDataChange={handleChange}
      onFeatureSelect={(feature) => setSelectedFeature(feature)}
    />
    
    {selectedFeature && (
      <Sheet open onClose={() => setSelectedFeature(null)}>
        <h2>{selectedFeature.properties.name}</h2>
        {/* Más detalles... */}
      </Sheet>
    )}
  </>
);
```

---

### Caso 3: Tengo una lista sincronizada

```typescript
const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

const handleFeatureSelect = (feature: Feature | null, index: number | null) => {
  setSelectedIndex(index);
  
  // Scroll a la lista
  if (index !== null) {
    document.getElementById(`item-${index}`)?.scrollIntoView({
      behavior: 'smooth'
    });
  }
};

return (
  <div className="grid grid-cols-2 gap-4">
    <InteractiveMap
      initialData={data}
      onFeatureSelect={handleFeatureSelect}
    />
    
    <div>
      {data.features.map((feature, index) => (
        <div
          key={index}
          id={`item-${index}`}
          className={selectedIndex === index ? 'bg-blue-100' : ''}
          onClick={() => {
            setSelectedIndex(index);
            // Opcional: zoom al feature en el mapa
          }}
        >
          {feature.properties.name}
        </div>
      ))}
    </div>
  </div>
);
```

---

### Caso 4: Necesito validar permisos

```typescript
const handleFeatureSelect = (feature: Feature | null, index: number | null) => {
  if (!feature) return;
  
  // Verificar permisos
  const canEdit = checkUserPermission(feature.id);
  
  if (!canEdit) {
    alert('No puedes editar este elemento');
    // El usuario puede ver pero no editar
    setEditable(false);
  } else {
    setEditable(true);
  }
};

return (
  <InteractiveMap
    initialData={data}
    onFeatureSelect={handleFeatureSelect}
    editable={editable} // Dinámica según permisos
  />
);
```

---

## ⚠️ Breaking Changes (Afectan solo si personalizaste el componente)

### 1. Cambio de Modo `modify` → `select` + `edit`

```typescript
// ❌ Esto ya NO funciona
if (mode === 'modify') { ... }

// ✅ Ahora es
if (mode === 'select') { ... }
// o
if (mode === 'edit') { ... }
```

### 2. Tipo de Mode actualizado

```typescript
// Antes
type Mode = 'view' | 'drawPolygon' | 'modify';

// Ahora
type Mode = 'view' | 'drawPolygon' | 'select' | 'edit';
```

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "El botón Seleccionar/Editar desapareció"

**Causa**: El botón se dividió en dos.  
**Solución**: Usa "Seleccionar" primero, luego "Editar Vértices".

---

### Problema 2: "Los vértices no aparecen al seleccionar"

**Causa**: Ahora son dos pasos separados.  
**Solución**: 
1. Modo "Seleccionar" + clic en polígono (sin vértices)
2. Clic en "Editar Vértices" (aparecen vértices)

---

### Problema 3: "Mi handler `onDataChange` no se ejecuta"

**Causa**: Probablemente estás en modo `select` en vez de `edit`.  
**Solución**: 
- `onDataChange` se ejecuta al crear, editar o eliminar
- Solo se puede editar en modo `edit`
- Seleccionar NO modifica datos

---

### Problema 4: "Quiero el comportamiento anterior (vértices inmediatos)"

**Solución 1** (Recomendada): Acostúmbrate al nuevo flujo de 2 pasos.

**Solución 2** (Workaround): Cambiar a modo `edit` automáticamente al seleccionar:

```typescript
const handleFeatureSelect = (feature: Feature | null, index: number | null) => {
  if (feature) {
    // Auto-cambiar a modo edit
    setMode('edit');
  }
};
```

⚠️ **Nota**: Esto pierde los beneficios del nuevo flujo.

---

## ✅ Checklist de Migración

- [ ] Revisar si uso `mode === 'modify'` en mi código
- [ ] Decidir si quiero usar `onFeatureSelect`
- [ ] Actualizar tests si mockeo los modos
- [ ] Informar a usuarios sobre el nuevo flujo de 2 pasos
- [ ] Aprovechar `onFeatureSelect` para mejorar UX

---

## 📚 Documentación Completa

- **Guía de Modos**: `docs/InteractiveMap-modos.md`
- **Ejemplos de Uso**: `docs/ejemplos-onFeatureSelect.tsx`
- **Resumen de Mejoras**: `docs/mejoras-interactivemap.md`

---

## 💬 Preguntas Frecuentes

### ¿Es obligatorio usar `onFeatureSelect`?
**No**, es opcional. Si no lo usas, el mapa funciona igual pero sin ejecutar acciones al seleccionar.

### ¿Por qué se separó en dos pasos?
**Para mejor UX**: Ahora el usuario puede seleccionar sin entrar a edición, ver detalles, y solo editar cuando lo necesite.

### ¿Afecta el rendimiento?
**No**, el rendimiento es el mismo o mejor.

### ¿Puedo volver al comportamiento anterior?
**Técnicamente sí** (ver Problema 4 arriba), pero **no es recomendado**.

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas durante la migración:

1. Revisa los ejemplos en `docs/ejemplos-onFeatureSelect.tsx`
2. Verifica que estés usando los modos correctos
3. Consulta la documentación completa
4. Pregunta al equipo

---

**Fecha de migración sugerida**: Lo antes posible  
**Dificultad**: 🟢 Baja (cambios mínimos requeridos)  
**Tiempo estimado**: 5-15 minutos por componente  

🚀 ¡Buena suerte con la migración!
