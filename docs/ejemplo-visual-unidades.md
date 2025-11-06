# Ejemplo Visual: Unidades de Insumos

## Vista del formulario de orden de compra

### Antes (sin unidades claras)
```
┌─────────────────────────────────────┐
│ Insumo *                            │
│ ┌─────────────────────────────────┐ │
│ │ Fertilizante NPK            ▼   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Cantidad *                          │
│ ┌─────────────────────────────────┐ │
│ │ 250                             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
❌ **Problema:** Usuario no sabe si son 250 kg, litros o unidades

### Después (con unidades visibles)
```
┌─────────────────────────────────────┐
│ Insumo *                            │
│ ┌─────────────────────────────────┐ │
│ │ Fertilizante NPK (KG)       ▼   │ │ ← Unidad en el select
│ └─────────────────────────────────┘ │
│                                     │
│ Cantidad * (KG)                     │ ← Unidad en el label
│ ┌─────────────────────────────────┐ │
│ │ Cantidad en KG              250 │ │ ← Unidad en placeholder
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
✅ **Solución:** Usuario ve claramente que debe ingresar 250 KG

## Vista de lista de opciones

```
┌──────────────────────────────────────────┐
│ Insumo *                            ▼    │
├──────────────────────────────────────────┤
│ Seleccione un insumo                     │
│ Fertilizante NPK (KG)                    │ ← Claro
│ Herbicida Glifosato (LITRO)              │ ← Claro
│ Trampa para moscas (UNIDAD)              │ ← Claro
│ Guantes de trabajo (UNIDAD)              │ ← Claro
│ Abono orgánico (KG)                      │ ← Claro
└──────────────────────────────────────────┘
```

## Vista de detalles de orden

```
╔═══════════════════════════════════════════════════╗
║ Orden de Compra #OC-2025-001                      ║
╠═══════════════════════════════════════════════════╣
║ Insumos solicitados                               ║
║                                                   ║
║ ┌───────────────────────────────────────────────┐ ║
║ │ Fertilizante NPK               250 KG         │ ║
║ │ Unidad: KG                    ↑               │ ║
║ │                               Unidad visible  │ ║
║ └───────────────────────────────────────────────┘ ║
║                                                   ║
║ ┌───────────────────────────────────────────────┐ ║
║ │ Herbicida Glifosato            50 LITRO       │ ║
║ │ Unidad: LITRO                 ↑               │ ║
║ │                               Unidad visible  │ ║
║ └───────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════╝
```

## Vista de recepción de mercancía

```
╔════════════════════════════════════════════════════════╗
║ Recibir mercancía - Orden #OC-2025-001                ║
╠════════════════════════════════════════════════════════╣
║ ┌────────────────────────────────────────────────────┐ ║
║ │ Fertilizante NPK                                   │ ║
║ │ Solicitado: 250 KG        ← Unidad visible        │ ║
║ │ Ya recibido: 0 KG         ← Unidad visible        │ ║
║ │ Pendiente: 250 KG         ← Unidad visible        │ ║
║ │                                                    │ ║
║ │ Cantidad a recibir: [     250     ] KG ←          │ ║
║ │                                     Sufijo claro  │ ║
║ └────────────────────────────────────────────────────┘ ║
║                                                        ║
║ ┌────────────────────────────────────────────────────┐ ║
║ │ Herbicida Glifosato                                │ ║
║ │ Solicitado: 50 LITRO      ← Unidad visible        │ ║
║ │ Ya recibido: 0 LITRO      ← Unidad visible        │ ║
║ │ Pendiente: 50 LITRO       ← Unidad visible        │ ║
║ │                                                    │ ║
║ │ Cantidad a recibir: [      50     ] LITRO ←       │ ║
║ │                                     Sufijo claro  │ ║
║ └────────────────────────────────────────────────────┘ ║
╚════════════════════════════════════════════════════════╝
```

## Casos de uso reales

### ✅ Caso 1: Fertilizante en kilogramos
```
Insumo: "Fertilizante NPK (KG)"
Cantidad: 250 (KG)
Recibido: 250 KG
```
**Interpretación clara:** Se recibieron 250 kilogramos

### ✅ Caso 2: Herbicida en litros
```
Insumo: "Herbicida Glifosato (LITRO)"
Cantidad: 50 (LITRO)
Recibido: 50 LITRO
```
**Interpretación clara:** Se recibieron 50 litros

### ✅ Caso 3: Herramientas por unidad
```
Insumo: "Guantes de trabajo (UNIDAD)"
Cantidad: 100 (UNIDAD)
Recibido: 100 UNIDAD
```
**Interpretación clara:** Se recibieron 100 unidades (pares de guantes)

## Ventajas UX

1. **Contexto inmediato:** Usuario ve la unidad antes de ingresar cantidad
2. **Prevención de errores:** Imposible confundir KG con LITRO
3. **Confirmación visual:** Múltiples puntos muestran la misma unidad
4. **Consistencia:** La misma unidad aparece en todos los componentes
5. **Profesionalismo:** Interfaz clara y sin ambigüedades

## Comparación con otros sistemas

### Sistema básico ❌
```
Producto: [Fertilizante NPK     ▼]
Cantidad: [250                   ]
```
Problema: ¿250 qué?

### Sistema intermedio ⚠️
```
Producto: [Fertilizante NPK     ▼]
Cantidad: [250                   ]
Unidad:   [KG                   ▼]
```
Problema: Usuario debe seleccionar manualmente (error humano)

### Nuestro sistema ✅
```
Producto: [Fertilizante NPK (KG)▼]
Cantidad: [Cantidad en KG     250] (KG)
```
Solución: Unidad automática, múltiples confirmaciones visuales
