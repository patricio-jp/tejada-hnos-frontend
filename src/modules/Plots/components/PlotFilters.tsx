import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Variety } from '@/types/varieties';
// 1. Importar tipo Field
import type { Field } from '@/types/fields'; // O '@/lib/map-types' según uses

export interface PlotFiltersState {
  fieldId?: string;   // <--- Nuevo filtro
  varietyId?: string;
  minArea?: number;
  maxArea?: number;
  withDeleted?: boolean;
}

interface PlotFiltersProps {
  filters: PlotFiltersState;
  onFiltersChange: (filters: PlotFiltersState) => void;
  varieties: Variety[];
  fields: Field[]; // <--- Recibimos la lista de campos
}

export function PlotFilters({ filters, onFiltersChange, varieties, fields }: PlotFiltersProps) {
  // 2. Estado local para el campo
  const [fieldId, setFieldId] = useState(filters.fieldId || '');
  const [varietyId, setVarietyId] = useState(filters.varietyId || '');
  const [minArea, setMinArea] = useState(filters.minArea?.toString() || '');
  const [maxArea, setMaxArea] = useState(filters.maxArea?.toString() || '');
  const [withDeleted, setWithDeleted] = useState(filters.withDeleted || false);

  const handleApplyFilters = () => {
    onFiltersChange({
      fieldId: fieldId || undefined, // <--- Enviamos el filtro
      varietyId: varietyId || undefined,
      minArea: minArea ? Number(minArea) : undefined,
      maxArea: maxArea ? Number(maxArea) : undefined,
      withDeleted: withDeleted
    });
  };

  const handleClearFilters = () => {
    setFieldId(''); // <--- Limpiamos
    setVarietyId('');
    setMinArea('');
    setMaxArea('');
    setWithDeleted(false);
    onFiltersChange({ withDeleted: false });
  };

  useEffect(() => {
    setFieldId(filters.fieldId || '');
    setVarietyId(filters.varietyId || '');
    setMinArea(filters.minArea?.toString() || '');
    setMaxArea(filters.maxArea?.toString() || '');
    setWithDeleted(filters.withDeleted || false);
  }, [filters]);

  return (
    <div className="flex flex-col gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
      <div className="flex flex-wrap gap-4 items-end">
        
        {/* --- NUEVO: Filtro Campo --- */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">
            Filtrar por Campo
          </label>
          <div className="relative">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={fieldId}
              onChange={(e) => setFieldId(e.target.value)}
            >
              <option value="">-- Todos los campos --</option>
              {fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtro Variedad */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">
            Filtrar por Variedad
          </label>
          <div className="relative">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={varietyId}
              onChange={(e) => setVarietyId(e.target.value)}
            >
              <option value="">-- Todas las variedades --</option>
              {varieties.map((variety) => (
                <option key={variety.id} value={variety.id}>
                  {variety.name}
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
            step="0.01"
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
            step="0.01"
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
            id="show-deleted-plots" 
            checked={withDeleted}
            onCheckedChange={(checked) => {
              setWithDeleted(checked as boolean);
            }}
          />
          <Label 
            htmlFor="show-deleted-plots" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Mostrar parcelas eliminadas (Papelera)
          </Label>
        </div>
      </div>
    </div>
  );
}