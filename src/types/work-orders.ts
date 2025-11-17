/**
 * Tipos e interfaces para el módulo de Work Orders
 */

import type { Plot } from './plots';
import type { User } from './user';
import type { Activity } from './activities';

/**
 * Estados posibles de una orden de trabajo
 */
export const WorkOrderStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  UNDER_REVIEW: 'UNDER_REVIEW',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type WorkOrderStatus = typeof WorkOrderStatus[keyof typeof WorkOrderStatus];

/**
 * Orden de trabajo
 */
export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  dueDate: string;
  completedDate: string | null;
  status: WorkOrderStatus;
  assignedToId: string | null;
  assignedTo: User | null;
  plots: Plot[];
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface WorkOrdersFilters {
  status?: WorkOrderStatus[];
  assignedToId?: string;
  startDate?: string;
  endDate?: string;
  plotId?: string[];
  managedFieldIds?: string[]; // Para filtrar por campos gestionados (CAPATAZ)
  searchTerm?: string;
}

/**
 * DTO para crear una orden de trabajo
 */
export interface CreateWorkOrderDTO {
  title: string;
  description: string;
  scheduledDate: string;
  dueDate: string;
  plotIds: string[];
  assignedToId?: string;
}

/**
 * DTO para actualizar una orden de trabajo
 */
export type UpdateWorkOrderDTO = Partial<CreateWorkOrderDTO> & {
  status?: WorkOrderStatus;
};

/**
 * Estados de fecha para órdenes de trabajo
 */
export type DateStatus = 'overdue' | 'due-soon' | 'upcoming';

/**
 * Advertencia de fecha
 */
export interface DateWarning {
  status: DateStatus;
  message: string;
  daysUntilDue?: number;
}
