/**
 * Tipos e interfaces para el módulo de Purchases
 */

import type { Input, InputUnit } from './inputs';
import type { Supplier } from './suppliers';

/**
 * Estados posibles de una orden de compra
 */
export const PurchaseOrderStatus = {
  PENDIENTE: "PENDIENTE",
  APROBADA: "APROBADA",
  RECIBIDA: "RECIBIDA",
  RECIBIDA_PARCIAL: "RECIBIDA_PARCIAL",
  CERRADA: "CERRADA",
  CANCELADA: "CANCELADA",
} as const;

export type PurchaseOrderStatus = typeof PurchaseOrderStatus[keyof typeof PurchaseOrderStatus];

/**
 * Detalle de una orden de compra (item individual)
 * IMPORTANTE: Debe coincidir con backend PurchaseOrderDetail entity
 */
export interface PurchaseOrderDetail {
  id?: string; // UUID v4
  purchaseOrderId?: string; // UUID v4
  input: Input; // Populated cuando se obtiene del servidor
  quantity: number; // Cantidad solicitada
  unitPrice: number; // Precio unitario de compra
  subtotal?: number; // Calculado por backend (quantity * unitPrice)
  quantityReceived?: number; // Calculado por backend desde receiptDetails
  quantityPending?: number; // Calculado por backend
  isFullyReceived?: boolean; // Calculado por backend
  percentageReceived?: number; // Calculado por backend
  receiptHistory?: GoodReceipt[]; // Relación con recepciones
}

/**
 * Orden de compra
 * IMPORTANTE: Debe coincidir con backend PurchaseOrder entity
 */
export interface PurchaseOrder {
  id?: string; // UUID v4
  supplierId: string; // UUID v4
  supplier?: Supplier; // Populated cuando se obtiene del servidor
  status: PurchaseOrderStatus;
  totalAmount: number; // Monto total de la orden (calculado desde details)
  details: PurchaseOrderDetail[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/**
 * Recepción de mercancía
 */
export interface GoodReceipt {
  receiptId?: string; // UUID v4
  quantityReceived: number;
  receivedAt?: string;
  notes?: string;
}

/**
 * DTO para crear una orden de compra
 * IMPORTANTE: Debe coincidir con backend CreatePurchaseOrderDto
 */
export interface CreatePurchaseOrderDto {
  supplierId: string; // UUID v4
  details: {
    inputId: string; // UUID v4
    quantity: number; // Cantidad solicitada
    unitPrice?: number; // Precio unitario
  }[];
}

/**
 * DTO para actualizar una orden de compra
 * IMPORTANTE: Debe coincidir con backend UpdatePurchaseOrderDto
 */
export interface UpdatePurchaseOrderDto {
  supplierId?: string; // UUID v4
  details?: {
    id?: string; // UUID v4
    inputId?: string; // UUID v4
    quantity?: number;
    unitPrice?: number;
  }[];
}

/**
 * DTO para actualizar el estado de una orden de compra
 * Opcional: Actualizar precio unitario de los detalles
 */
export interface UpdatePurchaseOrderStatusDto {
  status: PurchaseOrderStatus;
  details?: {
    detailId: string; // UUID v4
    unitPrice: number;
  }[];
}

/**
 * DTO para crear una recepción de mercancía
 */
export interface CreateGoodReceiptDto {
  purchaseOrderId: string; // UUID v4
  receivedDate?: string;
  notes?: string;
  details: {
    purchaseOrderDetailId: string; // UUID v4
    quantityReceived: number;
    notes?: string;
  }[];
}

// Re-exportar InputUnit para compatibilidad
export type { InputUnit };
