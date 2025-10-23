// src/modules/Activities/types/activity.ts

export const ACTIVITY_TYPES = ['poda', 'riego', 'aplicacion', 'cosecha', 'otro'] as const;
export type ActivityType = typeof ACTIVITY_TYPES[number];

export interface Activity {
  id: string;
  activityType: ActivityType;
  description: string;
  executionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  plotId: string;
  createdByUserId: string;
  plotName?: string; // Campo auxiliar para UI
  status: 'pendiente' | 'en-progreso' | 'completada' | 'cancelada';
}

export interface ActivityFilters {
  activityType?: ActivityType;
  status?: Activity['status'];
  plotId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface CreateActivityPayload {
  activityType: ActivityType;
  description: string;
  executionDate: Date;
  plotId: string;
}

export interface UpdateActivityPayload {
  activityType?: ActivityType;
  description?: string;
  executionDate?: Date;
  plotId?: string;
}
