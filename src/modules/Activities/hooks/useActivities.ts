// src/modules/Activities/hooks/useActivities.ts
import { useState, useMemo, useEffect } from 'react';
import type { 
  Activity, 
  ActivityFilters, 
  CreateActivityPayload, 
  UpdateActivityPayload 
} from '../types/activity';
import { api } from '@/lib/api';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await api.getActivityLogs();
      setActivities(data);
    } catch (err) {
      setError('Error al cargar las actividades');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filteredActivities = useMemo(() => {
    let result = [...activities];

    if (filters.activityType) {
      result = result.filter(act => act.activityType === filters.activityType);
    }

    if (filters.status) {
      result = result.filter(act => act.status === filters.status);
    }

    if (filters.plotId) {
      result = result.filter(act => act.plotId === filters.plotId);
    }

    if (filters.dateFrom) {
      result = result.filter(act => act.executionDate >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      result = result.filter(act => act.executionDate <= filters.dateTo!);
    }

    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(act =>
        act.description.toLowerCase().includes(term) ||
        act.plotName?.toLowerCase().includes(term) ||
        act.createdByUserId.toLowerCase().includes(term)
      );
    }

    // Ordenar por fecha de ejecución (más próximas primero)
    result.sort((a, b) => a.executionDate.getTime() - b.executionDate.getTime());

    return result;
  }, [activities, filters]);

  const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      setLoading(true);
      const newActivity = await api.createActivityLog(activityData);
      setActivities(prev => [newActivity, ...prev]);
      return newActivity;
    } catch (err) {
      setError('Error al crear la actividad');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    try {
      setLoading(true);
      const updatedActivity = await api.updateActivityLog(id, updates);
      setActivities(prev =>
        prev.map(act => (act.id === id ? updatedActivity : act))
      );
      return updatedActivity;
    } catch (err) {
      setError('Error al actualizar la actividad');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      setLoading(true);
      await api.deleteActivityLog(id);
      setActivities(prev => prev.filter(act => act.id !== id));
    } catch (err) {
      setError('Error al eliminar la actividad');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    activities: filteredActivities,
    allActivities: activities,
    loading,
    error,
    filters,
    setFilters,
    addActivity,
    updateActivity,
    deleteActivity,
    refreshActivities: fetchActivities,
  };
}
