# Ejemplos de Uso - Módulo de Órdenes de Compra

## 1. Usando el hook usePurchaseOrders

```tsx
import { usePurchaseOrders } from '@/modules/Purchases';

function MyComponent() {
  const {
    purchaseOrders,      // Array de órdenes
    loading,             // Estado de carga
    error,               // Mensaje de error
    fetchPurchaseOrders, // Refrescar lista
    createPurchaseOrder, // Crear nueva orden
    updatePurchaseOrder, // Actualizar orden existente
    deletePurchaseOrder, // Eliminar orden
    getPurchaseOrderById // Obtener una orden específica
  } = usePurchaseOrders();

  // Los datos se cargan automáticamente al montar el componente
  // También puedes refrescar manualmente:
  const handleRefresh = () => {
    fetchPurchaseOrders();
  };

  return (
    <div>
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {purchaseOrders.map(order => (
        <div key={order.id}>{order.code}</div>
      ))}
    </div>
  );
}
```

## 2. Crear una nueva orden de compra

```tsx
import { usePurchaseOrders } from '@/modules/Purchases';
import type { CreatePurchaseOrderDto } from '@/modules/Purchases';

function CreateOrderExample() {
  const { createPurchaseOrder, loading } = usePurchaseOrders();

  const handleSubmit = async () => {
    const newOrder: CreatePurchaseOrderDto = {
      supplierId: 1,
      notes: "Orden urgente",
      expectedDeliveryDate: "2025-11-15",
      details: [
        {
          inputId: 10,
          quantity: 100,
          notes: "Semillas de alta calidad"
        },
        {
          inputId: 15,
          quantity: 50,
          notes: "Fertilizante orgánico"
        }
      ]
    };

    const result = await createPurchaseOrder(newOrder);
    
    if (result) {
      console.log("Orden creada:", result);
      // Navegar a la lista o mostrar mensaje de éxito
    }
  };

  return (
    <button onClick={handleSubmit} disabled={loading}>
      {loading ? "Creando..." : "Crear Orden"}
    </button>
  );
}
```

## 3. Actualizar una orden existente

```tsx
import { usePurchaseOrders } from '@/modules/Purchases';
import type { UpdatePurchaseOrderDto } from '@/modules/Purchases';

function UpdateOrderExample({ orderId }: { orderId: number }) {
  const { updatePurchaseOrder, loading } = usePurchaseOrders();

  const handleUpdate = async () => {
    const updates: UpdatePurchaseOrderDto = {
      notes: "Notas actualizadas",
      expectedDeliveryDate: "2025-11-20",
      // Solo incluir campos que quieras actualizar
    };

    const result = await updatePurchaseOrder(orderId, updates);
    
    if (result) {
      console.log("Orden actualizada:", result);
    }
  };

  return (
    <button onClick={handleUpdate} disabled={loading}>
      Actualizar Orden
    </button>
  );
}
```

## 4. Registrar una recepción de mercancía

```tsx
import { useGoodsReceipts } from '@/modules/Purchases';
import type { CreateGoodReceiptDto } from '@/modules/Purchases';

function ReceiveGoodsExample({ purchaseOrderId }: { purchaseOrderId: number }) {
  const { createGoodReceipt, loading } = useGoodsReceipts();

  const handleReceive = async () => {
    const receipt: CreateGoodReceiptDto = {
      purchaseOrderId,
      receivedDate: new Date().toISOString().split('T')[0],
      notes: "Recepción completa sin novedades",
      details: [
        {
          purchaseOrderDetailId: 1, // ID del detalle de la orden
          inputId: 10,
          quantityReceived: 100,
          notes: "En perfectas condiciones"
        },
        {
          purchaseOrderDetailId: 2,
          inputId: 15,
          quantityReceived: 50,
          notes: undefined
        }
      ]
    };

    const result = await createGoodReceipt(receipt);
    
    if (result) {
      console.log("Recepción registrada:", result);
      // Refrescar la orden para ver los cambios
    }
  };

  return (
    <button onClick={handleReceive} disabled={loading}>
      {loading ? "Registrando..." : "Registrar Recepción"}
    </button>
  );
}
```

## 5. Usar el componente StatusBadge

```tsx
import { StatusBadge, PurchaseOrderStatus } from '@/modules/Purchases';

function OrderStatusExample() {
  return (
    <div>
      <StatusBadge status={PurchaseOrderStatus.PENDIENTE} />
      <StatusBadge status={PurchaseOrderStatus.APROBADA} />
      <StatusBadge status={PurchaseOrderStatus.RECIBIDA} />
    </div>
  );
}
```

## 6. Usar el componente PurchaseOrderCard

```tsx
import { PurchaseOrderCard } from '@/modules/Purchases';
import type { PurchaseOrder } from '@/modules/Purchases';

function OrderListExample({ orders }: { orders: PurchaseOrder[] }) {
  const handleView = (order: PurchaseOrder) => {
    console.log("Ver orden:", order);
  };

  const handleEdit = (order: PurchaseOrder) => {
    console.log("Editar orden:", order);
  };

  const handleDelete = (order: PurchaseOrder) => {
    console.log("Eliminar orden:", order);
  };

  const handleReceive = (order: PurchaseOrder) => {
    console.log("Recibir mercancía:", order);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map(order => (
        <PurchaseOrderCard
          key={order.id}
          purchaseOrder={order}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReceive={handleReceive}
        />
      ))}
    </div>
  );
}
```

