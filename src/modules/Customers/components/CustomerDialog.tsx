import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomerForm } from './CustomerForm';
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/types';

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  onSubmit: (data: CreateCustomerDto | UpdateCustomerDto) => Promise<void>;
}

export function CustomerDialog({ open, onOpenChange, customer, onSubmit }: CustomerDialogProps) {
  const handleSubmit = async (data: CreateCustomerDto | UpdateCustomerDto) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? 'Modifica los datos del cliente'
              : 'Completa los datos del nuevo cliente'}
          </DialogDescription>
        </DialogHeader>
        <CustomerForm
          customer={customer}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
