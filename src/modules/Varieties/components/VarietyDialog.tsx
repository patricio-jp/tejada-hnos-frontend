import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VarietyForm } from './VarietyForm';
import type { Variety, CreateVarietyDto, UpdateVarietyDto } from '@/types';

interface VarietyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variety?: Variety;
  onSubmit: (data: CreateVarietyDto | UpdateVarietyDto) => Promise<void>;
}

export function VarietyDialog({ open, onOpenChange, variety, onSubmit }: VarietyDialogProps) {
  const handleSubmit = async (data: CreateVarietyDto | UpdateVarietyDto) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {variety ? 'Editar Variedad' : 'Nueva Variedad'}
          </DialogTitle>
          <DialogDescription>
            {variety
              ? 'Modifica los datos de la variedad'
              : 'Completa los datos de la nueva variedad'}
          </DialogDescription>
        </DialogHeader>
        <VarietyForm
          variety={variety}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
