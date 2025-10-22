// src/modules/Activities/hooks/useActivityStats.ts
import { useMemo } from 'react';
import type { Activity } from '../types/activity';

export interface ActivityStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  byType: Record<string, number>;
  upcomingThisWeek: number;
}

export function useActivityStats(activities: Activity[]): ActivityStats {
  return useMemo(() => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats: ActivityStats = {
      total: activities.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      byType: {},
      upcomingThisWeek: 0,
    };

    activities.forEach(activity => {
      // Contar por estado
      switch (activity.status) {
        case 'pendiente':
          stats.pending++;
          break;
        case 'en-progreso':
          stats.inProgress++;
          break;
        case 'completada':
          stats.completed++;
          break;
        case 'cancelada':
          stats.cancelled++;
          break;
      }

      // Contar por tipo
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;

      // Contar actividades próximas (esta semana)
      if (
        activity.executionDate >= now &&
        activity.executionDate <= oneWeekFromNow &&
        (activity.status === 'pendiente' || activity.status === 'en-progreso')
      ) {
        stats.upcomingThisWeek++;
      }
    });

    return stats;
  }, [activities]);
}
