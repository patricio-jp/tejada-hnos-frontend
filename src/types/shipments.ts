/**
 * Tipos e interfaces para el módulo de Shipments
 */
import type { HarvestLot } from "./harvest";
import type { SalesOrder, SalesOrderDetail } from "./sales";

/**
 * Envío asociado a una orden de venta
 */
export interface Shipment {
  id: string;
  salesOrderId: string;
  salesOrder?: SalesOrder;
  trackingNumber?: string | null;
  notes?: string | null;
  shipmentDate: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  lotDetails: ShipmentItem[];
}

/**
 * Detalle de un ítem dentro de un envío
 */
export interface ShipmentItem {
  id: string;
  quantityTakenKg: number;
  shipmentId: string;
  shipment?: Shipment;
  salesOrderDetailId: string;
  salesOrderDetail?: SalesOrderDetail;
  harvestLotId: string | null;
  harvestLot?: HarvestLot; // Detalles del lote de cosecha (opcional)
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

/**
 * DTO para crear un nuevo envío (modificable según necesidades)
 */
export interface CreateShipmentDTO {
  salesOrderId: string;
  shipmentDate: string;
  carrier: string;
  trackingNumber?: string;
  items: Array<{
    salesOrderDetailId: string;
    quantityKg: number;
  }>;
}

export interface ShipmentFilters {
  salesOrderId?: string;
  carrier?: string;
  startDate?: string;
  endDate?: string;
}
