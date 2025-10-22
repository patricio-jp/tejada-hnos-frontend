// src/modules/Activities/components/ActivityFormDialog.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Activity, ActivityType } from '../types/activity';
import { getActivityTypeLabel, getStatusLabel } from '../utils/activity-utils';
import { MOCK_FIELDS } from '@/lib/mock-data';

interface ActivityFormDialogProps {
  activity?: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (activity: Activity) => void;
}

const ACTIVITY_TYPES: ActivityType[] = ['poda', 'riego', 'aplicacion', 'cosecha', 'otro'];
const STATUSES = ['pendiente', 'en-progreso', 'completada', 'cancelada'] as const;

export function ActivityFormDialog({
  activity,
  open,
  onOpenChange,
  onSave,
}: ActivityFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Activity>>({
    type: 'otro',
    description: '',
    executionDate: new Date(),
    plotId: '',
    status: 'pendiente',
  });

  useEffect(() => {
    if (activity) {
      setFormData(activity);
    } else {
      setFormData({
        type: 'otro',
        description: '',
        executionDate: new Date(),
        plotId: '',
        status: 'pendiente',
      });
    }
  }, [activity, open]);

  const handleSave = () => {
    if (!formData.description || !formData.plotId || !formData.executionDate) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const selectedPlot = MOCK_FIELDS.flatMap(f => f.plots).find(p => p.id === formData.plotId);

    const activityToSave: Activity = {
      id: activity?.id || `act-${Date.now()}`,
      type: formData.type as ActivityType,
      description: formData.description,
      createdAt: activity?.createdAt || new Date(),
      executionDate: new Date(formData.executionDate),
      createdBy: activity?.createdBy || 'Usuario Actual',
      plotId: formData.plotId,
      plotName: selectedPlot?.properties.name || formData.plotName,
      status: formData.status as Activity['status'],
    };

    onSave(activityToSave);
    onOpenChange(false);
  };

  // Obtener todas las parcelas de todos los campos
  const allPlots = MOCK_FIELDS.flatMap(field =>
    field.plots.map(plot => ({
      id: plot.id as string,
      name: plot.properties.name,
      fieldName: field.boundary.properties.name,
    }))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{activity ? 'Editar Actividad' : 'Nueva Actividad'}</DialogTitle>
          <DialogDescription>
            Complete la información de la actividad agrícola
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Tipo de actividad */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipo *
            </Label>
            <select
              id="type"
              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as ActivityType })
              }
            >
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {getActivityTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Descripción *
            </Label>
            <textarea
              id="description"
              className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción detallada de la actividad..."
            />
          </div>

          {/* Parcela */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plot" className="text-right">
              Parcela *
            </Label>
            <select
              id="plot"
              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.plotId}
              onChange={(e) => setFormData({ ...formData, plotId: e.target.value })}
            >
              <option value="">Seleccione una parcela</option>
              {allPlots.map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.name} ({plot.fieldName})
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de ejecución */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="executionDate" className="text-right">
              Fecha Ejecución *
            </Label>
            <Input
              id="executionDate"
              type="date"
              className="col-span-3"
              value={
                formData.executionDate
                  ? new Date(formData.executionDate).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  executionDate: new Date(e.target.value),
                })
              }
            />
          </div>

          {/* Estado */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Estado
            </Label>
            <select
              id="status"
              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as Activity['status'] })
              }
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {activity ? 'Guardar Cambios' : 'Crear Actividad'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
