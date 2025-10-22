// src/modules/Activities/components/ActivityCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Activity } from '../types/activity';
import {
  getActivityTypeLabel,
  getActivityTypeColor,
  getStatusLabel,
  getStatusColor,
  formatDate,
  isOverdue,
} from '../utils/activity-utils';
import { Calendar, MapPin, User, Clock } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onEdit?: (activity: Activity) => void;
  onView?: (activity: Activity) => void;
  compact?: boolean;
}

export function ActivityCard({ activity, onEdit, onView, compact = false }: ActivityCardProps) {
  const isLate = isOverdue(activity.executionDate, activity.status);

  return (
    <Card className={`hover:shadow-md transition-shadow ${isLate ? 'border-red-300' : ''}`}>
      <CardHeader className={compact ? 'pb-2' : ''}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getActivityTypeColor(activity.type)}>
                {getActivityTypeLabel(activity.type)}
              </Badge>
              <Badge variant="outline" className={getStatusColor(activity.status)}>
                {getStatusLabel(activity.status)}
              </Badge>
              {isLate && (
                <Badge variant="destructive" className="text-xs">
                  Vencida
                </Badge>
              )}
            </div>
            {!compact && (
              <CardTitle className="text-lg">{activity.description}</CardTitle>
            )}
          </div>
        </div>
        {compact && (
          <CardDescription className="line-clamp-2">{activity.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className={compact ? 'pt-2' : ''}>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Ejecución: {formatDate(activity.executionDate)}</span>
          </div>
          {activity.plotName && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{activity.plotName}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Creada por: {activity.createdBy}</span>
          </div>
          {!compact && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Creada: {formatDate(activity.createdAt)}</span>
            </div>
          )}
        </div>
        {(onEdit || onView) && (
          <div className="flex gap-2 mt-4">
            {onView && (
              <Button variant="outline" size="sm" onClick={() => onView(activity)}>
                Ver detalles
              </Button>
            )}
            {onEdit && (
              <Button variant="default" size="sm" onClick={() => onEdit(activity)}>
                Editar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
