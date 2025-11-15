import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { WorkOrderStatus } from '../types/work-orders';

interface WorkOrderActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: {
    label: string;
    nextStatus: WorkOrderStatus;
    description: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  };
  onConfirm: (nextStatus: WorkOrderStatus) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function WorkOrderActionDialog({
  open,
  onOpenChange,
  action,
  onConfirm,
  loading,
  error,
}: WorkOrderActionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(action.nextStatus);
      onOpenChange(false);
    } catch {
      // Error handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action.label}</DialogTitle>
          <DialogDescription>{action.description}</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || loading}
          >
            Cancelar
          </Button>
          <Button
            variant={action.variant || 'default'}
            onClick={handleConfirm}
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? 'Procesando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
