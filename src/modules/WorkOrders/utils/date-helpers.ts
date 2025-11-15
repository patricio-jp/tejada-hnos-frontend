import { differenceInDays, isPast, isToday } from "date-fns";

export type DateStatus = 'overdue' | 'due-soon' | 'upcoming';

export interface DateWarning {
  status: DateStatus;
  message: string;
  daysRemaining: number;
}

/**
 * Calcula el estado de una fecha límite
 * @param dueDate Fecha límite
 * @param threshold Días antes de la fecha para considerar "próximo a vencer" (default: 3)
 * @returns Estado de la fecha y días restantes
 */
export function getDateWarning(dueDate: string | Date, threshold: number = 3): DateWarning | null {
  const due = new Date(dueDate);
  const now = new Date();
  
  // Normalizar fechas a medianoche para comparación precisa
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const daysRemaining = differenceInDays(due, now);
  
  // Vencida
  if (isPast(due) && !isToday(due)) {
    return {
      status: 'overdue',
      message: daysRemaining === -1 ? 'Venció ayer' : `Venció hace ${Math.abs(daysRemaining)} días`,
      daysRemaining,
    };
  }
  
  // Vence hoy
  if (isToday(due)) {
    return {
      status: 'due-soon',
      message: 'Vence hoy',
      daysRemaining: 0,
    };
  }
  
  // Próximo a vencer (dentro del threshold)
  if (daysRemaining <= threshold && daysRemaining > 0) {
    return {
      status: 'due-soon',
      message: daysRemaining === 1 ? 'Vence mañana' : `Vence en ${daysRemaining} días`,
      daysRemaining,
    };
  }
  
  // No hay advertencia necesaria
  return null;
}

/**
 * Obtiene la clase CSS para el badge de fecha
 */
export function getDateBadgeVariant(status: DateStatus | null): 'destructive' | 'warning' | 'secondary' | 'default' {
  if (!status) return 'default';
  
  switch (status) {
    case 'overdue':
      return 'destructive';
    case 'due-soon':
      return 'warning';
    default:
      return 'default';
  }
}
