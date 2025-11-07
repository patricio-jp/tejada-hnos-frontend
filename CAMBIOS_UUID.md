# Actualización: Soporte para UUID v4

## Resumen
Se actualizó el módulo de **Órdenes de Compra (Purchases)** para usar **UUID v4** como identificadores de todas las entidades, en lugar de números enteros.

## Fecha
5 de noviembre de 2025

---

## Cambios Realizados

### 1. Tipos e Interfaces (`src/modules/Purchases/types/index.ts`)

Todas las propiedades `id` fueron cambiadas de `number` a `string` con comentarios indicando que son UUID v4:

#### Interfaces actualizadas:
- ✅ **Supplier**: `id: string; // UUID v4`
- ✅ **Input**: `id: string; // UUID v4`
- ✅ **PurchaseOrderDetail**: 
  - `id?: string; // UUID v4`
  - `purchaseOrderId?: string; // UUID v4`
  - `inputId: string; // UUID v4`
- ✅ **PurchaseOrder**:
  - `id?: string; // UUID v4`
  - `supplierId: string; // UUID v4`
  - `createdBy?: string; // UUID v4 del usuario`
- ✅ **GoodReceipt**:
  - `id?: string; // UUID v4`
  - `purchaseOrderId: string; // UUID v4`
  - `receivedBy?: string; // UUID v4 del usuario`
- ✅ **GoodReceiptDetail**:
  - `id?: string; // UUID v4`
  - `goodReceiptId?: string; // UUID v4`
  - `purchaseOrderDetailId: string; // UUID v4`
  - `inputId: string; // UUID v4`

#### DTOs actualizados:
- ✅ **CreatePurchaseOrderDto**:
  - `supplierId: string; // UUID v4`
  - `details[].inputId: string; // UUID v4`
- ✅ **UpdatePurchaseOrderDto**:
  - `supplierId?: string; // UUID v4`
  - `details[].id?: string; // UUID v4`
  - `details[].inputId: string; // UUID v4`
- ✅ **CreateGoodReceiptDto**:
  - `purchaseOrderId: string; // UUID v4`
  - `details[].purchaseOrderDetailId: string; // UUID v4`
  - `details[].inputId: string; // UUID v4`

---

### 2. Hook de Órdenes de Compra (`src/modules/Purchases/hooks/usePurchaseOrders.ts`)

#### Cambios en firmas de funciones:
```typescript
// ANTES
updatePurchaseOrder(id: number, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder | null>
deletePurchaseOrder(id: number): Promise<boolean>
getPurchaseOrderById(id: number): Promise<PurchaseOrder | null>

// DESPUÉS
updatePurchaseOrder(id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder | null>
deletePurchaseOrder(id: string): Promise<boolean>
getPurchaseOrderById(id: string): Promise<PurchaseOrder | null>
```

Las URLs de la API ya manejan correctamente los UUID como strings:
```typescript
`${API_BASE_URL}/purchase-orders/${id}` // id es string (UUID v4)
```

---

### 3. Página de Formulario (`src/modules/Purchases/pages/PurchaseOrderFormPage.tsx`)

#### State actualizado:
```typescript
// ANTES
const [supplierId, setSupplierId] = useState<number | null>(null);
interface OrderItem {
  inputId: number;
  quantity: number;
  notes: string;
}

// DESPUÉS
const [supplierId, setSupplierId] = useState<string | null>(null); // UUID v4
interface OrderItem {
  inputId: string; // UUID v4
  quantity: number;
  notes: string;
}
```

#### Valores iniciales actualizados:
```typescript
// ANTES
const [items, setItems] = useState<OrderItem[]>([
  { inputId: 0, quantity: 1, notes: "" },
]);

const addItem = () => {
  setItems([...items, { inputId: 0, quantity: 1, notes: "" }]);
};

// DESPUÉS
const [items, setItems] = useState<OrderItem[]>([
  { inputId: "", quantity: 1, notes: "" }, // UUID v4 vacío al inicio
]);

const addItem = () => {
  setItems([...items, { inputId: "", quantity: 1, notes: "" }]); // UUID v4 vacío
};
```

#### Manejo de selects actualizado:
```typescript
// ANTES - Supplier select
setSupplierId(value === "" ? null : parseInt(value));

// DESPUÉS - Supplier select
setSupplierId(value === "" ? null : value); // UUID v4 como string

// ANTES - Input select
updateItem(index, "inputId", value === "0" ? 0 : parseInt(value));
<option value="0">Seleccione un insumo</option>

// DESPUÉS - Input select
updateItem(index, "inputId", value === "" ? "" : value); // UUID v4 como string
<option value="">Seleccione un insumo</option>
```

