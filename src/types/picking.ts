// src/types/picking.ts

// Importamos los tipos existentes del módulo de ventas
// Nota: Asumo que sales.ts está en la misma carpeta. Si usas alias, cámbialo a '@/types/sales'

// --- ENTIDADES DE INVENTARIO ---

// Representa un lote físico disponible en stock para ser "pickeado"
// (Simula la entidad HarvestLot del backend)
export interface InventoryLot {
  id: string; // uuid-lote
  code: string; // Ej: "H-5"
  // Mantenemos variedad como objeto aquí para tener el ID y Nombre disponibles en la UI de selección
  variety: { id: string; name: string }; 
  remainingNetWeightKg: number; // Stock actual disponible
  location?: string; // Ubicación física (ej: "Cámara 1")
}

// --- DTOs PARA LA API DE ENVÍOS (Requerimiento B2.10) ---

// Detalle individual de asignación: Cuánto saco de qué lote para qué línea
export interface ShipmentLotDetailDto {
  quantityTakenKg: number;      // Cantidad a descontar
  harvestLotId: string;         // ID del lote de origen (InventoryLot.id)
  salesOrderDetailId: string;   // ID de la línea de pedido destino (SalesOrderDetail.id)
}

// El cuerpo (Body) que enviaremos al endpoint POST /api/shipments
export interface CreateShipmentDto {
  salesOrderId: string;               // ID de la orden de venta
  lotDetails: ShipmentLotDetailDto[]; // Array de asignaciones
  // Datos opcionales para el remito/documentación
  dispatchDate?: string; 
  truckPlate?: string;
  driverName?: string;
}

// --- TIPOS AUXILIARES PARA LA UI ---

// Estructura para manejar el estado del "Wizard" de picking en el frontend
// Permite saber rápidamente cuánto se ha sacado de cada lote para cada línea
// Formato: { [OrderLineID]: { [LotID]: Cantidad } }
export interface PickingSelection {
  [salesOrderDetailId: string]: {
    [harvestLotId: string]: number; // cantidad asignada
  };
}