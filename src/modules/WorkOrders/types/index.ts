import type { Plot } from '@/lib/map-types';

export type WorkOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  scheduledDate: string;
  dueDate: string;
  assignedTo: {
    id: string;
    name: string;
  };
  plots: Plot[];
}

export interface CreateWorkOrderInput {
  title: string;
  description: string;
  scheduledDate: string;
  dueDate: string;
  plotIds: string[];
}
