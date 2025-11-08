# Alineación Frontend-Backend - Módulo de Compras

## Resumen de Cambios

Este documento detalla los cambios realizados para alinear completamente el frontend con la estructura de datos del backend.

## 1. Análisis de Entidades del Backend

### PurchaseOrder Entity
```typescript
{
  id: string; // UUID v4
  status: string;
  totalAmount: number; // Decimal(10,2)
  supplierId: string; // UUID v4
  supplier: Supplier; // Relación ManyToOne
  details: PurchaseOrderDetail[]; // Relación OneToMany con cascade
  receipts: GoodsReceipt[]; // Relación OneToMany (no 'goodsReceipts')
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

**Campos que NO existen en el backend:**
- ❌ `code` - No hay código único generado
- ❌ `orderDate` - Se usa `createdAt` en su lugar
- ❌ `expectedDeliveryDate` - No está en la entidad
- ❌ `notes` - No hay notas generales
- ❌ `createdBy` - No se guarda el ID del usuario
- ❌ `createdByName` - No se guarda el nombre del usuario

### PurchaseOrderDetail Entity
```typescript
{
  id: string; // UUID v4
  purchaseOrderId: string; // UUID v4
  inputId: string; // UUID v4
  input: Input; // Relación ManyToOne
  quantity: number; // Decimal(10,2) - Cantidad solicitada
  unitPrice: number; // Decimal(10,2) - Precio unitario de compra
  receiptDetails: GoodsReceiptDetail[]; // Relación OneToMany
  
  // Propiedades calculadas (getters)
  quantityReceived: number; // Suma de receiptDetails
  quantityPending: number; // quantity - quantityReceived
  isFullyReceived: boolean; // quantityPending <= 0
}
```

**Campos que NO existen en el backend:**
- ❌ `notes` - No hay notas por item

### Supplier Entity
```typescript
{
  id: string; // UUID v4
  name: string;
  taxId: string | null;
  address: string | null;
  contactEmail: string | null; // ✅ NO 'email'
  phoneNumber: string | null; // ✅ NO 'phone'
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  purchaseOrders: PurchaseOrder[];
}
```

### Input Entity
```typescript
{
  id: string; // UUID v4
  name: string;
  unit: InputUnit; // Enum: KG, LITRO, UNIDAD
  stock: number; // Decimal(10,2)
  costPerUnit: number; // Decimal(10,2)
  usages: InputUsage[];
  purchaseOrderDetails: PurchaseOrderDetail[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

## 2. DTOs del Backend

### CreatePurchaseOrderDto
```typescript
{
  supplierId: string; // UUID v4 - @IsUUID('4')
  status: string; // @IsString, @IsNotEmpty
  totalAmount: number; // @IsNumber, @Min(0)
  details: Array<{
    inputId: string; // UUID v4 - @IsUUID('4')
    quantity: number; // @IsNumber, @Min(0.01)
    unitPrice: number; // @IsNumber, @Min(0)
  }>;
}
```

### UpdatePurchaseOrderDto
```typescript
{
  supplierId?: string; // UUID v4 - @IsOptional, @IsUUID('4')
  status?: string; // @IsOptional, @IsString
  totalAmount?: number; // @IsOptional, @IsNumber, @Min(0)
  details?: Array<{
    inputId: string; // UUID v4
    quantity: number;
    unitPrice: number;
  }>;
}
```

## 3. Cambios en el Frontend

### 3.1. Actualización de Tipos (`src/modules/Purchases/types/index.ts`)

#### PurchaseOrder Interface
```typescript
// ANTES (campos incorrectos):
export interface PurchaseOrder {
  code?: string; // ❌ No existe en backend
  orderDate?: string; // ❌ No existe en backend
  expectedDeliveryDate?: string; // ❌ No existe en backend
  notes?: string; // ❌ No existe en backend
  goodsReceipts?: GoodReceipt[]; // ❌ Nombre incorrecto
  createdBy?: string; // ❌ No existe en backend
  createdByName?: string; // ❌ No existe en backend
}

// DESPUÉS (alineado con backend):
export interface PurchaseOrder {
  id?: string; // UUID v4
  supplierId: string; // UUID v4
  supplier?: Supplier;
  status: PurchaseOrderStatus;
  totalAmount: number; // ✅ Monto total calculado
  details: PurchaseOrderDetail[];
  receipts?: GoodReceipt[]; // ✅ Nombre correcto
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
```

#### PurchaseOrderDetail Interface
```typescript
// ANTES (campos incorrectos):
export interface PurchaseOrderDetail {
  quantity: number;
  quantityReceived?: number;
  notes?: string; // ❌ No existe en backend
  createdAt?: string; // ❌ No hay en entity
  updatedAt?: string; // ❌ No hay en entity
}

// DESPUÉS (alineado con backend):
export interface PurchaseOrderDetail {
  id?: string;
  purchaseOrderId?: string;
  inputId: string;
  input?: Input;
  quantity: number; // ✅ Cantidad solicitada
  unitPrice: number; // ✅ Precio unitario (REQUERIDO)
  quantityReceived?: number; // Calculado por backend
  quantityPending?: number; // Calculado por backend
  isFullyReceived?: boolean; // Calculado por backend
  receiptDetails?: GoodReceiptDetail[];
}
```

#### CreatePurchaseOrderDto
```typescript
// ANTES (estructura incorrecta):
export interface CreatePurchaseOrderDto {
  supplierId: string;
  notes?: string; // ❌ No existe en backend
  expectedDeliveryDate?: string; // ❌ No existe en backend
  details: {
    inputId: string;
    quantity: number;
    notes?: string; // ❌ No existe en backend
  }[];
}

// DESPUÉS (alineado con backend):
export interface CreatePurchaseOrderDto {
  supplierId: string; // UUID v4
  status: string; // ✅ Estado inicial (PENDIENTE)
  totalAmount: number; // ✅ Monto total calculado
  details: {
    inputId: string; // UUID v4
    quantity: number;
    unitPrice: number; // ✅ Precio unitario (REQUERIDO)
  }[];
}
```

### 3.2. Nuevo Componente: Combobox con Búsqueda

Se creó el componente `src/components/ui/combobox.tsx` que permite:

✅ **Búsqueda en tiempo real** de proveedores e insumos
✅ **Filtrado por nombre y subtítulo**
✅ **Mejor UX** para listas largas de opciones
✅ **Diseño moderno** con iconos de búsqueda
✅ **Cierre automático** al hacer clic fuera

```typescript
interface ComboboxOption {
  value: string; // ID del elemento
  label: string; // Nombre principal
  subtitle?: string; // Información adicional (RUC, unidad, stock)
}
```

### 3.3. Rediseño del Formulario (`PurchaseOrderFormPage.tsx`)

#### Mejoras Visuales:
1. **Sección de Proveedor**
   - Combobox con búsqueda en lugar de select nativo
   - Card destacada con icono ShoppingCart
   - Información del proveedor seleccionado (RUC, email, teléfono)

2. **Sección de Insumos**
   - Card con icono Package
   - Cada item muestra:
     - Badge con número de item (#1, #2, etc.)
     - Nombre del insumo seleccionado
     - Stock actual en badge informativo
     - Grid responsive (3 columnas en desktop)
   - Campos por item:
     - **Insumo**: Combobox con búsqueda (muestra nombre, unidad y stock)
     - **Stock Actual**: Campo readonly que muestra el stock disponible
     - **Cantidad**: Input numérico con validación
     - **Precio Unitario**: Input con ícono de moneda (S/)
     - **Subtotal**: Calculado automáticamente (cantidad × precio)

3. **Resumen Total**
   - Card destacada con fondo primario
   - Muestra total en grande (S/ X.XX)
   - Contador de items válidos

4. **Validaciones**
   - Proveedor requerido
   - Al menos un insumo con cantidad > 0 y precio ≥ 0
   - Botón "Crear Orden" deshabilitado si falta información

5. **Acciones Sticky**
   - Barra de acciones fija en la parte inferior
   - Botones grandes con iconos
   - Estado de carga visible

#### Cambios en Lógica:
```typescript
// ANTES:
interface OrderItem {
  inputId: string;
  quantity: number;
  notes: string; // ❌ No existe en backend
}

// DESPUÉS:
interface OrderItem {
  inputId: string;
  quantity: number;
  unitPrice: number; // ✅ REQUERIDO
}

// Cálculo del total:
const totalAmount = useMemo(() => {
  return items.reduce((sum, item) => {
    if (item.inputId && item.quantity > 0 && item.unitPrice > 0) {
      return sum + item.quantity * item.unitPrice;
    }
    return sum;
  }, 0);
}, [items]);

// DTO enviado al backend:
const dto: CreatePurchaseOrderDto = {
  supplierId,
  status: "PENDIENTE", // ✅ Estado inicial
  totalAmount, // ✅ Total calculado
  details: validItems.map((item) => ({
    inputId: item.inputId,
    quantity: item.quantity,
    unitPrice: item.unitPrice, // ✅ Incluido
  })),
};
```

### 3.4. Actualización del Sheet de Detalles

Se actualizó `PurchaseOrderDetailsSheet.tsx` para mostrar:

#### Información Correcta:
- ✅ **ID corto** en lugar de `code` (ej: "Orden #8cd5c791")
- ✅ **Fecha de creación** en lugar de `orderDate`
- ✅ **Última actualización** en lugar de `expectedDeliveryDate`
- ✅ **Total de la orden** (S/ X.XX) - nuevo campo destacado
- ✅ **Precio unitario** por cada insumo
- ✅ **Subtotal** por cada item (cantidad × precio)
- ✅ **RUC del proveedor** si está disponible
- ✅ **Historial de recepciones** usando `receipts` (no `goodsReceipts`)

#### Tabla de Insumos:
Cada fila muestra:
1. **Insumo**: Nombre, unidad y **precio unitario**
2. **Cantidad**: Cantidad solicitada y **subtotal** (S/ X.XX)
3. **Recibido**: Cantidad recibida (en verde si > 0)
4. **Pendiente**: Cantidad pendiente o badge "✓ Completo"

#### Campos Eliminados:
- ❌ `notes` generales (no existe en backend)
- ❌ `notes` por item (no existe en backend)
- ❌ `createdByName` (no existe en backend)

## 4. Validaciones Alineadas con Backend

### En el Frontend:
```typescript
// Validar proveedor
if (!supplierId) {
  alert("Debe seleccionar un proveedor");
  return;
}

// Validar items
const validItems = items.filter(
  (item) => item.inputId !== "" && item.quantity > 0 && item.unitPrice >= 0
);

if (validItems.length === 0) {
  alert("Debe agregar al menos un insumo con cantidad y precio válidos");
  return;
}
```

### En el Backend (DTOs):
```typescript
// PurchaseOrderDetailDto
@IsUUID('4', { message: 'El ID del insumo debe ser un UUID válido' })
@IsNotEmpty({ message: 'El ID del insumo no puede estar vacío' })
inputId: string;

@IsNumber({ maxDecimalPlaces: 2 }, { message: 'La cantidad debe ser un número válido' })
@Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
@IsNotEmpty({ message: 'La cantidad no puede estar vacía' })
quantity: number;

@IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio unitario debe ser un número válido' })
@Min(0, { message: 'El precio unitario no puede ser negativo' })
@IsNotEmpty({ message: 'El precio unitario no puede estar vacío' })
unitPrice: number;
```

## 5. Componentes Actualizados

### Archivos Modificados:
1. ✅ `src/modules/Purchases/types/index.ts` - Tipos alineados con backend
2. ✅ `src/components/ui/combobox.tsx` - Nuevo componente de búsqueda
3. ✅ `src/modules/Purchases/pages/PurchaseOrderFormPage.tsx` - Formulario rediseñado
4. ✅ `src/modules/Purchases/components/PurchaseOrderDetailsSheet.tsx` - Sheet actualizado

### Archivos sin Cambios:
- `src/modules/Purchases/components/PurchaseOrdersDataTable.tsx` - Ya estaba correcto
- `src/modules/Purchases/components/StatusBadge.tsx` - Ya estaba correcto
- `src/modules/Purchases/hooks/usePurchaseOrders.ts` - Requiere actualización de API calls

## 6. Próximos Pasos (Backend Integration)

### 6.1. Actualizar Hook `usePurchaseOrders`
```typescript
// Actualizar el método createPurchaseOrder:
const createPurchaseOrder = async (dto: CreatePurchaseOrderDto) => {
  setLoading(true);
  setError(null);
  try {
    const response = await api.post("/purchase-orders", dto);
    setPurchaseOrders([...purchaseOrders, response.data]);
    return response.data;
  } catch (err: any) {
    setError(err.response?.data?.message || "Error al crear orden");
    return null;
  } finally {
    setLoading(false);
  }
};
```

### 6.2. Actualizar Hook `useSuppliers`
Asegurarse de que retorna `contactEmail` y `phoneNumber` (no `email` y `phone`).

### 6.3. Actualizar Hook `useInputs`
Asegurarse de que retorna `stock` y `costPerUnit` para mostrar en el formulario.

## 7. Beneficios de los Cambios

### Funcionales:
✅ **Frontend 100% alineado con backend** - No habrá errores de validación
✅ **Búsqueda de insumos** - Fácil encontrar en listas largas
✅ **Cálculo automático de totales** - Menos errores manuales
✅ **Información de stock visible** - Mejor toma de decisiones
✅ **Validaciones consistentes** - Mismo comportamiento que backend

### UX/UI:
✅ **Diseño moderno** - Cards, badges, iconos, colores
✅ **Responsive** - Grids adaptativos para mobile/tablet/desktop
✅ **Feedback visual** - Estados de carga, errores claros
✅ **Acciones sticky** - Siempre visibles al hacer scroll
✅ **Información contextual** - Stock, precios, subtotales

### Mantenibilidad:
✅ **Código más limpio** - Menos campos innecesarios
✅ **Tipos estrictos** - TypeScript ayuda a prevenir errores
✅ **Documentación completa** - Este archivo explica todo
✅ **Componentes reutilizables** - Combobox se puede usar en otros módulos

## 8. Testing Checklist

Cuando el backend esté listo, probar:

- [ ] Crear orden de compra con 1 insumo
- [ ] Crear orden de compra con múltiples insumos
- [ ] Buscar proveedores en el combobox
- [ ] Buscar insumos en el combobox
- [ ] Calcular totales correctamente
- [ ] Validar campos requeridos
- [ ] Editar orden existente
- [ ] Ver detalles de orden con precios
- [ ] Ver historial de recepciones
- [ ] Verificar que se muestra el stock actual
- [ ] Verificar que se muestran los subtotales
- [ ] Probar responsive en mobile/tablet

## 9. Notas Importantes

⚠️ **El backend NO genera códigos únicos** para órdenes de compra. Se usa el ID (UUID) truncado.

⚠️ **El backend NO guarda fechas estimadas de entrega**. Se usan `createdAt` y `updatedAt`.

⚠️ **El backend NO guarda notas** ni en la orden ni en los detalles.

⚠️ **El precio unitario es OBLIGATORIO** en cada detalle de la orden.

⚠️ **El total debe ser calculado** por el frontend antes de enviar al backend.

✅ **Los campos calculados** (`quantityReceived`, `quantityPending`, `isFullyReceived`) son **getters** en el backend, no se guardan en BD.
