// src/modules/Activities/pages/ActivitiesDashboard.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivities } from '../hooks/useActivities';
import { useActivityStats } from '../hooks/useActivityStats';
import { ActivityStatsCards } from '../components/ActivityStatsCards';
import { ActivityCard } from '../components/ActivityCard';
import { ActivityFormDialog } from '../components/ActivityFormDialog';
import type { Activity } from '../types/activity';
import { Plus } from 'lucide-react';
import { Link } from 'react-router';

export default function ActivitiesDashboard() {
  const { activities, allActivities, addActivity, updateActivity } = useActivities();
  const stats = useActivityStats(allActivities);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Obtener las próximas 5 actividades
  const upcomingActivities = activities
    .filter(act => 
      (act.status === 'pendiente' || act.status === 'en-progreso') &&
      act.executionDate >= new Date()
    )
    .slice(0, 5);

  const handleSaveActivity = (activity: Activity) => {
    if (editingActivity) {
      updateActivity(activity.id, activity);
    } else {
      addActivity(activity);
    }
    setEditingActivity(null);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setDialogOpen(true);
  };

  const handleNewActivity = () => {
    setEditingActivity(null);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Actividades</h1>
          <p className="text-muted-foreground">
            Gestión de actividades agrícolas para producción de nueces
          </p>
        </div>
        <Button onClick={handleNewActivity}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Actividad
        </Button>
      </div>

      {/* Stats Cards */}
      <ActivityStatsCards stats={stats} />

      {/* Distribución por tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Tipo</CardTitle>
          <CardDescription>Actividades organizadas por tipo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex flex-col items-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">{type}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximas Actividades */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Próximas Actividades</h2>
            <p className="text-muted-foreground">
              Actividades programadas para los próximos días
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/activities/list">Ver todas</Link>
          </Button>
        </div>

        {upcomingActivities.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No hay actividades próximas programadas
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onEdit={handleEditActivity}
                compact
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog para crear/editar */}
      <ActivityFormDialog
        activity={editingActivity}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveActivity}
      />
    </div>
  );
}
