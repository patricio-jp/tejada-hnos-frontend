# Guía Rápida - Módulo de Órdenes de Compra

## 🚀 Inicio Rápido

### 1. Configuración Inicial

Asegúrate de que tu archivo `.env` tenga la URL de la API:

```env
VITE_API_URL=http://localhost:3000/api
```

### 2. Navega al Módulo

Una vez iniciada sesión, accede al módulo desde el sidebar:
- **Purchase Orders** → **Orders List**

O directamente desde la URL: `http://localhost:5173/purchases`

### 3. Crear tu Primera Orden

1. Click en **"Nueva Orden"** (botón superior derecho o desde el menú)
2. Selecciona un **Proveedor** del dropdown
3. Click en **"Agregar Insumo"** para añadir items
4. Para cada insumo:
   - Selecciona el insumo del dropdown
   - Ingresa la cantidad
   - Opcionalmente agrega notas
5. Opcionalmente agrega fecha estimada de entrega y notas generales
6. Click en **"Crear Orden"**

### 4. Ver Detalles de una Orden

- Click en el ícono de **ojo** en cualquier tarjeta de orden
- Se abrirá un panel lateral con toda la información

### 5. Editar una Orden (solo PENDIENTE)

- Click en el ícono de **lápiz** en una orden PENDIENTE
- Modifica los campos necesarios
- Click en **"Actualizar Orden"**

### 6. Recibir Mercancía (APROBADA o RECIBIDA_PARCIAL)

1. Click en el ícono de **paquete** en una orden aprobada
2. Se abrirá un diálogo de recepción
3. Ingresa la **fecha de recepción**
4. Para cada insumo, ingresa la **cantidad recibida**
   - El sistema muestra cuánto se solicitó y cuánto falta
   - No puedes recibir más de lo solicitado
5. Opcionalmente agrega **notas de recepción**
6. Click en **"Registrar recepción"**

### 7. Eliminar una Orden (solo PENDIENTE)

1. Click en el ícono de **papelera** en una orden PENDIENTE
2. Confirma la eliminación en el diálogo
3. La orden se eliminará permanentemente

---

## 🔍 Búsqueda y Filtros

### Búsqueda
Escribe en el campo de búsqueda para filtrar por:
- Código de orden
- Nombre del proveedor
- ID de la orden

### Filtro por Estado
Usa el dropdown para ver solo órdenes en un estado específico:
- **Todos los estados** (por defecto)
- Pendiente
- Aprobada
- Recibida Parcialmente
- Recibida
- Cerrada
- Cancelada

---

## 📊 Estados y Flujo

```
┌─────────────┐
│  PENDIENTE  │ ← Estado inicial al crear
└──────┬──────┘
       │ (Admin aprueba en backend)
       ↓
┌─────────────┐
│  APROBADA   │ ← Puede recibir mercancía
└──────┬──────┘
       │ (Recepción parcial)
       ↓
┌─────────────┐
│ RECIBIDA    │ ← Puede seguir recibiendo
│  PARCIAL    │
└──────┬──────┘
       │ (Recepción total)
       ↓
┌─────────────┐
│  RECIBIDA   │ ← Todo recibido
└──────┬──────┘
       │ (Cierre administrativo)
       ↓
┌─────────────┐
│   CERRADA   │ ← Estado final
└─────────────┘
```

En cualquier momento se puede marcar como **CANCELADA**.

---

## ⚡ Atajos y Tips

### Acciones Rápidas desde Tarjetas
- **👁️ Ver**: Ver todos los detalles
- **✏️ Editar**: Solo en PENDIENTE
- **🗑️ Eliminar**: Solo en PENDIENTE
- **📦 Recibir**: Solo en APROBADA o RECIBIDA_PARCIAL

### Validaciones Automáticas
- ✅ No puedes recibir más cantidad de la solicitada
- ✅ No puedes editar órdenes que no estén PENDIENTES
- ✅ No puedes eliminar órdenes que no estén PENDIENTES
- ✅ Debes agregar al menos un insumo para crear una orden

### Colores de Estado
- 🔵 **PENDIENTE**: Gris secundario
- 🟢 **APROBADA**: Azul (default)
- 🟡 **RECIBIDA_PARCIAL**: Outline
- 🟢 **RECIBIDA**: Azul (default)
- 🔵 **CERRADA**: Gris secundario
- 🔴 **CANCELADA**: Rojo (destructive)

---

## 🐛 Solución de Problemas

### "No se cargan las órdenes"
- ✅ Verifica que el servidor esté corriendo
- ✅ Verifica la variable `VITE_API_URL`
- ✅ Verifica que estés autenticado (token válido)
- ✅ Click en el botón de **refrescar**

### "Error al crear orden"
- ✅ Verifica que seleccionaste un proveedor
- ✅ Verifica que agregaste al menos un insumo
- ✅ Verifica que las cantidades sean mayores a 0
- ✅ Revisa la consola del navegador para más detalles

### "No puedo editar una orden"
- ✅ Solo se pueden editar órdenes en estado PENDIENTE
- ✅ Una vez aprobada, la orden no se puede modificar

### "Error al recibir mercancía"
- ✅ Verifica que la orden esté APROBADA o RECIBIDA_PARCIAL
- ✅ Verifica que las cantidades no excedan lo solicitado
- ✅ Ingresa al menos una cantidad mayor a 0

---

## 📞 Contacto y Soporte

Si encuentras algún problema o tienes sugerencias:
1. Revisa la documentación completa en `src/modules/Purchases/README.md`
2. Revisa los ejemplos en `src/modules/Purchases/EXAMPLES.md`
3. Contacta al equipo de desarrollo

---

## 🎯 Próximamente

- [ ] Aprobación de órdenes desde el frontend
- [ ] Cancelación de órdenes
- [ ] Exportar órdenes a PDF
- [ ] Notificaciones de órdenes pendientes
- [ ] Dashboard de estadísticas
- [ ] Adjuntar archivos a órdenes
- [ ] Vista de tabla (alternativa a tarjetas)

---

**¡Listo!** Ya puedes empezar a usar el módulo de Órdenes de Compra 🎉
