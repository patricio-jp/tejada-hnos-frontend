// src/lib/mock-picking-data.ts

import { SalesOrderStatus, SalesOrderDetailStatus } from '@/types/sales';
import type { SalesOrder } from '@/types/sales';
import type { InventoryLot } from '@/types/picking';

// --- 1. STOCK DISPONIBLE (HarvestLots) ---
export const MOCK_INVENTORY: InventoryLot[] = [
  {
    id: 'uuid-lote-h5',
    code: 'Lote H-5',
    variety: { id: 'var-chandler', name: 'Chandler' },
    remainingNetWeightKg: 2500,
    location: 'Galpón A - Sector 1'
  },
  {
    id: 'uuid-lote-a1',
    code: 'Lote A-1',
    variety: { id: 'var-chandler', name: 'Chandler' },
    remainingNetWeightKg: 200, 
    location: 'Galpón B'
  },
  {
    id: 'uuid-lote-s9',
    code: 'Lote S-9',
    variety: { id: 'var-serr', name: 'Serr' },
    remainingNetWeightKg: 5000,
    location: 'Cámara Frío 1'
  }
];

// --- 2. PEDIDOS PARA DESPACHAR (SalesOrders) ---
// Nota: Casteamos 'customer' como any porque no tenemos el tipo Customer completo aquí,
// pero simulamos los datos que necesitamos para la UI.
export const MOCK_ORDERS: SalesOrder[] = [
  {
    id: 'order-1001',
    customerId: 'cust-1',
    customer: { 
      id: 'cust-1', 
      name: 'Distribuidora El Nogal', 
      taxId: '20-12345678-9',
      address: 'Av. Industrial 500'
    } as any,
    status: SalesOrderStatus.APROBADA, // Estado listo para picking
    totalAmount: 15000,
    createdAt: '2024-03-20T10:00:00Z',
    details: [
      {
        id: 'line-1',
        salesOrderId: 'order-1001',
        caliber: '30-32',
        variety: 'Chandler', // En Sales es string
        unitPrice: 10,
        quantityKg: 1000, // Piden 1000
        quantityShipped: 0,
        status: SalesOrderDetailStatus.PENDIENTE
      },
      {
        id: 'line-2',
        salesOrderId: 'order-1001',
        caliber: '28-30',
        variety: 'Serr',
        unitPrice: 8,
        quantityKg: 500,
        quantityShipped: 0,
        status: SalesOrderDetailStatus.PENDIENTE
      }
    ]
  },
  {
    id: 'order-1002',
    customerId: 'cust-2',
    customer: { 
      id: 'cust-2', 
      name: 'Supermercados Norte', 
      taxId: '30-87654321-0',
      address: 'Ruta Nacional 9 km 10'
    } as any,
    status: SalesOrderStatus.DESPACHADA_PARCIAL, // Ya se envió algo
    totalAmount: 24000,
    createdAt: '2024-03-21T14:30:00Z',
    details: [
      {
        id: 'line-3',
        salesOrderId: 'order-1002',
        caliber: '34+',
        variety: 'Chandler',
        unitPrice: 12,
        quantityKg: 2000,
        quantityShipped: 500, // Faltan 1500
        status: SalesOrderDetailStatus.DESPACHADA_PARCIAL
      }
    ]
  }
];