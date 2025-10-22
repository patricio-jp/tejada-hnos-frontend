// src/modules/Activities/hooks/useActivities.ts
import { useState, useMemo } from 'react';
import type { Activity, ActivityFilters } from '../types/activity';
import { getMockActivities } from '../data/mock-activities';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>(getMockActivities());
  const [filters, setFilters] = useState<ActivityFilters>({});

  const filteredActivities = useMemo(() => {
    let result = [...activities];

    if (filters.type) {
      result = result.filter(act => act.type === filters.type);
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
        act.createdBy.toLowerCase().includes(term)
      );
    }

    // Ordenar por fecha de ejecución (más próximas primero)
    result.sort((a, b) => a.executionDate.getTime() - b.executionDate.getTime());

    return result;
  }, [activities, filters]);

  const addActivity = (activity: Activity) => {
    setActivities(prev => [...prev, activity]);
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, ...updates } : act))
    );
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(act => act.id !== id));
  };

  return {
    activities: filteredActivities,
    allActivities: activities,
    filters,
    setFilters,
    addActivity,
    updateActivity,
    deleteActivity,
  };
}
