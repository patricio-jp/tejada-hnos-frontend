/**
 * Utilidades para determinar permisos de edición de Work Orders
 */

import type { WorkOrder, WorkOrderStatus } from '@/types';

/**
 * Determina si una orden de trabajo puede ser editada según su estado.
 * 
 * Reglas según backend:
 * - COMPLETED: No se puede editar (estado final)
 * - CANCELLED: No se puede editar (estado final)
 * - PENDING, IN_PROGRESS, UNDER_REVIEW: Sí se pueden editar (con restricciones de rol)
 * 
 * @param workOrder - La orden de trabajo a evaluar
 * @returns true si la orden puede editarse, false en caso contrario
 */
export function canEditWorkOrder(workOrder: WorkOrder | null | undefined): boolean {
  if (!workOrder) return false;

  const nonEditableStatuses: WorkOrderStatus[] = ['COMPLETED', 'CANCELLED'];
  
  return !nonEditableStatuses.includes(workOrder.status);
}

/**
 * Obtiene el mensaje de tooltip para botón de edición deshabilitado
 */
export function getEditDisabledReason(workOrder: WorkOrder | null | undefined): string {
  if (!workOrder) return 'Orden no disponible';
  
  if (workOrder.status === 'COMPLETED') {
    return 'No se pueden editar órdenes completadas';
  }
  
  if (workOrder.status === 'CANCELLED') {
    return 'No se pueden editar órdenes canceladas';
  }
  
  return 'No se puede editar esta orden';
}
