// src/modules/Activities/components/ActivityFeed.tsx
import { useActivities } from '../hooks/useActivities';
import { ActivityCard } from './ActivityCard';

export function ActivityFeed() {
  const { activities, loading, error } = useActivities();
  const recentActivities = activities
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500 bg-red-50 rounded-lg">
        Error al cargar las actividades recientes
      </div>
    );
  }

  if (recentActivities.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center bg-muted/50 rounded-lg">
        No hay actividades recientes
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentActivities.map(activity => (
        <ActivityCard 
          key={activity.id}
          activity={activity}
          compact
        />
      ))}
    </div>
  );
}