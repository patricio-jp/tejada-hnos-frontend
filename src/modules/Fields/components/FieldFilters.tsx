import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { User } from '@/types/user';

export interface FieldFiltersState {
  managerId?: string;
  minArea?: number;
  maxArea?: number;
  withDeleted?: boolean; // Agregamos soporte para soft delete
}

interface FieldFiltersProps {
  filters: FieldFiltersState;
  onFiltersChange: (filters: FieldFiltersState) => void;
  capataces: User[]; // Lista de usuarios para el dropdown
}

export function FieldFilters({ filters, onFiltersChange, capataces }: FieldFiltersProps) {
  const [managerId, setManagerId] = useState(filters.managerId || '');
  const [minArea, setMinArea] = useState(filters.minArea?.toString() || '');
  const [maxArea, setMaxArea] = useState(filters.maxArea?.toString() || '');
  const [withDeleted, setWithDeleted] = useState(filters.withDeleted || false);

  const handleApplyFilters = () => {
    onFiltersChange({
      managerId: managerId || undefined,
      minArea: minArea ? Number(minArea) : undefined,
      maxArea: maxArea ? Number(maxArea) : undefined,
      withDeleted: withDeleted
    });
  };

  const handleClearFilters = () => {
    setManagerId('');
    setMinArea('');
    setMaxArea('');
    setWithDeleted(false);
    onFiltersChange({ withDeleted: false });
  };

  // Sincronizar estado si los props cambian desde fuera
  useEffect(() => {
    setManagerId(filters.managerId || '');
    setMinArea(filters.minArea?.toString() || '');
    setMaxArea(filters.maxArea?.toString() || '');
    setWithDeleted(filters.withDeleted || false);
  }, [filters]);

  return (
    <div className="flex flex-col gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
      <div className="flex flex-wrap gap-4 items-end">
        
        {/* Filtro Capataz */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">
            Filtrar por Capataz
          </label>
          <div className="relative">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
            >
              <option value="">-- Todos los encargados --</option>
              {capataces.map((capataz) => (
                <option key={capataz.id} value={capataz.id}>
                  {capataz.name} {capataz.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rango de Área */}
        <div className="w-[140px]">
          <label className="text-sm font-medium mb-2 block">
            Área Mín (ha)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
            min="0"
            step="0.1"
          />
        </div>

        <div className="w-[140px]">
          <label className="text-sm font-medium mb-2 block">
            Área Máx (ha)
          </label>
          <Input
            type="number"
            placeholder="Max"
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value)}
            min="0"
            step="0.1"
          />
        </div>

        {/* Botones */}
        <div className="flex items-end gap-2 pb-0.5">
          <Button onClick={handleApplyFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Aplicar
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </div>
      
      {/* Checkbox Papelera */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-deleted" 
            checked={withDeleted}
            onCheckedChange={(checked) => {
              setWithDeleted(checked as boolean);
              // Opcional: Auto-aplicar cuando se cambia el checkbox
              // onFiltersChange({ ...filters, withDeleted: checked as boolean });
            }}
          />
          <Label 
            htmlFor="show-deleted" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Mostrar campos eliminados (Papelera de Reciclaje)
          </Label>
        </div>
      </div>
    </div>
  );
}