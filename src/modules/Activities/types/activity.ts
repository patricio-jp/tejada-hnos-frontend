// src/modules/Activities/types/activity.ts

export type ActivityType = 'poda' | 'riego' | 'aplicacion' | 'cosecha' | 'otro';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  createdAt: Date;
  executionDate: Date;
  createdBy: string;
  plotId: string;
  plotName?: string; // Campo opcional para mostrar el nombre de la parcela
  status: 'pendiente' | 'en-progreso' | 'completada' | 'cancelada';
}

export interface ActivityFilters {
  type?: ActivityType;
  status?: Activity['status'];
  plotId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}