#### Validación actualizada:
```typescript
// ANTES
const validItems = items.filter(
  (item) => item.inputId > 0 && item.quantity > 0
);

// DESPUÉS
const validItems = items.filter(
  (item) => item.inputId !== "" && item.quantity > 0
);
```

#### Llamadas a funciones actualizadas:
```typescript
// ANTES
getPurchaseOrderById(parseInt(id))
updatePurchaseOrder(parseInt(id), updateDto)

// DESPUÉS
getPurchaseOrderById(id) // UUID v4, no necesita parseInt
updatePurchaseOrder(id, updateDto) // UUID v4, no necesita parseInt
```

---

### 4. Componente de Recepción de Mercancía (`src/modules/Purchases/components/GoodReceiptDialog.tsx`)

#### Interface actualizada:
```typescript
// ANTES
interface ReceiptItem {
  purchaseOrderDetailId: number;
  inputId: number;
  inputName: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityToReceive: number;
  unit: string;
}

// DESPUÉS
interface ReceiptItem {
  purchaseOrderDetailId: string; // UUID v4
  inputId: string; // UUID v4
  inputName: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityToReceive: number;
  unit: string;
}
```

---

## Impacto en el Backend

El backend debe estar preparado para:

1. **Recibir UUIDs como strings** en todas las rutas:
   ```
   GET    /api/purchase-orders/:id
   PUT    /api/purchase-orders/:id
   DELETE /api/purchase-orders/:id
   ```

2. **Validar que los IDs sean UUIDs válidos** (formato UUID v4)

3. **Devolver UUIDs como strings** en todas las respuestas JSON:
   ```json
   {
     "id": "550e8400-e29b-41d4-a716-446655440000",
     "supplierId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     "details": [
       {
         "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
         "inputId": "123e4567-e89b-12d3-a456-426614174000"
       }
     ]
   }
   ```

---

## Notas Importantes

### ✅ Ventajas de UUID v4:
- **Identificadores únicos globales**: No hay colisión entre diferentes bases de datos
- **Generación distribuida**: Pueden generarse en el cliente sin consultar al servidor
- **Seguridad**: No son secuenciales, más difíciles de predecir
- **Compatibilidad**: Estándar ampliamente usado (RFC 4122)

### ⚠️ Consideraciones:
- **Tamaño**: 36 caracteres vs 1-10 dígitos de integers
- **Rendimiento**: Ligeramente más lentos en comparación e indexación
- **URLs**: Las URLs se vuelven más largas
- **Migración**: Si ya hay datos con IDs numéricos, requiere migración de base de datos

### 🔄 Compatibilidad:
- ✅ **React/TypeScript**: Sin cambios significativos, solo tipos
- ✅ **API REST**: URLs funcionan igual con strings
- ✅ **JSON**: Los UUIDs se manejan como strings normales
- ✅ **Base de datos**: PostgreSQL, MySQL, MongoDB soportan UUID nativamente

---

## Verificación

Todos los archivos han sido actualizados y **no hay errores de compilación** de TypeScript.

Para verificar:
```bash
npm run build
# o
tsc --noEmit
```

---

## Próximos Pasos

1. ✅ **Frontend actualizado** - Completado
2. ⏳ **Backend**: Actualizar controladores y modelos para usar UUID
3. ⏳ **Base de datos**: Migrar columnas de ID de `INTEGER` a `UUID`
4. ⏳ **Testing**: Probar flujo completo de creación y edición de órdenes
5. ⏳ **Documentación API**: Actualizar ejemplos de requests/responses

---

## Ejemplos de Uso

### Crear orden de compra con UUIDs:
```typescript
const newOrder: CreatePurchaseOrderDto = {
  supplierId: "f47ac10b-58cc-4372-a567-0e02b2c3d479", // UUID del proveedor
  expectedDeliveryDate: "2025-11-15",
  notes: "Pedido urgente",
  details: [
    {
      inputId: "123e4567-e89b-12d3-a456-426614174000", // UUID del insumo
      quantity: 100,
      notes: "Bolsas de 50kg"
    }
  ]
};

await createPurchaseOrder(newOrder);
```

### Actualizar orden existente:
```typescript
const orderId = "550e8400-e29b-41d4-a716-446655440000"; // UUID de la orden
await updatePurchaseOrder(orderId, {
  status: "APROBADA"
});
```

### Eliminar orden:
```typescript
const orderId = "550e8400-e29b-41d4-a716-446655440000";
await deletePurchaseOrder(orderId);
```

---

## Autor
Actualización realizada por: GitHub Copilot
Fecha: 5 de noviembre de 2025