## 7. Validar estado de orden para acciones

```tsx
import { PurchaseOrderStatus } from '@/modules/Purchases';
import type { PurchaseOrder } from '@/modules/Purchases';

function canEditOrder(order: PurchaseOrder): boolean {
  return order.status === PurchaseOrderStatus.PENDIENTE;
}

function canReceiveGoods(order: PurchaseOrder): boolean {
  return order.status === PurchaseOrderStatus.APROBADA || 
         order.status === PurchaseOrderStatus.RECIBIDA_PARCIAL;
}

function canDeleteOrder(order: PurchaseOrder): boolean {
  return order.status === PurchaseOrderStatus.PENDIENTE;
}

// Uso:
function OrderActionsExample({ order }: { order: PurchaseOrder }) {
  return (
    <div>
      {canEditOrder(order) && <button>Editar</button>}
      {canReceiveGoods(order) && <button>Recibir</button>}
      {canDeleteOrder(order) && <button>Eliminar</button>}
    </div>
  );
}
```

## 8. Filtrar órdenes por estado

```tsx
import { usePurchaseOrders, PurchaseOrderStatus } from '@/modules/Purchases';

function FilteredOrdersExample() {
  const { purchaseOrders } = usePurchaseOrders();

  // Órdenes pendientes
  const pendingOrders = purchaseOrders.filter(
    order => order.status === PurchaseOrderStatus.PENDIENTE
  );

  // Órdenes que pueden recibir mercancía
  const receivableOrders = purchaseOrders.filter(
    order => order.status === PurchaseOrderStatus.APROBADA || 
             order.status === PurchaseOrderStatus.RECIBIDA_PARCIAL
  );

  // Órdenes completadas
  const completedOrders = purchaseOrders.filter(
    order => order.status === PurchaseOrderStatus.RECIBIDA || 
             order.status === PurchaseOrderStatus.CERRADA
  );

  return (
    <div>
      <h2>Pendientes: {pendingOrders.length}</h2>
      <h2>Para Recibir: {receivableOrders.length}</h2>
      <h2>Completadas: {completedOrders.length}</h2>
    </div>
  );
}
```

## 9. Formatear fechas

```tsx
function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Uso:
function OrderDateExample({ order }: { order: PurchaseOrder }) {
  return (
    <div>
      <p>Fecha de orden: {formatDate(order.orderDate)}</p>
      <p>Entrega estimada: {formatDate(order.expectedDeliveryDate)}</p>
    </div>
  );
}
```

## 10. Calcular totales de orden

```tsx
import type { PurchaseOrder } from '@/modules/Purchases';

function calculateOrderTotals(order: PurchaseOrder) {
  const totalItems = order.details.length;
  
  const totalQuantityOrdered = order.details.reduce(
    (sum, detail) => sum + detail.quantity, 
    0
  );
  
  const totalQuantityReceived = order.details.reduce(
    (sum, detail) => sum + (detail.quantityReceived || 0), 
    0
  );
  
  const percentageReceived = totalQuantityOrdered > 0
    ? (totalQuantityReceived / totalQuantityOrdered) * 100
    : 0;

  return {
    totalItems,
    totalQuantityOrdered,
    totalQuantityReceived,
    percentageReceived: Math.round(percentageReceived)
  };
}

// Uso:
function OrderTotalsExample({ order }: { order: PurchaseOrder }) {
  const totals = calculateOrderTotals(order);

  return (
    <div>
      <p>Items: {totals.totalItems}</p>
      <p>Solicitado: {totals.totalQuantityOrdered}</p>
      <p>Recibido: {totals.totalQuantityReceived}</p>
      <p>Progreso: {totals.percentageReceived}%</p>
    </div>
  );
}
```

## 11. Navegación programática

```tsx
import { useNavigate } from 'react-router';

function NavigationExample() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate('/purchases')}>
        Ver todas las órdenes
      </button>
      <button onClick={() => navigate('/purchases/new')}>
        Crear nueva orden
      </button>
      <button onClick={() => navigate(`/purchases/edit/${orderId}`)}>
        Editar orden
      </button>
    </div>
  );
}
```

## 12. Manejo de errores

```tsx
import { usePurchaseOrders } from '@/modules/Purchases';

function ErrorHandlingExample() {
  const { error, loading, fetchPurchaseOrders } = usePurchaseOrders();

  if (loading) {
    return <div>Cargando órdenes...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error al cargar las órdenes: {error}</p>
        <button onClick={fetchPurchaseOrders}>
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizar contenido normal...
  return <div>Órdenes cargadas exitosamente</div>;
}
```

---

## Consejos y Mejores Prácticas

1. **Siempre valida el estado antes de mostrar acciones**
2. **Maneja los estados de loading y error apropiadamente**
3. **Usa TypeScript para evitar errores de tipos**
4. **Aprovecha las exportaciones centralizadas del módulo**
5. **Refresh los datos después de operaciones exitosas**
6. **Muestra feedback visual al usuario (loading, success, error)**
7. **Valida las cantidades antes de enviar recepciones**
8. **Formatea las fechas para mejor legibilidad**
