# Módulo de Órdenes de Compra (Purchase Orders)

## Descripción
Este módulo gestiona las órdenes de compra a proveedores y la recepción de mercancía en el sistema.

## Estructura del módulo

```
src/modules/Purchases/
├── hooks/
│   ├── usePurchaseOrders.ts  # Hook para CRUD de órdenes
│   ├── useSuppliers.ts       # Hook para obtener proveedores
│   ├── useInputs.ts          # Hook para obtener insumos
│   └── useGoodsReceipts.ts   # Hook para registrar recepciones
├── components/
│   ├── StatusBadge.tsx       # Badge para mostrar el estado
│   ├── PurchaseOrderCard.tsx # Tarjeta de orden en el listado
│   ├── PurchaseOrderDetailsSheet.tsx  # Panel lateral con detalles
│   └── GoodReceiptDialog.tsx # Diálogo para registrar recepciones
└── pages/
    ├── PurchaseOrdersListPage.tsx  # Página principal del listado
    └── PurchaseOrderFormPage.tsx   # Formulario crear/editar
```

## Funcionalidades

### 1. Listado de Órdenes de Compra
- **Ruta**: `/purchases`
- **Componente**: `PurchaseOrdersListPage`
- **Características**:
  - Vista en tarjetas (cards) de todas las órdenes
  - Búsqueda por código, proveedor o ID
  - Filtro por estado
  - Botón de refrescar datos
  - Acciones rápidas desde las tarjetas

### 2. Crear/Editar Orden de Compra
- **Rutas**: 
  - Crear: `/purchases/new`
  - Editar: `/purchases/edit/:id`
- **Componente**: `PurchaseOrderFormPage`
- **Características**:
  - Selección de proveedor
  - Agregar múltiples insumos con cantidades
  - Fecha estimada de entrega (opcional)
  - Notas generales y por insumo
  - Solo se pueden editar órdenes en estado PENDIENTE

### 3. Ver Detalles de Orden
- **Componente**: `PurchaseOrderDetailsSheet`
- **Características**:
  - Panel lateral (sheet) con toda la información
  - Estado actual de la orden
  - Información del proveedor
  - Listado de insumos solicitados
  - Cantidades solicitadas vs recibidas
  - Historial de recepciones
  - Acciones disponibles según el estado

### 4. Recibir Mercancía
- **Componente**: `GoodReceiptDialog`
- **Características**:
  - Disponible para órdenes APROBADAS o RECIBIDA_PARCIAL
  - Registro de fecha de recepción
  - Ingreso de cantidades recibidas por insumo
  - Validación de cantidades (no puede exceder lo solicitado)
  - Notas de recepción
  - Crea un registro de GoodReceipt en el servidor

## Estados de las Órdenes

| Estado | Descripción | Acciones disponibles |
|--------|-------------|---------------------|
| `PENDIENTE` | Orden creada, esperando aprobación | Ver, Editar, Eliminar |
| `APROBADA` | Orden aprobada, lista para enviar al proveedor | Ver, Recibir mercancía |
| `RECIBIDA_PARCIAL` | Parte de la mercancía ha sido recibida | Ver, Recibir mercancía |
| `RECIBIDA` | Toda la mercancía ha sido recibida | Ver |
| `CERRADA` | Orden cerrada administrativamente | Ver |
| `CANCELADA` | Orden cancelada | Ver |

## Endpoints de API utilizados

### Órdenes de Compra
- `GET /api/purchase-orders` - Obtener todas las órdenes
- `GET /api/purchase-orders/:id` - Obtener una orden específica
- `POST /api/purchase-orders` - Crear nueva orden
- `PUT /api/purchase-orders/:id` - Actualizar orden
- `DELETE /api/purchase-orders/:id` - Eliminar orden

### Recepciones de Mercancía
- `POST /api/goods-receipts` - Registrar recepción de mercancía

### Proveedores e Insumos (manejados por otros módulos)
- `GET /api/suppliers` - Obtener lista de proveedores
- `GET /api/inputs` - Obtener lista de insumos

## Variables de entorno

```env
VITE_API_URL=http://localhost:3000/api
```

Si no está definida, se usa `http://localhost:3000/api` por defecto.

## Permisos y Seguridad

- Todas las rutas requieren autenticación (protegidas por `ProtectedRoute`)
- El token de acceso se envía en el header `Authorization: Bearer {token}`
- En el futuro, se implementará validación de roles (Admin y Capataz)

## Componentes de UI utilizados (shadcn)

- `Button`
- `Card`
- `Input`
- `Label`
- `Badge`
- `Dialog`
- `Sheet`
- `AlertDialog`
- `Separator`

## Mejoras futuras

1. **Validación de roles**: Restringir acceso solo a Admin y Capataz
2. **Aprobar órdenes**: Permitir a Admin aprobar órdenes PENDIENTES
3. **Cancelar órdenes**: Permitir cancelar órdenes en ciertos estados
4. **Exportar a PDF**: Generar documentos imprimibles de las órdenes
5. **Notificaciones**: Alertas cuando una orden requiere acción
6. **Historial de cambios**: Auditoría de modificaciones
7. **Adjuntar archivos**: Permitir adjuntar documentos relacionados
8. **Integración con inventario**: Actualizar stock automáticamente al recibir
9. **Vista de tabla**: Opción alternativa a las tarjetas para el listado
10. **Estadísticas**: Dashboard con métricas de órdenes de compra

## Notas técnicas

- Los hooks usan `useCallback` y `useEffect` para optimizar el rendimiento
- Las fechas se manejan en formato ISO 8601
- Los estados se actualizan localmente después de operaciones exitosas
- Se utiliza lazy loading para las páginas en `App.tsx`
- El módulo es completamente independiente y modular

## Ejemplo de uso

```typescript
// En un componente
import { usePurchaseOrders } from '@/modules/Purchases/hooks/usePurchaseOrders';

function MyComponent() {
  const { 
    purchaseOrders, 
    loading, 
    error, 
    fetchPurchaseOrders 
  } = usePurchaseOrders();

  // Los datos se cargan automáticamente
  // También puedes refrescar manualmente:
  const handleRefresh = () => {
    fetchPurchaseOrders();
  };

  // ...
}
```
