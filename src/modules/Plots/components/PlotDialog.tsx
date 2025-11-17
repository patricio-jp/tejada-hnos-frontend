/**
 * PlotDialog - Modal para crear/editar plots
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlotForm } from './PlotForm';
import type { Plot } from '@/types/plots';
import type { Variety } from '@/types/varieties';
import type { UpdatePlotDto, CreatePlotDto } from '../utils/plot-api';

interface PlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plot?: Plot;
  varieties: Variety[];
  loading?: boolean;
  onSubmit: (data: CreatePlotDto | UpdatePlotDto) => Promise<void>;
}

export function PlotDialog({
  open,
  onOpenChange,
  plot,
  varieties,
  loading,
  onSubmit,
}: PlotDialogProps) {
  const isEditMode = !!plot;

  const handleSubmit = async (data: CreatePlotDto | UpdatePlotDto) => {
    try {
      await onSubmit(data);
      // Cerrar el diálogo después de guardar
      onOpenChange(false);
    } catch (error) {
      console.error('Error en PlotDialog:', error);
      // No cerrar el diálogo si hay error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Parcela' : 'Crear Nueva Parcela'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Actualiza los detalles de la parcela'
              : 'Completa el formulario para crear una nueva parcela'}
          </DialogDescription>
        </DialogHeader>

        <PlotForm
          plot={plot}
          varieties={varieties}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

export default PlotDialog;
