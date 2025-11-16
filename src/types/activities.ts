/**
 * Tipos e interfaces para el módulo de Activities
 */

import type { InputUsage } from "./inputs";
import type { WorkOrder } from "./work-orders";

export const ActivityType = {
  PODA: 'PODA',
  RIEGO: 'RIEGO',
  APLICACION: 'APLICACION',
  COSECHA: 'COSECHA',
  MANTENIMIENTO: 'MANTENIMIENTO',
  MONITOREO: 'MONITOREO',
  OTRO: 'OTRO',
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

export const ActivityStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ActivityStatus = typeof ActivityStatus[keyof typeof ActivityStatus];

export interface Activity {
  id: string;
  workOrderId: string;
  workOrder?: WorkOrder;
  type: ActivityType;
  status: ActivityStatus;
  executionDate: Date;
  hoursWorked: number;
  details?: any;
  inputsUsed?: InputUsage[];
  createdAt: Date;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ActivityFilters {
  workOrderId?: string;
  type?: ActivityType;
  startDate?: Date;
  endDate?: Date;
  managedFieldIds?: string[]; // Para filtrar por campos gestionados (CAPATAZ)
  assignedToId?: string; // Para filtrar por OTs asignadas (OPERARIO)
  searchTerm?: string;
}

export interface ActivityStats {
  total: number;
  pendiente: number;
  enProgreso: number;
  completada: number;
  cancelada: number;
}

/**
 * DTO para crear una actividad
 */
export interface CreateActivityDTO {
  workOrderId: string;
  type: ActivityType;
  executionDate: string;
  hoursWorked: number;
  details?: any;
  inputsUsed?: Array<{
    inputId: string;
    quantityUsed: number;
  }>;
}

/**
 * DTO para actualizar una actividad
 */
export type UpdateActivityDTO = Partial<CreateActivityDTO>;
