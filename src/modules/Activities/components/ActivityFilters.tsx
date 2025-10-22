// src/modules/Activities/components/ActivityFilters.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActivityFilters as Filters, ActivityType } from '../types/activity';
import { getActivityTypeLabel, getStatusLabel } from '../utils/activity-utils';
import { X } from 'lucide-react';

interface ActivityFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const ACTIVITY_TYPES: ActivityType[] = ['poda', 'riego', 'aplicacion', 'cosecha', 'otro'];
const STATUSES = ['pendiente', 'en-progreso', 'completada', 'cancelada'] as const;

export function ActivityFilters({ filters, onFiltersChange }: ActivityFiltersProps) {
  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Búsqueda de texto */}
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <Input
            id="search"
            placeholder="Descripción, parcela o usuario..."
            value={filters.searchTerm || ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, searchTerm: e.target.value })
            }
          />
        </div>

        {/* Tipo de actividad */}
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Actividad</Label>
          <select
            id="type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filters.type || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                type: e.target.value ? (e.target.value as ActivityType) : undefined,
              })
            }
          >
            <option value="">Todas</option>
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {getActivityTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filters.status || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: e.target.value ? (e.target.value as 'pendiente' | 'en-progreso' | 'completada' | 'cancelada') : undefined,
              })
            }
          >
            <option value="">Todos</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha desde */}
        <div className="space-y-2">
          <Label htmlFor="dateFrom">Fecha desde</Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                dateFrom: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
          />
        </div>

        {/* Fecha hasta */}
        <div className="space-y-2">
          <Label htmlFor="dateTo">Fecha hasta</Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                dateTo: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
