/**
 * Tipos para Work Orders y Activities basados en el backend
 */

export const WorkOrderStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  UNDER_REVIEW: 'UNDER_REVIEW',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type WorkOrderStatus = typeof WorkOrderStatus[keyof typeof WorkOrderStatus];

export const ActivityType = {
  PODA: 'PODA',
  RIEGO: 'RIEGO',
  APLICACION: 'APLICACION',
  COSECHA: 'COSECHA',
  MANTENIMIENTO: 'MANTENIMIENTO',
  MONITOREO: 'MONITOREO',
  OTRO: 'OTRO',
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

export const ActivityStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ActivityStatus = typeof ActivityStatus[keyof typeof ActivityStatus];

export const InputUnit = {
  KG: 'KG',
  LITRO: 'LITRO',
  UNIDAD: 'UNIDAD',
} as const;

export type InputUnit = typeof InputUnit[keyof typeof InputUnit];

export interface Field {
  id: string;
  name: string;
  location?: any;
}

export interface Variety {
  id: string;
  name: string;
}

export interface Plot {
  id: string;
  name: string;
  area: number;
  fieldId: string;
  field?: Field;
  varietyId?: string;
  variety?: Variety;
  datePlanted?: string;
  location: any; // GeoJSON Polygon
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface InputUsage {
  id: string;
  quantityUsed: number;
  activityId: string;
  inputId: string;
  input?: Input;
}

export interface Input {
  id: string;
  name: string;
  unit: InputUnit;
  stock: number;
  costPerUnit: number;
}

export interface Activity {
  id: string;
  workOrderId: string;
  type: ActivityType;
  status: ActivityStatus;
  executionDate: string;
  hoursWorked: number;
  details?: any;
  inputsUsed?: InputUsage[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  dueDate: string;
  completedDate: string | null;
  status: WorkOrderStatus;
  assignedToId: string | null;
  assignedTo: User | null;
  plots: Plot[];
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityDto {
  workOrderId: string;
  type: ActivityType;
  executionDate: string;
  hoursWorked: number;
  details?: any;
  inputsUsed?: Array<{
    inputId: string;
    quantityUsed: number;
  }>;
}
