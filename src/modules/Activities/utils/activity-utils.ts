// src/modules/Activities/utils/activity-utils.ts
import type { ActivityType } from '../types/activity';

export function getActivityTypeLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    poda: 'Poda',
    riego: 'Riego',
    aplicacion: 'Aplicación',
    cosecha: 'Cosecha',
    otro: 'Otro',
  };
  return labels[type];
}

export function getActivityTypeColor(type: ActivityType): string {
  const colors: Record<ActivityType, string> = {
    poda: 'bg-blue-500',
    riego: 'bg-cyan-500',
    aplicacion: 'bg-purple-500',
    cosecha: 'bg-amber-500',
    otro: 'bg-gray-500',
  };
  return colors[type];
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'pendiente': 'Pendiente',
    'en-progreso': 'En Progreso',
    'completada': 'Completada',
    'cancelada': 'Cancelada',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'pendiente': 'bg-yellow-500',
    'en-progreso': 'bg-blue-500',
    'completada': 'bg-green-500',
    'cancelada': 'bg-red-500',
  };
  return colors[status] || 'bg-gray-500';
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function isUpcoming(date: Date): boolean {
  return date > new Date();
}

export function isOverdue(date: Date, status: string): boolean {
  return date < new Date() && (status === 'pendiente' || status === 'en-progreso');
}
