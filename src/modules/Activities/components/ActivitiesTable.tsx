// src/modules/Activities/components/ActivitiesTable.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Activity } from '../types/activity';
import {
  getActivityTypeLabel,
  getActivityTypeColor,
  getStatusLabel,
  getStatusColor,
  formatDate,
  isOverdue,
} from '../utils/activity-utils';
import { Pencil } from 'lucide-react';

interface ActivitiesTableProps {
  activities: Activity[];
  onEdit?: (activity: Activity) => void;
}

export function ActivitiesTable({ activities, onEdit }: ActivitiesTableProps) {
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Tipo
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Descripción
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Parcela
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Fecha Ejecución
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Creado por
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Estado
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={7} className="h-24 text-center text-muted-foreground">
                  No se encontraron actividades con los filtros aplicados
                </td>
              </tr>
            ) : (
              activities.map((activity) => {
                const isLate = isOverdue(activity.executionDate, activity.status);
                return (
                  <tr
                    key={activity.id}
                    className={`border-b transition-colors hover:bg-muted/50 ${
                      isLate ? 'bg-red-50 dark:bg-red-950/10' : ''
                    }`}
                  >
                    <td className="p-4 align-middle">
                      <Badge className={getActivityTypeColor(activity.activityType)}>
                        {getActivityTypeLabel(activity.activityType)}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="max-w-md">
                        <p className="line-clamp-2">{activity.description}</p>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="text-sm">{activity.plotName}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{formatDate(activity.executionDate)}</span>
                        {isLate && (
                          <Badge variant="destructive" className="text-xs w-fit">
                            Vencida
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="text-sm">{activity.createdByUserId}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline" className={getStatusColor(activity.status)}>
                        {getStatusLabel(activity.status)}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(activity)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
