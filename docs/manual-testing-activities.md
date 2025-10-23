# Manual de Pruebas - Módulo de Actividades

## Pre-requisitos
1. Backend corriendo en `http://localhost:3000`
2. Endpoint `/api/activity-logs` disponible
3. Frontend corriendo (Electron o Web)

## 1. Prueba de Carga de Actividades (GET)

### Pasos:
1. Abrir la aplicación
2. Navegar al Dashboard de Actividades
3. Observar el "Feed de Actividad Reciente"

### Resultado esperado:
- ✅ Se cargan las actividades desde el backend
- ✅ Se muestran las 5 actividades más recientes
- ✅ Las actividades están ordenadas por fecha de creación (más reciente primero)
- ✅ Si hay error, se muestra mensaje de error
- ✅ Si no hay actividades, se muestra mensaje "No hay actividades recientes"
- ✅ Mientras carga, se muestra skeleton de carga

### Verificación en consola:
```javascript
// Abrir DevTools (F12) y verificar:
// 1. No hay errores en la consola
// 2. La petición a /api/activity-logs fue exitosa
```

---

## 2. Prueba de Creación de Actividad (POST)

### Pasos:
1. Click en botón "Nueva Actividad"
2. Llenar el formulario:
   - **Tipo**: Seleccionar un tipo (ej: "Riego")
   - **Descripción**: Escribir descripción detallada
   - **Parcela**: Ingresar ID de parcela
   - **Fecha de Ejecución**: Seleccionar una fecha
3. Click en "Crear Actividad"

### Resultado esperado:
- ✅ El diálogo se cierra automáticamente
- ✅ La nueva actividad aparece en la lista/feed
- ✅ La actividad tiene estado "pendiente"
- ✅ Se muestra en la parte superior de la lista
- ✅ No hay errores en consola

### Casos de error a probar:
- ❌ Intentar guardar con campos vacíos → Debe mostrar "complete todos los campos requeridos"
- ❌ Error del servidor → Debe mostrar "Ocurrió un error al crear la actividad"

---

## 3. Prueba de Edición de Actividad (PATCH)

### Pasos:
1. En la lista de actividades, hacer click en "Editar" de una actividad existente
2. Modificar algún campo (ej: descripción)
3. Click en "Guardar Cambios"

### Resultado esperado:
- ✅ El diálogo se cierra
- ✅ La actividad se actualiza en la lista
- ✅ Los cambios son visibles inmediatamente
- ✅ Se mantiene en la misma posición de la lista

---

## 4. Prueba de Eliminación de Actividad (DELETE)

### Pasos:
1. En la lista de actividades, hacer click en "Eliminar" de una actividad
2. Confirmar la eliminación (si hay confirmación)

### Resultado esperado:
- ✅ La actividad desaparece de la lista
- ✅ El contador de actividades se actualiza
- ✅ No hay errores en consola

---

## 5. Prueba de Filtros

### Pasos:
1. Click en botón "Filtros"
2. Seleccionar un tipo de actividad (ej: "Riego")
3. Verificar que solo se muestran actividades de ese tipo
4. Cambiar el estado a "completada"
5. Verificar que solo se muestran actividades completadas

### Resultado esperado:
- ✅ Los filtros se aplican correctamente
- ✅ El contador de resultados es correcto
- ✅ Al limpiar filtros, se muestran todas las actividades

---

## 6. Prueba de Manejo de Errores

### 6.1 Backend No Disponible
1. Detener el backend
2. Recargar la aplicación

**Esperado**: 
- ✅ Mensaje de error: "Error al cargar las actividades"
- ✅ No se rompe la aplicación

### 6.2 Error de Red
1. Desconectar internet (o usar DevTools Network throttling)
2. Intentar crear una actividad

**Esperado**:
- ✅ Mensaje de error apropiado
- ✅ La aplicación no se congela

---

## 7. Prueba de Estados de Carga

### Pasos:
1. Abrir DevTools → Network
2. Agregar throttling "Slow 3G"
3. Recargar la página

### Resultado esperado:
- ✅ Se muestra skeleton de carga mientras se obtienen las actividades
- ✅ El botón de "Crear Actividad" está deshabilitado durante la carga
- ✅ Después de cargar, se habilitan todos los controles

---

## Checklist de Integración Completa

- [ ] GET /api/activity-logs funciona correctamente
- [ ] POST /api/activity-logs crea nuevas actividades
- [ ] PATCH /api/activity-logs/:id actualiza actividades
- [ ] DELETE /api/activity-logs/:id elimina actividades
- [ ] El feed muestra actividades reales (no mock data)
- [ ] Los formularios validan correctamente
- [ ] Los errores se manejan apropiadamente
- [ ] Los estados de carga son visibles
- [ ] La UI se actualiza automáticamente después de cada operación
- [ ] No hay errores en la consola del navegador
- [ ] No hay warnings de React en la consola

---

## Herramientas de Verificación

### Verificar peticiones en DevTools:
```javascript
// En la consola del navegador
// Verificar que window.api está disponible:
window.api

// Probar manualmente:
await window.api.getActivityLogs()
```

### Verificar estado del hook:
```javascript
// En el componente, agregar temporalmente:
console.log('Activities:', activities);
console.log('Loading:', loading);
console.log('Error:', error);
```
