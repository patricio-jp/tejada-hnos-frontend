// src/modules/Purchases/types/index.ts

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
 * Unidades de medida para insumos (debe coincidir con backend)
 */
export const InputUnit = {
  KG: "KG",
  LITRO: "LITRO",
  UNIDAD: "UNIDAD",
} as const;

export type InputUnit = typeof InputUnit[keyof typeof InputUnit];

/**
 * Etiquetas legibles para las unidades
 */
export const InputUnitLabels: Record<InputUnit, string> = {
  [InputUnit.KG]: "Kilogramos",
  [InputUnit.LITRO]: "Litros",
  [InputUnit.UNIDAD]: "Unidades",
};

/**
 * Proveedor (será manejado por otro módulo)
 */
export interface Supplier {
  id: string; // UUID v4
  name: string;
  taxId?: string;
  address?: string;
  contactEmail?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Insumo (será manejado por otro módulo)
 */
export interface Input {
  id: string; // UUID v4
  name: string;
  unit: InputUnit; // Unidad de medida (KG, LITRO, UNIDAD)
  stock?: number;
  costPerUnit?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Detalle de una orden de compra (item individual)
 * IMPORTANTE: Debe coincidir con backend PurchaseOrderDetail entity
 */
export interface PurchaseOrderDetail {
  id?: string; // UUID v4
  purchaseOrderId?: string; // UUID v4
  inputId: string; // UUID v4
  input?: Input; // Populated cuando se obtiene del servidor
  quantity: number; // Cantidad solicitada
  unitPrice: number; // Precio unitario de compra
  quantityReceived?: number; // Calculado por backend desde receiptDetails
  quantityPending?: number; // Calculado por backend
  isFullyReceived?: boolean; // Calculado por backend
  receiptDetails?: GoodReceiptDetail[]; // Relación con recepciones
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
  receipts?: GoodReceipt[]; // Relación con recepciones (se llama 'receipts' en backend)
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/**
 * Recepción de mercancía
 */
export interface GoodReceipt {
  id?: string; // UUID v4
  purchaseOrderId: string; // UUID v4
  purchaseOrder?: PurchaseOrder;
  receivedDate: string;
  receivedBy?: string; // UUID v4 del usuario
  receivedByName?: string; // Nombre del usuario que recibió
  notes?: string;
  details?: GoodReceiptDetail[]; // Detalles de lo recibido
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Detalle de recepción de mercancía
 */
export interface GoodReceiptDetail {
  id?: string; // UUID v4
  goodReceiptId?: string; // UUID v4
  purchaseOrderDetailId: string; // UUID v4
  inputId: string; // UUID v4
  input?: Input;
  quantityReceived: number;
  notes?: string;
}

/**
 * DTO para crear una orden de compra
 * IMPORTANTE: Debe coincidir con backend CreatePurchaseOrderDto
 */
export interface CreatePurchaseOrderDto {
  supplierId: string; // UUID v4
  status: string; // Estado inicial (generalmente 'PENDIENTE')
  totalAmount: number; // Monto total calculado
  details: {
    inputId: string; // UUID v4
    quantity: number; // Cantidad solicitada
    unitPrice: number; // Precio unitario
  }[];
}

/**
 * DTO para actualizar una orden de compra
 * IMPORTANTE: Debe coincidir con backend UpdatePurchaseOrderDto
 */
export interface UpdatePurchaseOrderDto {
  supplierId?: string; // UUID v4
  status?: string;
  totalAmount?: number;
  details?: {
    inputId: string; // UUID v4
    quantity: number;
    unitPrice: number;
  }[];
}

/**
 * DTO para crear una recepción de mercancía
 */
export interface CreateGoodReceiptDto {
  purchaseOrderId: string; // UUID v4
  receivedDate: string;
  notes?: string;
  details: {
    purchaseOrderDetailId: string; // UUID v4
    inputId: string; // UUID v4
    quantityReceived: number;
    notes?: string;
  }[];
}
