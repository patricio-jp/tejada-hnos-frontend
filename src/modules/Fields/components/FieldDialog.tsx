import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FieldForm } from './FieldForm';
import type { Field } from '@/lib/map-types';
import type { CreateFieldDto, UpdateFieldDto } from '../utils/field-api';

interface FieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field?: Field;
  onSubmit: (data: CreateFieldDto | UpdateFieldDto) => Promise<void>;
  initialLocation?: any;
}

export function FieldDialog({ open, onOpenChange, field, onSubmit, initialLocation }: FieldDialogProps) {
  const handleSubmit = async (data: CreateFieldDto | UpdateFieldDto) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {field ? 'Editar Campo' : 'Crear Nuevo Campo'}
          </DialogTitle>
          <DialogDescription>
            {field 
              ? 'Modifica los datos del campo. El polígono se puede editar en el mapa.' 
              : 'Dibuja el polígono en el mapa y completa la información.'}
          </DialogDescription>
        </DialogHeader>
        <FieldForm
          field={field}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialLocation={initialLocation}
        />
      </DialogContent>
    </Dialog>
  );
}
