import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SupplierForm } from './SupplierForm';
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from '../types/supplier';

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier;
  onSubmit: (data: CreateSupplierDto | UpdateSupplierDto) => Promise<void>;
}

export function SupplierDialog({ open, onOpenChange, supplier, onSubmit }: SupplierDialogProps) {
  const handleSubmit = async (data: CreateSupplierDto | UpdateSupplierDto) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>
          <DialogDescription>
            {supplier
              ? 'Modifica los datos del proveedor'
              : 'Completa los datos del nuevo proveedor'}
          </DialogDescription>
        </DialogHeader>
        <SupplierForm
          supplier={supplier}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
