# Mejoras en visualización de unidades de insumos

## Resumen

Se actualizó el módulo de Órdenes de Compra para mostrar claramente las unidades de medida de los insumos en todas las vistas y formularios, alineándose con la estructura de entidades del backend.

## Cambios realizados

### 1. Tipos actualizados (`src/modules/Purchases/types/index.ts`)

#### Nuevo: Enum InputUnit
```typescript
export const InputUnit = {
  KG: "KG",
  LITRO: "LITRO",
  UNIDAD: "UNIDAD",
} as const;

export type InputUnit = typeof InputUnit[keyof typeof InputUnit];
```

#### Nuevas etiquetas legibles
```typescript
export const InputUnitLabels: Record<InputUnit, string> = {
  [InputUnit.KG]: "Kilogramos",
  [InputUnit.LITRO]: "Litros",
  [InputUnit.UNIDAD]: "Unidades",
};
```

#### Interface Input actualizada
```typescript
export interface Input {
  id: string; // UUID v4
  name: string;
  unit: InputUnit; // ✅ Ahora es obligatorio y tipado
  stock?: number;
  costPerUnit?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

**Cambios:**
- ✅ `unit` ahora es obligatorio (no optional)
- ✅ `unit` ahora usa el tipo `InputUnit` (enum)
- ❌ Eliminado `description` (no existe en backend)
- ❌ Eliminado `minStock` (no existe en backend)
- ✅ Agregado `costPerUnit` (existe en backend)

### 2. Formulario de orden de compra mejorado

#### Visualización en el selector de insumos
El select ahora muestra la unidad junto al nombre:
```tsx
<option key={input.id} value={input.id}>
  {input.name} {input.unit ? `(${input.unit})` : ""}
</option>
```

**Resultado:** `"Fertilizante NPK (KG)"` o `"Herbicida Glifosato (LITRO)"`

#### Visualización en el campo de cantidad
El label y placeholder ahora muestran la unidad del insumo seleccionado:

```tsx
<Label htmlFor={`quantity-${index}`}>
  Cantidad *
  {item.inputId && (() => {
    const selectedInput = inputs.find(inp => inp.id === item.inputId);
    return selectedInput ? (
      <span className="ml-2 text-muted-foreground font-normal">
        ({selectedInput.unit})
      </span>
    ) : null;
  })()}
</Label>

<Input
  placeholder={(() => {
    const selectedInput = inputs.find(inp => inp.id === item.inputId);
    return selectedInput ? `Cantidad en ${selectedInput.unit}` : "Cantidad";
  })()}
/>
```

**Resultado:** 
- Label: `"Cantidad * (KG)"`
- Placeholder: `"Cantidad en KG"`

### 3. Detalles de orden de compra

El componente `PurchaseOrderDetailsSheet` ahora muestra:

```tsx
<div className="flex-1">
  <p className="font-medium">
    {detail.input?.name || `Insumo ID: ${detail.inputId}`}
  </p>
  {detail.input?.unit && (
    <p className="text-xs text-muted-foreground">
      Unidad: {detail.input.unit}
    </p>
  )}
</div>
<div className="text-right">
  <p className="font-medium">
    {detail.quantity} {detail.input?.unit || "und"}
  </p>
  ...
</div>
```

**Resultado:**
```
Fertilizante NPK          250 KG
Unidad: KG
```

### 4. Diálogo de recepción de mercancía

Ya mostraba correctamente las unidades en múltiples lugares:

```tsx
<p className="text-sm text-muted-foreground">
  Solicitado: {item.quantityOrdered} {item.unit}
</p>
<p className="text-sm text-muted-foreground">
  Ya recibido: {item.quantityReceived} {item.unit}
</p>
<p className="text-sm text-muted-foreground">
  Pendiente: {item.quantityOrdered - item.quantityReceived} {item.unit}
</p>

<Input type="number" ... />
<span className="text-sm text-muted-foreground">{item.unit}</span>
```

## Alineación con Backend

### Entidad Input (backend)
```typescript
@Entity('inputs')
export class Input {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: InputUnit })
  unit: InputUnit; // ✅ Enum obligatorio

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  stock: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  costPerUnit: number;
  
  // ... relaciones
}
```

### Enum InputUnit (backend)
```typescript
export enum InputUnit {
  KG = 'KG',
  LITRO = 'LITRO',
  UNIDAD = 'UNIDAD', // Para trampas, herramientas, etc.
}
```

**✅ Frontend y backend ahora están 100% alineados**

## Beneficios

1. **Claridad:** Los usuarios ven inmediatamente la unidad de medida de cada insumo
2. **Validación:** Se evitan errores de confusión entre unidades
3. **UX mejorada:** Placeholders y labels dinámicos contextualizan el input
4. **Consistencia:** Mismos tipos y enums en frontend y backend
5. **Type-safety:** TypeScript valida que las unidades sean correctas

## Ejemplo de flujo completo

1. **Seleccionar insumo:**
   - Usuario ve: `"Fertilizante NPK (KG)"`

2. **Ingresar cantidad:**
   - Label muestra: `"Cantidad * (KG)"`
   - Placeholder: `"Cantidad en KG"`
   - Usuario ingresa: `250`

3. **Ver detalles:**
   - Muestra: `"250 KG"` y `"Unidad: KG"`

4. **Recibir mercancía:**
   - Muestra: `"Solicitado: 250 KG"`
   - Muestra: `"Pendiente: 250 KG"`
   - Input para recibir con sufijo: `"KG"`

## Próximos pasos recomendados

1. ✅ Implementar endpoints del backend para Purchase Orders
2. ✅ Implementar endpoints para Suppliers e Inputs
3. ⚠️ Considerar agregar precio unitario en el formulario
4. ⚠️ Considerar mostrar stock disponible al seleccionar insumo
5. ⚠️ Considerar agregar cálculo de costo total de la orden
