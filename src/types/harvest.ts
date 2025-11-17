/**
 * Tipos e interfaces para el módulo de HarvestLots
 */
import type { Plot } from './plots';
import type { ShipmentItem } from './shipments';

/**
 * Calibres disponibles para los lotes de cosecha
 */
export const WalnutCaliber = {
  JUMBO: 'JUMBO', // Extra grandes
  LARGE: 'LARGE', // Grandes
  MEDIUM: 'MEDIUM', // Medianas
  SMALL: 'SMALL', // Pequeñas
  HALVES: 'HALVES', // Partidas (mitades)
  PIECES: 'PIECES', // Trozos
}
export type WalnutCaliber = typeof WalnutCaliber[keyof typeof WalnutCaliber];

/**
 * Estados posibles de un lote de cosecha
 */
export const HarvestLotStatus = {
  PENDIENTE_PROCESO: 'PENDIENTE_PROCESO',
  EN_STOCK: 'EN_STOCK',
  VENDIDO: 'VENDIDO',
} as const;

export type HarvestLotStatus = typeof HarvestLotStatus[keyof typeof HarvestLotStatus];

/**
 * Lote de cosecha
 */
export interface HarvestLot {
  id: string;
  plotId: string;
  plot?: Plot;
  harvestDate: string;
  lotCode: string;
  varietyName: string;
  caliber?: WalnutCaliber;
  grossWeightKg: number; // en kg
  netWeightKg?: number | null; // en kg
  yieldPercentage?: number; // porcentaje de rendimiento
  status: HarvestLotStatus;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  shipmentsDetails?: ShipmentItem[]; // Detalles de envíos asociados (opcional)
}

