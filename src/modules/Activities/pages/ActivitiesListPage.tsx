// src/modules/Activities/pages/ActivitiesListPage.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useActivities } from '../hooks/useActivities';
import { ActivitiesTable } from '../components/ActivitiesTable';
import { ActivityFilters } from '../components/ActivityFilters';
import { ActivityFormDialog } from '../components/ActivityFormDialog';
import type { Activity } from '../types/activity';
import { Plus, Filter } from 'lucide-react';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

export default function ActivitiesListPage() {
  const { activities, addActivity, updateActivity, filters, setFilters } = useActivities();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
          <h1 className="text-3xl font-bold tracking-tight">Actividades</h1>
          <p className="text-muted-foreground">
            Listado completo de actividades agrícolas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFiltersOpen(!filtersOpen)}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button onClick={handleNewActivity}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Actividad
          </Button>
        </div>
      </div>

      {/* Filtros colapsables */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleContent>
          <ActivityFilters filters={filters} onFiltersChange={setFilters} />
        </CollapsibleContent>
      </Collapsible>

      {/* Contador de resultados */}
      <div className="text-sm text-muted-foreground">
        {activities.length} {activities.length === 1 ? 'actividad encontrada' : 'actividades encontradas'}
      </div>

      {/* Tabla de actividades */}
      <ActivitiesTable 
        activities={activities}
        onEdit={handleEditActivity}
      />

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
