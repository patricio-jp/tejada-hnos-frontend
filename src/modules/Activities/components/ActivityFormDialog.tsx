// src/modules/Activities/components/ActivityFormDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Activity, CreateActivityPayload } from '../types/activity';
import { ACTIVITY_TYPES, type ActivityType } from '../types/activity';
import { getActivityTypeLabel } from '../utils/activity-utils';

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity | null;
  onSave: (activity: Omit<Activity, 'id' | 'createdAt' | 'createdBy'>) => void;
}

export function ActivityFormDialog({
  open,
  onOpenChange,
  activity,
  onSave,
}: ActivityFormDialogProps) {
  const [formData, setFormData] = useState<CreateActivityPayload>(() => {
    if (activity) {
      return {
        activityType: activity.activityType,
        description: activity.description,
        executionDate: activity.executionDate,
        plotId: activity.plotId,
      };
    }
    return {
      activityType: 'otro',
      description: '',
      executionDate: new Date(),
      plotId: '',
    };
  });

  const handleSubmit = async () => {
    try {
      if (!formData.description || !formData.plotId || !formData.executionDate) {
        alert('Por favor complete todos los campos requeridos');
        return;
      }

      const payload: Omit<Activity, 'id' | 'createdAt' | 'createdBy'> = {
        ...formData,
        status: 'pendiente',
        updatedAt: new Date(),
        createdByUserId: '',
      };

      await onSave(payload);
      setFormData({
        activityType: 'otro',
        description: '',
        executionDate: new Date(),
        plotId: '',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error al crear la actividad:', error);
      alert('Ocurrió un error al crear la actividad');
    }
  };

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
            <Label htmlFor="activityType" className="text-right">
              Tipo *
            </Label>
            <select
              id="activityType"
              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.activityType}
              onChange={(e) =>
                setFormData({ ...formData, activityType: e.target.value as ActivityType })
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
            <Label htmlFor="plotId" className="text-right">
              Parcela *
            </Label>
            <select
              id="plotId"
              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.plotId}
              onChange={(e) => setFormData({ ...formData, plotId: e.target.value })}
            >
              <option value="">Seleccione una parcela</option>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {activity ? 'Guardar Cambios' : 'Crear Actividad'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
