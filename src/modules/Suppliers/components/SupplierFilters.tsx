import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import type { SupplierFilters as SupplierFiltersType } from '../types/supplier';

interface SupplierFiltersProps {
  filters: SupplierFiltersType;
  onFiltersChange: (filters: SupplierFiltersType) => void;
}

/**
 * Componente de filtros para proveedores.
 * Permite buscar por nombre/CUIT y filtrar por rangos de total suministrado.
 * 
 * Características:
 * - Búsqueda en tiempo real (Enter o botón Aplicar)
 * - Filtros por rango de total suministrado
 * - Botón de limpiar filtros
 * - Mantiene el estado de withDeleted al limpiar
 */
export function SupplierFilters({ filters, onFiltersChange }: SupplierFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const [minTotal, setMinTotal] = useState(filters.minTotalSupplied?.toString() || '');
  const [maxTotal, setMaxTotal] = useState(filters.maxTotalSupplied?.toString() || '');

  const handleApplyFilters = () => {
    onFiltersChange({
      ...filters,
      searchTerm: searchTerm || undefined,
      minTotalSupplied: minTotal ? Number(minTotal) : undefined,
      maxTotalSupplied: maxTotal ? Number(maxTotal) : undefined,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setMinTotal('');
    setMaxTotal('');
    onFiltersChange({
      withDeleted: filters.withDeleted, // Mantener el estado de deleted
    });
  };

  // Sincronizar con cambios externos
  useEffect(() => {
    setSearchTerm(filters.searchTerm || '');
    setMinTotal(filters.minTotalSupplied?.toString() || '');
    setMaxTotal(filters.maxTotalSupplied?.toString() || '');
  }, [filters]);

  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-2 block">
          Buscar por nombre o CUIT/CUIL
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
          />
        </div>
      </div>

      <div className="w-[180px]">
        <label className="text-sm font-medium mb-2 block">
          Total suministrado mínimo
        </label>
        <Input
          type="number"
          placeholder="Ej: 10000"
          value={minTotal}
          onChange={(e) => setMinTotal(e.target.value)}
          min="0"
          step="1000"
        />
      </div>

      <div className="w-[180px]">
        <label className="text-sm font-medium mb-2 block">
          Total suministrado máximo
        </label>
        <Input
          type="number"
          placeholder="Ej: 100000"
          value={maxTotal}
          onChange={(e) => setMaxTotal(e.target.value)}
          min="0"
          step="1000"
        />
      </div>

      <div className="flex items-end gap-2">
        <Button onClick={handleApplyFilters}>
          <Search className="mr-2 h-4 w-4" />
          Aplicar
        </Button>
        <Button variant="outline" onClick={handleClearFilters}>
          <X className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
      </div>
    </div>
  );
}
