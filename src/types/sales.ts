/**
 * Tipos e interfaces para el módulo de Sales
 */

import type { Customer } from "./customers";
import type { Shipment } from "./shipments";

/**
 * Estados posibles de una orden de venta
 */
export const SalesOrderStatus = {
  PENDIENTE: 'PENDIENTE', // Presupuesto enviado
  APROBADA: 'APROBADA', // Cliente confirmó, listo para despachar
  DESPACHADA_PARCIAL: 'DESPACHADA_PARCIAL', // Mercadería enviada (parcial o total)
  DESPACHADA_TOTAL: 'DESPACHADA_TOTAL', // Mercadería totalmente enviada
  PAGADA: 'PAGADA', // Pago recibido (parcial o total)
  CERRADA: 'CERRADA', // Completada (para archivar)
  CANCELADA: 'CANCELADA',
} as const;

export type SalesOrderStatus = typeof SalesOrderStatus[keyof typeof SalesOrderStatus];


/**
 * Estados posibles de un detalle de orden de venta
 */
export const SalesOrderDetailStatus = {
  PENDIENTE: 'PENDIENTE',
  DESPACHADA_PARCIAL: 'DESPACHADA_PARCIAL',
  COMPLETA: 'COMPLETA'
} as const;

export type SalesOrderDetailStatus = typeof SalesOrderDetailStatus[keyof typeof SalesOrderDetailStatus];


/**
 * Detalle de una orden de venta (item individual)
 */
export interface SalesOrderDetail {
  id?: string; // UUID v4
  salesOrderId?: string; // UUID v4
  salesOrder?: SalesOrder;
  caliber: string; // Calibre del producto vendido
  variety: string; // Variedad del producto vendido
  unitPrice: number; // Precio unitario de venta
  quantityKg: number; // Cantidad vendida
  quantityShipped?: number; // Cantidad despachada (kg)
  status: SalesOrderDetailStatus;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/**
 * Orden de venta
 */
export interface SalesOrder {
  id?: string; // UUID v4
  customerId: string; // UUID v4 del cliente
  customer?: Customer;
  status: SalesOrderStatus;
  totalAmount: number; // Monto total de la orden (calculado desde details)
  details: SalesOrderDetail[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  shipments?: Shipment[]; // Envíos asociados (opcional)
}

/**
 * DTO para crear una orden de venta
 */
export interface CreateSalesOrderDTO {
  customerId: string; // UUID v4 del cliente
  status?: SalesOrderStatus;
  details: {
    /** Calibre del producto vendido (como string) */
    caliber: string;
    /** Variedad del producto vendido (como string) */
    variety: string;
    unitPrice?: number;
    quantityKg: number;
    quantityShipped?: number;
    status?: SalesOrderDetailStatus;
  }[];
}

/**
 * DTO para actualizar una orden de venta
 */
export interface UpdateSalesOrderDTO {
  customerId?: string; // UUID v4 del cliente
  status?: SalesOrderStatus;
  details?: {
    id: string; // UUID v4
    caliber?: string;
    variety?: string;
    unitPrice?: number;
    quantityKg?: number;
    quantityShipped?: number;
    status?: SalesOrderDetailStatus;
  }[];
}

/**
 * DTO para actualizar el estado de una orden de venta
 */
export interface UpdateSalesOrderStatusDTO {
  status: SalesOrderStatus;
}

/**
 * Filtros para consultar órdenes de venta
 */
export interface SalesOrdersFilters {
  status?: SalesOrderStatus[];
  customerId?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}
